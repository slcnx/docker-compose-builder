import { useCallback } from 'react'
import { Graph } from '@antv/x6'
import { DockerComponentFactory } from '../utils/dockerNodes'
import { parseYaml, convertToYaml, containerConfigToService, generateNetworkConfig } from '../utils/dockerCompose'
import { NetworkInterface } from '../types'
import { useStorage } from './useStorage'

export const useDockerCompose = (
  graph: Graph | undefined,
  dockerFactory: DockerComponentFactory | undefined
) => {
  const { saveYaml, clearStorage } = useStorage()

  // 导出 Docker Compose
  const exportDockerCompose = useCallback(() => {
    if (!dockerFactory || !graph) {
      console.log('Docker Factory或Graph未初始化')
      return ''
    }

    const allNodes = graph.getNodes()
    const dockerContainers = allNodes.filter(node => node.shape === 'docker-container')

    if (dockerContainers.length === 0) {
      clearStorage()
      return '# 未找到任何Docker容器\nversion: "3.8"\nservices: {}'
    }

    const services: any = {}
    const allSwitchNetworks: any = {}
    const allNamedVolumes = new Set<string>() // 收集所有命名卷

    dockerContainers.forEach(containerNode => {
      const children = containerNode.getChildren() || []
      const containerData = containerNode.getData()
      const savedConfig = containerData?.config || {}

      // 从画布上实时读取子节点数据（只使用节点数据，不回退到 savedConfig）
      const serviceNode = children.find((child: any) => child.shape === 'docker-service')
      const serviceLabel = serviceNode?.attr('text/text')
      const serviceName = (typeof serviceLabel === 'string' ? serviceLabel : null)
        || (typeof containerNode.attr('text/text') === 'string' ? containerNode.attr('text/text') : null)
        || 'service'

      const imageNode = children.find((child: any) => child.shape === 'docker-image')
      const imageLabel = imageNode?.attr('text/text')
      const image = (typeof imageLabel === 'string' ? imageLabel : null) || 'nginx:latest'

      // 读取 user 节点
      const userNode = children.find((child: any) => child.shape === 'docker-user')
      const userLabel = userNode?.attr('text/text') || ''
      const user = (userLabel && typeof userLabel === 'string') ? userLabel.replace('user: ', '') : undefined

      // 读取 entrypoint 和 command 节点（只使用节点数据）
      const scriptNodes = children.filter((child: any) => child.shape === 'docker-script')
      let entrypoint = ''
      let command = 'tail -f /etc/hosts' // 默认值

      scriptNodes.forEach((scriptNode: any) => {
        const scriptData = scriptNode.getData()
        const scriptType = scriptData?.scriptType
        const scriptLabel = scriptNode.attr('text/text')

        if (scriptType === 'entrypoint') {
          entrypoint = scriptLabel
        } else if (scriptType === 'command' || !scriptType) {
          command = scriptLabel
        }
      })

      // 读取端口节点（只使用节点数据）
      const portNodes = children.filter((child: any) => child.shape === 'docker-port')
      const ports = portNodes.map((node: any) => node.attr('text/text'))

      // 读取卷节点（只使用节点数据）
      const volumeNodes = children.filter((child: any) => child.shape === 'docker-volume')
      const volumes = volumeNodes.map((node: any) => node.attr('text/text'))

      // 收集命名卷（区分命名卷和主机卷）
      volumes.forEach(volume => {
        if (volume && volume.includes(':')) {
          const [source] = volume.split(':')
          // 命名卷：不以 / 或 . 开头
          if (!source.startsWith('/') && !source.startsWith('.')) {
            allNamedVolumes.add(source)
          }
        }
      })

      // 读取网络接口节点（只使用节点数据）
      const networkNodes = children.filter((child: any) => child.shape === 'docker-network')
      const networkInterfaces: NetworkInterface[] = []

      networkNodes.forEach((networkNode: any) => {
        const networkData = networkNode.getData()
        const networkInterface = networkData?.networkInterface
        if (networkInterface) {
          networkInterfaces.push(networkInterface)
        }
      })

      // 构建完整配置（只保留必要的 savedConfig 数据）
      const config = {
        containerName: serviceName,
        image: image,
        user: user,
        ports: ports,
        volumes: volumes,
        environment: savedConfig.environment || [], // 环境变量暂时保留 savedConfig
        networkInterfaces: networkInterfaces,
        switchNetworks: savedConfig.switchNetworks || {}, // 交换机网络配置保留 savedConfig
        entrypoint: entrypoint,
        entrypointIsArray: savedConfig.entrypointIsArray, // 原始格式标记
        command: command,
        commandIsArray: savedConfig.commandIsArray, // 原始格式标记
        restart: savedConfig.restart || 'unless-stopped' // 重启策略保留 savedConfig
      }

      services[serviceName] = containerConfigToService(config)

      // 收集所有交换机网络配置
      if (config.switchNetworks) {
        Object.assign(allSwitchNetworks, config.switchNetworks)
      }
    })

    const composeData: any = {
      version: '3.8',
      services,
    }

    if (Object.keys(allSwitchNetworks).length > 0) {
      composeData.networks = generateNetworkConfig(allSwitchNetworks)
    }

    // 添加命名卷配置
    if (allNamedVolumes.size > 0) {
      composeData.volumes = {}
      allNamedVolumes.forEach(volumeName => {
        composeData.volumes[volumeName] = {} // 使用默认配置
      })
    }

    const yamlString = convertToYaml(composeData)
    saveYaml(yamlString)

    return yamlString
  }, [dockerFactory, graph, saveYaml, clearStorage])

  // 导入 Docker Compose
  const importDockerCompose = useCallback((yamlContent: string) => {
    if (!dockerFactory || !graph || !yamlContent.trim()) {
      console.log('请输入有效的YAML内容')
      return false
    }

    try {
      const composeData = parseYaml(yamlContent)

      if (!composeData.services) {
        throw new Error('未找到services配置')
      }

      // 清空当前画布（可选）
      const currentNodes = graph.getNodes()
      const dockerContainers = currentNodes.filter(node => node.shape === 'docker-container')
      if (dockerContainers.length > 0) {
        const confirmClear = window.confirm('画布上已有容器，是否清空现有内容？')
        if (confirmClear) {
          graph.clearCells()
        }
      }

      // 布局配置
      const containerWidth = 750
      const containerHeight = 350
      const horizontalSpacing = 50
      const verticalSpacing = 50
      const startX = 50
      const startY = 50
      const containersPerRow = 2

      const serviceNodes: any = {}

      Object.entries(composeData.services).forEach(([serviceName, serviceConfig]: [string, any], index) => {
        // 处理端口配置
        const ports = serviceConfig.ports ? (Array.isArray(serviceConfig.ports) ? serviceConfig.ports : [serviceConfig.ports]) : []

        // 处理卷配置
        const volumes = serviceConfig.volumes ? (Array.isArray(serviceConfig.volumes) ? serviceConfig.volumes : [serviceConfig.volumes]) : []

        // 处理网络接口
        const networkInterfaces: NetworkInterface[] = []
        if (serviceConfig.networks) {
          if (Array.isArray(serviceConfig.networks)) {
            serviceConfig.networks.forEach((networkName: string, netIndex: number) => {
              networkInterfaces.push({
                interfaceName: `eth${netIndex}`,
                switchName: networkName,
                ipConfig: 'dynamic'
              })
            })
          } else if (typeof serviceConfig.networks === 'object') {
            Object.entries(serviceConfig.networks).forEach(([networkName, networkConfig]: [string, any], netIndex: number) => {
              networkInterfaces.push({
                interfaceName: `eth${netIndex}`,
                switchName: networkName,
                ipConfig: 'static',
                staticIP: networkConfig.ipv4_address || '172.20.0.100'
              })
            })
          }
        }

        // 计算容器位置
        const row = Math.floor(index / containersPerRow)
        const col = index % containersPerRow
        const x = startX + col * (containerWidth + horizontalSpacing)
        const y = startY + row * (containerHeight + verticalSpacing)

        // 创建Docker容器节点
        const { containerNode } = dockerFactory.createDockerArchitecture({
          containerName: serviceName,
          image: serviceConfig.image || 'docker.io/library/nginx:latest',
          user: serviceConfig.user,
          entrypoint: serviceConfig.entrypoint !== undefined
            ? (Array.isArray(serviceConfig.entrypoint)
              ? (serviceConfig.entrypoint.length > 0 ? serviceConfig.entrypoint.join(' ') : '[]')
              : serviceConfig.entrypoint)
            : undefined,
          command: serviceConfig.command
            ? (Array.isArray(serviceConfig.command) ? serviceConfig.command.join(' ') : serviceConfig.command)
            : 'tail -f /etc/hosts',
          ports: ports,
          volumes: volumes,
          networkInterfaces: networkInterfaces,
          position: { x, y }
        })

        serviceNodes[serviceName] = containerNode

        // 构建完整配置数据
        const switchNetworks: any = {}
        if (composeData.networks) {
          Object.entries(composeData.networks).forEach(([networkName, networkConfig]: [string, any]) => {
            switchNetworks[networkName] = {
              subnet: networkConfig.ipam?.config?.[0]?.subnet || '172.20.0.0/16',
              gateway: networkConfig.ipam?.config?.[0]?.gateway || '172.20.0.1'
            }
          })
        }

        const completeConfig = {
          containerName: serviceName,
          image: serviceConfig.image || 'docker.io/library/nginx:latest',
          user: serviceConfig.user,
          ports: ports,
          volumes: volumes,
          environment: serviceConfig.environment || [],
          networkInterfaces: networkInterfaces,
          switchNetworks: switchNetworks,
          entrypoint: serviceConfig.entrypoint !== undefined
            ? (Array.isArray(serviceConfig.entrypoint)
              ? (serviceConfig.entrypoint.length > 0 ? serviceConfig.entrypoint.join(' ') : '[]')
              : serviceConfig.entrypoint)
            : '',
          entrypointIsArray: Array.isArray(serviceConfig.entrypoint), // 记录原始格式
          command: serviceConfig.command
            ? (Array.isArray(serviceConfig.command) ? serviceConfig.command.join(' ') : serviceConfig.command)
            : 'tail -f /etc/hosts',
          commandIsArray: Array.isArray(serviceConfig.command), // 记录原始格式
          restart: serviceConfig.restart || 'unless-stopped'
        }

        containerNode.setData({ config: completeConfig })
        containerNode.attr('text/text', '')
      })

      // 自动创建网络设备（交换机）
      const createdSwitches: any = {}
      if (composeData.networks) {
        Object.keys(composeData.networks).forEach((networkName, index) => {
          let switchNode = graph.getNodes().find(node => {
            if (node.shape === 'network-switch') {
              const nodeData = node.getData()
              return nodeData?.switchName === networkName
            }
            return false
          })

          if (!switchNode) {
            const networkConfigData = composeData.networks?.[networkName]
            const networkConfig = networkConfigData ? {
              subnet: networkConfigData.ipam?.config?.[0]?.subnet,
              gateway: networkConfigData.ipam?.config?.[0]?.gateway
            } : undefined

            // 先创建交换机（不带gateway，避免自动创建路由器）
            const tempConfig = networkConfig ? { subnet: networkConfig.subnet } : undefined
            switchNode = dockerFactory.createSwitch(networkName, tempConfig)

            // 设置交换机位置
            const switchX = startX + containersPerRow * (containerWidth + horizontalSpacing) + 100
            const switchY = startY + index * 150
            switchNode.setPosition({ x: switchX, y: switchY })

            // 如果有gateway，在设置完交换机位置后创建路由器
            if (networkConfig?.gateway) {
              const routerName = `${networkName}_router`
              const routerLabel = `${routerName}\nGW: ${networkConfig.gateway}`
              const routerNode = dockerFactory.createRouter(routerLabel)

              // 设置路由器位置（在交换机右边）
              routerNode.setPosition({
                x: switchX + 200, // 在交换机右边200px
                y: switchY
              })

              // 创建交换机到路由器的连接
              graph.addEdge({
                source: switchNode,
                target: routerNode,
                router: {
                  name: 'manhattan',
                  args: {
                    padding: 1,
                    startDirections: ['right'],
                    endDirections: ['left'],
                    step: 10,
                  },
                },
                attrs: {
                  line: {
                    stroke: '#28a745',
                    strokeWidth: 3,
                  }
                },
                data: {
                  originalStroke: '#28a745',
                  originalWidth: 3,
                },
              })
            }
          }

          createdSwitches[networkName] = switchNode
        })
      }

      // 延迟创建连接，确保所有节点都已添加到 graph 中
      setTimeout(() => {
        Object.values(serviceNodes).forEach((containerNode: any) => {
          const children = containerNode.getChildren() || []
          const networkNodes = children.filter((child: any) => child.shape === 'docker-network')

          networkNodes.forEach((networkNode: any) => {
            const networkData = networkNode.getData()
            const networkInterface = networkData?.networkInterface

            if (networkInterface && networkInterface.switchName) {
              const switchNode = createdSwitches[networkInterface.switchName]
              if (switchNode) {
                // 验证节点是否存在于 graph 中
                const sourceNodeExists = graph.getCellById(networkNode.id)
                const targetNodeExists = graph.getCellById(switchNode.id)

                if (!sourceNodeExists || !targetNodeExists) {
                  console.error('节点不存在，跳过连接')
                  return
                }

                // 创建连接 - 使用节点 ID
                graph.addEdge({
                  source: networkNode.id,
                  target: switchNode.id,
                  router: {
                    name: 'manhattan',
                    args: {
                      padding: 1,
                      startDirections: ['right'],
                      endDirections: ['left'],
                      step: 10,
                    },
                  },
                  attrs: {
                    line: {
                      stroke: '#28a745',
                      strokeWidth: 2,
                      targetMarker: {
                        name: 'block',
                        width: 8,
                        height: 6,
                      },
                    },
                  },
                  zIndex: 0,
                })

                console.log(`连接网卡 ${networkInterface.interfaceName} 到交换机 ${networkInterface.switchName}`)
              }
            }
          })
        })

        console.log('所有网络连接创建完成')
      }, 100)

      // 导入成功后自动保存
      saveYaml(yamlContent)
      console.log('Docker Compose导入成功 - 包含网络拓扑')

      return true
    } catch (error: unknown) {
      console.error('导入失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`导入失败: ${errorMessage}`)
      return false
    }
  }, [dockerFactory, graph, saveYaml])

  return {
    exportDockerCompose,
    importDockerCompose,
  }
}