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
      let command = '' // 不设置默认值

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

      // 读取环境变量节点（只使用节点数据）
      const envNodes = children.filter((child: any) => child.shape === 'docker-env')
      let environment: string[] = []

      if (envNodes.length > 0) {
        const envNode = envNodes[0] // 只有一个环境变量列表节点
        const envData = envNode.getData()

        // 优先使用保存的数组数据
        if (envData?.envList && Array.isArray(envData.envList)) {
          environment = envData.envList
        } else {
          // 否则从文本中解析（按换行符分割）
          const envText = envNode.attr('text/text') || ''
          environment = envText.split('\n').filter((line: string) => line.trim())
        }
      }

      // 读取构建配置节点（只使用节点数据）
      const buildNodes = children.filter((child: any) => child.shape === 'docker-build')
      let build: any = undefined

      if (buildNodes.length > 0) {
        const buildNode = buildNodes[0]
        const buildData = buildNode.getData()

        // 优先使用保存的构建数据
        if (buildData?.build) {
          build = buildData.build
        }
      }

      // 读取 ulimits 配置节点（只使用节点数据）
      const ulimitsNodes = children.filter((child: any) => child.shape === 'docker-ulimits')
      let ulimits: any = undefined

      if (ulimitsNodes.length > 0) {
        const ulimitsNode = ulimitsNodes[0]
        const ulimitsData = ulimitsNode.getData()

        // 优先使用保存的 ulimits 数据
        if (ulimitsData?.ulimits) {
          ulimits = ulimitsData.ulimits
        }
      }

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
      const config: any = {
        containerName: serviceName,
        user: user,
        ports: ports,
        volumes: volumes,
        environment: environment.length > 0 ? environment : (savedConfig.environment || []), // 优先使用节点数据
        networkInterfaces: networkInterfaces,
        switchNetworks: savedConfig.switchNetworks || {}, // 交换机网络配置保留 savedConfig
        entrypoint: entrypoint,
        entrypointIsArray: savedConfig.entrypointIsArray, // 原始格式标记
        command: command,
        commandIsArray: savedConfig.commandIsArray, // 原始格式标记
        restart: savedConfig.restart || 'unless-stopped', // 重启策略保留 savedConfig
        depends_on: savedConfig.depends_on || [] // 依赖关系保留 savedConfig
      }

      // 添加 image 或 build 配置（至少有一个）
      if (build) {
        config.build = build
      }
      if (image && image !== 'nginx:latest') {
        config.image = image
      } else if (!build) {
        // 如果既没有 build 也没有有效的 image，使用默认 image
        config.image = image
      }

      // 添加 ulimits 配置
      if (ulimits) {
        config.ulimits = ulimits
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

        // 处理环境变量
        let environment: string[] = []
        if (serviceConfig.environment) {
          if (Array.isArray(serviceConfig.environment)) {
            environment = serviceConfig.environment
          } else if (typeof serviceConfig.environment === 'object') {
            // 如果是对象格式，转换为数组格式
            environment = Object.entries(serviceConfig.environment).map(([key, value]) => `${key}=${value}`)
          }
        }

        // 创建Docker容器节点
        const { containerNode } = dockerFactory.createDockerArchitecture({
          containerName: serviceName,
          image: serviceConfig.image,
          build: serviceConfig.build,
          user: serviceConfig.user,
          entrypoint: serviceConfig.entrypoint !== undefined
            ? (Array.isArray(serviceConfig.entrypoint)
              ? (serviceConfig.entrypoint.length > 0 ? serviceConfig.entrypoint.join(' ') : '[]')
              : serviceConfig.entrypoint)
            : undefined,
          command: serviceConfig.command
            ? (Array.isArray(serviceConfig.command) ? serviceConfig.command.join(' ') : serviceConfig.command)
            : undefined,
          ports: ports,
          volumes: volumes,
          environment: environment,
          ulimits: serviceConfig.ulimits,
          networkInterfaces: networkInterfaces,
          position: { x, y }
        })

        serviceNodes[serviceName] = containerNode

        // 构建完整配置数据
        const switchNetworks: any = {}
        if (composeData.networks) {
          Object.entries(composeData.networks).forEach(([networkName, networkConfig]: [string, any]) => {
            switchNetworks[networkName] = {
              subnet: networkConfig?.ipam?.config?.[0]?.subnet || '172.20.0.0/16',
              gateway: networkConfig?.ipam?.config?.[0]?.gateway || '172.20.0.1'
            }
          })
        }

        // 处理 depends_on 配置
        let dependsOn: string[] = []
        if (serviceConfig.depends_on) {
          if (Array.isArray(serviceConfig.depends_on)) {
            dependsOn = serviceConfig.depends_on
          } else if (typeof serviceConfig.depends_on === 'object') {
            dependsOn = Object.keys(serviceConfig.depends_on)
          }
        }

        const completeConfig: any = {
          containerName: serviceName,
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
            : undefined,
          commandIsArray: Array.isArray(serviceConfig.command), // 记录原始格式
          restart: serviceConfig.restart || 'unless-stopped',
          depends_on: dependsOn
        }

        // 添加 image 或 build 配置
        if (serviceConfig.build) {
          completeConfig.build = serviceConfig.build
        }
        if (serviceConfig.image) {
          completeConfig.image = serviceConfig.image
        } else if (!serviceConfig.build) {
          // 如果既没有 build 也没有 image，使用默认值
          completeConfig.image = 'docker.io/library/nginx:latest'
        }

        // 添加 ulimits 配置
        if (serviceConfig.ulimits) {
          completeConfig.ulimits = serviceConfig.ulimits
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
                source: {
                  cell: switchNode.id,
                  anchor: {
                    name: 'center',
                  },
                  connectionPoint: {
                    name: 'boundary',
                  },
                },
                target: {
                  cell: routerNode.id,
                  anchor: {
                    name: 'center',
                  },
                  connectionPoint: {
                    name: 'boundary',
                  },
                },
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
                zIndex: 2,
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
                  source: {
                    cell: networkNode.id,
                    anchor: {
                      name: 'center',
                    },
                    connectionPoint: {
                      name: 'boundary',
                    },
                  },
                  target: {
                    cell: switchNode.id,
                    anchor: {
                      name: 'center',
                    },
                    connectionPoint: {
                      name: 'boundary',
                    },
                  },
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
                  zIndex: 1,
                })

                console.log(`连接网卡 ${networkInterface.interfaceName} 到交换机 ${networkInterface.switchName}`)
              }
            }
          })
        })

        console.log('所有网络连接创建完成')

        // 创建依赖关系连接
        // 用于记录每个节点的入端口和出端口（每个节点最多2个端口）
        const nodeInPorts: Record<string, { portId: string; group: string }> = {}
        const nodeOutPorts: Record<string, { portId: string; group: string }> = {}
        // 用于记录出边数量（用于计算偏移）
        const outEdgeCounters: Record<string, number> = {}

        Object.entries(composeData.services).forEach(([serviceName, serviceConfig]: [string, any]) => {
          const currentNode = serviceNodes[serviceName]
          if (!currentNode) return

          const containerData = currentNode.getData()
          const dependsOn = containerData?.config?.depends_on || []

          dependsOn.forEach((dependencyName: string) => {
            const dependencyNode = serviceNodes[dependencyName]
            if (dependencyNode) {
              // 获取节点位置
              const sourceBBox = dependencyNode.getBBox()
              const targetBBox = currentNode.getBBox()

              // 计算相对位置，决定使用哪个方向的锚点
              const dx = targetBBox.center.x - sourceBBox.center.x
              const dy = targetBBox.center.y - sourceBBox.center.y

              // 根据相对位置智能选择锚点方向
              let sourceDirection: string
              let targetDirection: string

              if (Math.abs(dx) > Math.abs(dy)) {
                // 水平方向距离更大
                if (dx > 0) {
                  // 目标在源的右侧
                  sourceDirection = 'right'
                  targetDirection = 'left'
                } else {
                  // 目标在源的左侧
                  sourceDirection = 'left'
                  targetDirection = 'right'
                }
              } else {
                // 垂直方向距离更大
                if (dy > 0) {
                  // 目标在源的下方
                  sourceDirection = 'bottom'
                  targetDirection = 'top'
                } else {
                  // 目标在源的上方
                  sourceDirection = 'top'
                  targetDirection = 'bottom'
                }
              }

              // 源节点：所有出边共用同一个出端口
              let sourcePortInfo = nodeOutPorts[dependencyNode.id]
              if (!sourcePortInfo) {
                // 第一次创建出端口，使用当前方向
                sourcePortInfo = {
                  portId: 'out-port',
                  group: sourceDirection
                }
                nodeOutPorts[dependencyNode.id] = sourcePortInfo

                const existingPorts = dependencyNode.getPorts()
                const portExists = existingPorts.some((p: any) => p.id === 'out-port')

                if (!portExists) {
                  dependencyNode.addPort({
                    id: 'out-port',
                    group: sourceDirection,
                  })
                }
              }

              // 目标节点：所有入边共用同一个入端口
              let targetPortInfo = nodeInPorts[currentNode.id]
              if (!targetPortInfo) {
                // 第一次创建入端口，使用当前方向
                targetPortInfo = {
                  portId: 'in-port',
                  group: targetDirection
                }
                nodeInPorts[currentNode.id] = targetPortInfo

                const existingPorts = currentNode.getPorts()
                const portExists = existingPorts.some((p: any) => p.id === 'in-port')

                if (!portExists) {
                  currentNode.addPort({
                    id: 'in-port',
                    group: targetDirection,
                  })
                }
              }

              // 计算出边数量用于偏移
              const outEdgeCount = (outEdgeCounters[dependencyNode.id] || 0)
              outEdgeCounters[dependencyNode.id] = outEdgeCount + 1

              // 根据边的数量计算偏移量
              const offsetValue = 32 + (outEdgeCount % 3) * 16 // 32, 48, 64 循环

              // 创建从被依赖容器到依赖容器的连线（A -> B，B依赖A）
              graph.addEdge({
                source: {
                  cell: dependencyNode.id,
                  port: sourcePortInfo.portId,
                },
                target: {
                  cell: currentNode.id,
                  port: targetPortInfo.portId,
                },
                router: {
                  name: 'er',
                  args: {
                    offset: offsetValue,
                    direction: 'H', // 水平方向优先
                  },
                },
                attrs: {
                  line: {
                    stroke: '#ff6b6b',
                    strokeWidth: 2,
                    strokeDasharray: '5 5',
                    targetMarker: {
                      name: 'block',
                      width: 8,
                      height: 6,
                    },
                  },
                },
                zIndex: 10,
                data: {
                  type: 'dependency',
                  originalStroke: '#ff6b6b',
                  originalWidth: 2,
                },
              })

              console.log(`创建依赖关系连接: ${dependencyName} -> ${serviceName} (源端口: ${sourcePortInfo.portId}, 目标端口: ${targetPortInfo.portId})`)
            }
          })
        })

        console.log('所有依赖关系连接创建完成')
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