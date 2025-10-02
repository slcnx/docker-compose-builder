// X6Demo 组件相关的类型定义

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  node: any
  nodeType: string
}

export interface NetworkModalData {
  interfaceName: string
  switchName: string
  ipConfig: 'static' | 'dynamic'
  staticIP: string
}

export interface DockerServiceConfig {
  image?: string
  build?: {
    context?: string
    dockerfile?: string
    args?: Record<string, string>
  } | string
  user?: string
  entrypoint?: string | string[]
  command?: string | string[]
  ports?: string[]
  volumes?: string[]
  networks?: string[] | Record<string, any>
  environment?: string[] | Record<string, string>
  ulimits?: Record<string, {
    soft?: number
    hard?: number
  } | number>
  restart?: string
  depends_on?: string[] | Record<string, any>
}

export interface DockerComposeData {
  version?: string
  services: Record<string, DockerServiceConfig>
  networks?: Record<string, any>
  volumes?: Record<string, any>
}

export interface NetworkInterface {
  interfaceName: string
  switchName: string
  ipConfig: 'static' | 'dynamic'
  staticIP?: string
}

export interface ContainerConfig {
  containerName: string
  image?: string
  build?: {
    context?: string
    dockerfile?: string
    args?: Record<string, string>
  } | string
  user?: string
  ports: string[]
  volumes: string[]
  environment: string[] | Record<string, string>
  ulimits?: Record<string, {
    soft?: number
    hard?: number
  } | number>
  networkInterfaces: NetworkInterface[]
  switchNetworks: Record<string, { subnet: string; gateway: string }>
  entrypoint: string
  entrypointIsArray?: boolean // 标记原始格式是否为数组
  command: string
  commandIsArray?: boolean // 标记原始格式是否为数组
  restart: string
  depends_on?: string[]
}