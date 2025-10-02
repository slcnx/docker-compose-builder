import * as YAML from 'yaml'
import { DockerComposeData, ContainerConfig } from '../types'

/**
 * 将对象转换为 YAML 格式字符串
 */
export const convertToYaml = (obj: any, indent = 0): string => {
  const spaces = '  '.repeat(indent)
  let yaml = ''

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${spaces}${key}: null\n`
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        yaml += `${spaces}${key}: []\n`
      } else {
        yaml += `${spaces}${key}:\n`
        value.forEach((item: any) => {
          if (typeof item === 'object' && item !== null) {
            // 处理对象数组项，使用紧凑格式
            const objectKeys = Object.keys(item)
            if (objectKeys.length === 0) {
              yaml += `${spaces}  - {}\n`
            } else if (objectKeys.length === 1) {
              // 单个属性的对象，放在同一行
              const [key, val] = Object.entries(item)[0]
              yaml += `${spaces}  - ${key}: ${val}\n`
            } else {
              // 多个属性的对象，第一个属性和-放在同一行
              const firstKey = objectKeys[0]
              const firstValue = item[firstKey]
              yaml += `${spaces}  - ${firstKey}: ${firstValue}\n`

              // 其余属性缩进对齐
              objectKeys.slice(1).forEach(objKey => {
                yaml += `${spaces}    ${objKey}: ${item[objKey]}\n`
              })
            }
          } else {
            // 处理字符串值，如果包含特殊字符需要加引号
            const itemStr = String(item)
            if (itemStr.includes(':') || itemStr.includes(' ') || itemStr.includes('-')) {
              yaml += `${spaces}  - "${itemStr}"\n`
            } else {
              yaml += `${spaces}  - ${itemStr}\n`
            }
          }
        })
      }
    } else if (typeof value === 'object' && value !== null) {
      // 特殊处理空对象的情况
      if (Object.keys(value).length === 0) {
        yaml += `${spaces}${key}: {}\n`
      } else {
        yaml += `${spaces}${key}:\n`
        yaml += convertToYaml(value, indent + 1)
      }
    } else {
      // 处理字符串值，如果包含特殊字符需要加引号
      const valueStr = String(value)
      if (valueStr.includes(':') || valueStr.includes('#') || valueStr.includes('"')) {
        yaml += `${spaces}${key}: "${valueStr}"\n`
      } else {
        yaml += `${spaces}${key}: ${valueStr}\n`
      }
    }
  }

  return yaml
}

/**
 * 使用 yaml 包解析 YAML
 */
export const parseYaml = (yamlString: string): DockerComposeData => {
  try {
    return YAML.parse(yamlString)
  } catch (error: unknown) {
    console.error('YAML解析错误:', error)
    const errorMessage = error instanceof Error ? error.message : 'YAML格式错误，请检查语法'
    throw new Error(errorMessage)
  }
}

/**
 * 从容器配置生成服务配置
 */
export const containerConfigToService = (config: ContainerConfig) => {
  const service: any = {}

  // 添加 image 或 build 配置
  if (config.image) {
    service.image = config.image
  }
  if (config.build) {
    service.build = config.build
  }

  // 添加用户配置
  if (config.user) {
    service.user = config.user
  }

  // 处理 entrypoint
  if (config.entrypoint) {
    if (config.entrypoint === '[]') {
      // 空数组的字符串表示，转换为真正的空数组
      service.entrypoint = []
    } else if (config.entrypoint.trim()) {
      // 根据原始格式决定输出格式
      if (config.entrypointIsArray) {
        // 原始是数组，分割为数组
        service.entrypoint = config.entrypoint.includes(' ')
          ? config.entrypoint.split(' ')
          : [config.entrypoint]
      } else {
        // 原始是字符串，保持字符串
        service.entrypoint = config.entrypoint
      }
    }
  }

  // 处理 command
  if (config.command && config.command !== 'tail -f /etc/hosts' && config.command.trim()) {
    // 根据原始格式决定输出格式
    if (config.commandIsArray) {
      // 原始是数组，分割为数组
      service.command = config.command.includes(' ')
        ? config.command.split(' ')
        : [config.command]
    } else {
      // 原始是字符串，保持字符串
      service.command = config.command
    }
  }

  // 添加端口映射
  if (config.ports && config.ports.length > 0) {
    service.ports = config.ports
  }

  // 添加卷挂载
  if (config.volumes && config.volumes.length > 0) {
    service.volumes = config.volumes
  }

  // 添加环境变量
  if (config.environment) {
    service.environment = config.environment
  }

  // 添加网络配置
  if (config.networkInterfaces && config.networkInterfaces.length > 0) {
    const networks: any = {}
    config.networkInterfaces.forEach(netInterface => {
      if (netInterface.ipConfig === 'static' && netInterface.staticIP) {
        networks[netInterface.switchName] = {
          ipv4_address: netInterface.staticIP,
        }
      } else {
        networks[netInterface.switchName] = {}
      }
    })
    service.networks = networks
  }

  // 添加重启策略
  if (config.restart) {
    service.restart = config.restart
  }

  // 添加依赖关系
  if (config.depends_on && config.depends_on.length > 0) {
    service.depends_on = config.depends_on
  }

  return service
}

/**
 * 生成网络配置
 */
export const generateNetworkConfig = (switchNetworks: Record<string, { subnet: string; gateway: string }>) => {
  const networks: any = {}

  Object.entries(switchNetworks).forEach(([networkName, networkConfig]) => {
    networks[networkName] = {
      driver: 'bridge',
      ipam: {
        config: [
          {
            subnet: networkConfig.subnet,
            gateway: networkConfig.gateway,
          },
        ],
      },
    }
  })

  return networks
}