import { Graph, Shape } from '@antv/x6'

// Docker 组件类型定义
export interface DockerComponent {
  id: string
  type: 'container' | 'image' | 'volume' | 'port' | 'network' | 'command' | 'entrypoint'
  label: string
  properties: Record<string, any>
  position?: { x: number; y: number }
}

// 注册 Docker 相关的自定义节点
export const registerDockerNodes = () => {
  // 容器节点（外框）
  Graph.registerNode(
    'docker-container',
    {
      inherit: 'rect',
      width: 700,
      height: 320,
      attrs: {
        body: {
          stroke: '#333',
          strokeWidth: 2,
          fill: 'transparent',
          strokeDasharray: '5,5',
          cursor: 'move',
        },
        text: {
          fontSize: 12,
          fill: '#333',
          textAnchor: 'start',
          refX: 10,
          refY: 15,
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 服务组件节点 (如 Nginx)
  Graph.registerNode(
    'docker-service',
    {
      inherit: 'rect',
      width: 120,
      height: 50,
      attrs: {
        body: {
          stroke: '#f39c12',
          strokeWidth: 1,
          fill: '#fff3cd',
          rx: 8,
          ry: 8,
        },
        text: {
          fontSize: 12,
          fill: '#333',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#f39c12',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#f39c12',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#f39c12',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#f39c12',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 脚本/命令节点
  Graph.registerNode(
    'docker-script',
    {
      inherit: 'rect',
      width: 140,
      height: 40,
      attrs: {
        body: {
          stroke: '#17a2b8',
          strokeWidth: 1,
          fill: '#d1ecf1',
          rx: 6,
          ry: 6,
        },
        text: {
          fontSize: 11,
          fill: '#333',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 镜像节点
  Graph.registerNode(
    'docker-image',
    {
      inherit: 'rect',
      width: 320,
      height: 40,
      attrs: {
        body: {
          stroke: '#6f42c1',
          strokeWidth: 1,
          fill: '#e2d9f3',
          rx: 6,
          ry: 6,
        },
        text: {
          fontSize: 12,
          fill: '#333',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6f42c1',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6f42c1',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6f42c1',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6f42c1',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 卷节点
  Graph.registerNode(
    'docker-volume',
    {
      inherit: 'ellipse',
      width: 180,
      height: 50,
      attrs: {
        body: {
          stroke: '#20c997',
          strokeWidth: 2,
          fill: '#d4edda',
        },
        text: {
          fontSize: 10,
          fill: '#333',
          textWrap: {
            width: -20,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#20c997',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#20c997',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#20c997',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#20c997',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 用户节点
  Graph.registerNode(
    'docker-user',
    {
      inherit: 'rect',
      width: 100,
      height: 25,
      attrs: {
        body: {
          stroke: '#fd7e14',
          strokeWidth: 1,
          fill: '#fff3cd',
          rx: 4,
        },
        text: {
          fontSize: 10,
          fill: '#333',
          fontWeight: 'bold',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#fd7e14',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#fd7e14',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#fd7e14',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#fd7e14',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 端口节点
  Graph.registerNode(
    'docker-port',
    {
      inherit: 'polygon',
      width: 80,
      height: 40,
      attrs: {
        body: {
          refPoints: '0,10 60,0 80,10 60,20 0,10',
          stroke: '#dc3545',
          strokeWidth: 1,
          fill: '#f8d7da',
        },
        text: {
          fontSize: 12,
          fill: '#333',
          fontWeight: 'bold',
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#dc3545',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#dc3545',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#dc3545',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#dc3545',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 网络接口节点
  Graph.registerNode(
    'docker-network',
    {
      inherit: 'polygon',
      width: 120,
      height: 40,
      attrs: {
        body: {
          refPoints: '0,20 20,0 100,0 120,20 100,40 20,40',
          stroke: '#6c757d',
          strokeWidth: 1,
          fill: '#e9ecef',
        },
        text: {
          fontSize: 11,
          fill: '#333',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6c757d',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6c757d',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6c757d',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#6c757d',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 环境变量列表节点
  Graph.registerNode(
    'docker-env',
    {
      inherit: 'rect',
      width: 200,
      height: 80,
      attrs: {
        body: {
          stroke: '#17a2b8',
          strokeWidth: 1,
          fill: '#d1ecf1',
          rx: 5,
          ry: 5,
        },
        text: {
          fontSize: 10,
          fill: '#0c5460',
          textAnchor: 'start',
          textVerticalAnchor: 'top',
          refX: 5,
          refY: 5,
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: false,
          },
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 3,
                magnet: true,
                stroke: '#17a2b8',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'top' },
          { group: 'right' },
          { group: 'bottom' },
          { group: 'left' },
        ],
      },
    },
    true,
  )

  // 交换机节点
  Graph.registerNode(
    'network-switch',
    {
      inherit: 'rect',
      width: 100,
      height: 60,
      attrs: {
        body: {
          stroke: '#007bff',
          strokeWidth: 2,
          fill: '#e7f3ff',
          rx: 8,
          ry: 8,
        },
        text: {
          fontSize: 12,
          fill: '#007bff',
          fontWeight: 'bold',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#007bff',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#007bff',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#007bff',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#007bff',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'left', id: 'port1' },
          { group: 'right', id: 'port2' },
          { group: 'top', id: 'port3' },
          { group: 'bottom', id: 'port4' },
        ],
      },
    },
    true,
  )

  // 路由器节点
  Graph.registerNode(
    'network-router',
    {
      inherit: 'rect',
      width: 120,
      height: 80,
      attrs: {
        body: {
          stroke: '#28a745',
          strokeWidth: 2,
          fill: '#e8f5e8',
          rx: 10,
          ry: 10,
        },
        text: {
          fontSize: 12,
          fill: '#28a745',
          fontWeight: 'bold',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
      ports: {
        groups: {
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#28a745',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#28a745',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#28a745',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          { group: 'left', id: 'lan1' },
          { group: 'right', id: 'lan2' },
          { group: 'top', id: 'wan' },
        ],
      },
    },
    true,
  )
}

// Docker 组件工厂
export class DockerComponentFactory {
  private graph: Graph
  private components: Map<string, DockerComponent> = new Map()
  private autoLayout: boolean = true

  constructor(graph: Graph) {
    this.graph = graph
  }

  // 添加容器
  addContainer(name: string, properties: Record<string, any> = {}) {
    const component: DockerComponent = {
      id: `container-${Date.now()}`,
      type: 'container',
      label: name,
      properties,
    }

    const node = this.graph.addNode({
      shape: 'docker-container',
      label: '',
      position: this.getNextPosition('container'),
    })

    this.components.set(component.id, { ...component, position: node.getPosition() })

    if (this.autoLayout) {
      this.performAutoLayout()
    }

    return { component, node }
  }

  // 添加服务
  addService(name: string, containerNode: any, properties: Record<string, any> = {}) {
    const component: DockerComponent = {
      id: `service-${Date.now()}`,
      type: 'container',
      label: name,
      properties,
    }

    const node = this.graph.addNode({
      shape: 'docker-service',
      label: name,
      position: { x: 20, y: 40 }, // 相对于容器的位置
    })

    this.components.set(component.id, { ...component, position: node.getPosition() })
    return { component, node }
  }

  // 添加脚本/命令
  addScript(text: string, containerNode: any, type: 'entrypoint' | 'command' = 'command') {
    const component: DockerComponent = {
      id: `script-${Date.now()}`,
      type,
      label: text,
      properties: { text },
    }

    const node = this.graph.addNode({
      shape: 'docker-script',
      label: text,
      position: {
        x: 180,
        y: 40 + (type === 'entrypoint' ? 0 : 50), // 相对位置
      },
    })

    this.components.set(component.id, { ...component, position: node.getPosition() })
    return { component, node }
  }

  // 添加镜像
  addImage(imageName: string, containerNode: any) {
    const component: DockerComponent = {
      id: `image-${Date.now()}`,
      type: 'image',
      label: imageName,
      properties: { imageName },
    }

    const node = this.graph.addNode({
      shape: 'docker-image',
      label: imageName,
      position: {
        x: 20,
        y: 150, // 相对位置
      },
    })

    this.components.set(component.id, { ...component, position: node.getPosition() })
    return { component, node }
  }

  // 添加卷
  addVolume(volumeMapping: string, containerNode: any, index: number = 0) {
    const component: DockerComponent = {
      id: `volume-${Date.now()}`,
      type: 'volume',
      label: volumeMapping,
      properties: { volumeMapping },
    }

    const node = this.graph.addNode({
      shape: 'docker-volume',
      label: volumeMapping,
      position: {
        x: 20 + (index * 200),
        y: 220, // 相对位置
      },
    })

    this.components.set(component.id, { ...component, position: node.getPosition() })
    return { component, node }
  }

  // 添加端口
  addPort(port: string, containerNode: any, index: number = 0) {
    const component: DockerComponent = {
      id: `port-${Date.now()}`,
      type: 'port',
      label: port,
      properties: { port },
    }

    const node = this.graph.addNode({
      shape: 'docker-port',
      label: port,
      position: {
        x: 1000, // 容器右侧
        y: 20 + (index * 50), // 相对位置
      },
    })

    this.components.set(component.id, { ...component, position: node.getPosition() })
    return { component, node }
  }

  // 添加网络接口
  addNetwork(networkInfo: string, containerNode: any, index: number = 0) {
    const component: DockerComponent = {
      id: `network-${Date.now()}`,
      type: 'network',
      label: networkInfo,
      properties: { networkInfo },
    }

    const node = this.graph.addNode({
      shape: 'docker-network',
      label: networkInfo,
      position: {
        x: 150, // 容器右侧
        y: 240 + (index * 50), // 相对位置，底部区域
      },
    })

    this.components.set(component.id, { ...component, position: node.getPosition() })
    return { component, node }
  }

  // 创建完整的 Docker 容器架构
  createDockerArchitecture(config: {
    containerName: string
    image: string
    user?: string
    entrypoint?: string
    command?: string
    ports?: string[]
    volumes?: string[]
    environment?: string[] // 添加环境变量
    networkInterfaces?: Array<{
      interfaceName: string
      switchName: string
      ipConfig: 'static' | 'dynamic'
      staticIP?: string
    }>
    position?: { x: number; y: number } // 添加可选的位置参数
  }) {
    // 首先创建父容器节点
    const containerPosition = config.position || this.getNextPosition('container')
    const parent = this.graph.addNode({
      shape: 'docker-container',
      x: containerPosition.x,
      y: containerPosition.y,
      width: 720, // 增加宽度以容纳右移的网络接口
      height: 320,
      zIndex: 1,
      label: '',
      data: { config }, // 保存配置数据到节点
      attrs: {
        label: {
          refY: 15,
          fontSize: 12,
        },
      },
    })

    const childNodes: any[] = []

    // 创建服务节点 - 左上角 (使用容器名称)
    const serviceNode = this.graph.addNode({
      shape: 'docker-service',
      x: containerPosition.x + 20,
      y: containerPosition.y + 40,
      label: config.containerName,
      zIndex: 10,
    })
    childNodes.push(serviceNode)

    // 创建用户节点 - 服务节点右侧
    if (config.user) {
      const userNode = this.graph.addNode({
        shape: 'docker-user',
        x: containerPosition.x + 180,
        y: containerPosition.y + 40,
        label: `user: ${config.user}`,
        zIndex: 10,
      })
      childNodes.push(userNode)
    }

    // 创建脚本节点 - 中上区域水平排列
    if (config.entrypoint) {
      const entrypointNode = this.graph.addNode({
        shape: 'docker-script',
        x: containerPosition.x + 20,
        y: containerPosition.y + 100,
        label: config.entrypoint,
        zIndex: 10,
        data: { scriptType: 'entrypoint' }, // 标记脚本类型
      })
      childNodes.push(entrypointNode)
    }
    if (config.command) {
      const commandNode = this.graph.addNode({
        shape: 'docker-script',
        x: containerPosition.x + 200,
        y: containerPosition.y + 100,
        label: config.command,
        data: { scriptType: 'command' }, // 标记脚本类型
        zIndex: 10,
      })
      childNodes.push(commandNode)
    }

    // 创建镜像节点 - 中间位置
    const imageNode = this.graph.addNode({
      shape: 'docker-image',
      x: containerPosition.x + 20,
      y: containerPosition.y + 160,
      label: config.image,
      zIndex: 10,
    })
    childNodes.push(imageNode)

    // 创建卷节点 - 底部水平排列
    config.volumes?.forEach((volume, index) => {
      const volumeNode = this.graph.addNode({
        shape: 'docker-volume',
        x: containerPosition.x + 20 + (index * 200),
        y: containerPosition.y + 220,
        label: volume,
        zIndex: 10,
      })
      childNodes.push(volumeNode)
    })

    // 创建环境变量列表节点 - 底部（在卷节点下方）
    if (config.environment && config.environment.length > 0) {
      // 将所有环境变量合并为一个列表，用换行符分隔
      const envList = config.environment.join('\n')
      const envNode = this.graph.addNode({
        shape: 'docker-env',
        x: containerPosition.x + 20,
        y: containerPosition.y + 270,
        label: envList,
        zIndex: 10,
        data: { envList: config.environment }, // 保存原始环境变量数组
      })
      childNodes.push(envNode)
    }

    // 创建端口节点 - 右侧上方垂直排列，增加间距
    config.ports?.forEach((port, index) => {
      const portNode = this.graph.addNode({
        shape: 'docker-port',
        x: containerPosition.x + 380,
        y: containerPosition.y + 40 + (index * 50), // 增加间距到50px
        label: port,
        zIndex: 10,
      })
      childNodes.push(portNode)
    })

    // 创建网络接口节点 - 放置在容器右下方，便于连接到交换机
    config.networkInterfaces?.forEach((networkInterface, index) => {
      // 创建网络接口标签
      const interfaceLabel = networkInterface.ipConfig === 'static' && networkInterface.staticIP
        ? `${networkInterface.interfaceName}\n${networkInterface.staticIP}`
        : `${networkInterface.interfaceName}\ndynamic`

      const networkNode = this.graph.addNode({
        shape: 'docker-network',
        x: containerPosition.x + 580, // 容器右侧边缘附近
        y: containerPosition.y + 240 + (index * 55), // 从底部区域开始，向下排列
        label: interfaceLabel,
        zIndex: 10,
      })
      childNodes.push(networkNode)

      // 保存网络接口信息到节点数据中，供导入时自动连接使用
      networkNode.setData({
        networkInterface: networkInterface,
        isConnected: false
      })

      console.log(`创建网络接口: ${networkInterface.interfaceName} -> ${networkInterface.switchName}`, networkInterface)
    })

    // 建立父子关系 - 这是关键步骤
    childNodes.forEach(child => {
      parent.addChild(child)
    })

    // 记录组件信息
    const component: DockerComponent = {
      id: `container-${Date.now()}`,
      type: 'container',
      label: config.containerName,
      properties: config,
      position: parent.getPosition(),
    }
    this.components.set(component.id, component)

    return { containerNode: parent, childNodes }
  }

  // 获取下一个位置（简单的自动布局）
  private getNextPosition(type: string) {
    const existingNodes = this.graph.getNodes()
    const containerNodes = existingNodes.filter(node => node.shape === 'docker-container')

    return {
      x: 50,
      y: 50 + (containerNodes.length * 350), // 每个容器间隔350px
    }
  }

  // 执行自动布局
  private performAutoLayout() {
    // 这里可以实现更复杂的自动布局算法
    // 目前使用简单的垂直排列
  }

  // 获取所有组件
  getComponents() {
    return Array.from(this.components.values())
  }

  // 清除所有组件
  clear() {
    this.components.clear()
    this.graph.clearCells()
  }

  // 获取画布上所有Docker容器数量
  getContainerCount(): number {
    const containerNodes = this.graph.getNodes().filter(node => node.shape === 'docker-container')
    return containerNodes.length
  }

  // 获取所有容器信息
  getAllContainers() {
    const containerNodes = this.graph.getNodes().filter(node => node.shape === 'docker-container')
    return containerNodes.map(node => ({
      id: node.id,
      name: node.attr('text/text') || 'container',
      position: node.getPosition(),
      children: (node.getChildren() || []).map(child => ({
        id: child.id,
        shape: child.shape,
        label: child.attr('text/text') || '',
      }))
    }))
  }

  // 获取DAG关系分析
  getDAGRelationships() {
    const containers = this.getAllContainers()
    const edges = this.graph.getEdges()

    const relationships = {
      containers: containers,
      connections: edges.map(edge => ({
        id: edge.id,
        source: edge.getSourceNode()?.id,
        target: edge.getTargetNode()?.id,
        sourceLabel: edge.getSourceNode()?.attr('text/text') || '',
        targetLabel: edge.getTargetNode()?.attr('text/text') || '',
      })),
      totalContainers: containers.length,
      totalConnections: edges.length,
    }

    return relationships
  }

  // 获取拓扑排序（用于确定部署顺序）
  getTopologicalOrder() {
    const containers = this.getAllContainers()
    const edges = this.graph.getEdges()

    // 构建邻接列表
    const graph: { [key: string]: string[] } = {}
    const inDegree: { [key: string]: number } = {}

    // 初始化
    containers.forEach(container => {
      graph[container.id] = []
      inDegree[container.id] = 0
    })

    // 构建图
    edges.forEach(edge => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id
      if (source && target) {
        graph[source].push(target)
        inDegree[target]++
      }
    })

    // Kahn算法实现拓扑排序
    const queue: string[] = []
    const result: string[] = []

    // 找到所有入度为0的节点
    Object.keys(inDegree).forEach(nodeId => {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId)
      }
    })

    while (queue.length > 0) {
      const current = queue.shift()!
      result.push(current)

      graph[current].forEach(neighbor => {
        inDegree[neighbor]--
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor)
        }
      })
    }

    // 检查是否有环
    const hasCircle = result.length !== containers.length

    return {
      order: result.map(id => {
        const container = containers.find(c => c.id === id)
        return {
          id,
          name: container?.name || 'Unknown'
        }
      }),
      hasCircle,
      isValidDAG: !hasCircle
    }
  }

  // 创建交换机
  createSwitch(switchName: string, networkConfig?: { subnet?: string; gateway?: string }) {
    const switchPosition = this.getNextSwitchPosition()

    // 构建交换机标签，只包含网段信息，网关信息显示在路由器上
    let switchLabel = switchName
    if (networkConfig && networkConfig.subnet) {
      switchLabel = `${switchName}\n${networkConfig.subnet}`
    }

    const switchNode = this.graph.addNode({
      shape: 'network-switch',
      x: switchPosition.x,
      y: switchPosition.y,
      label: switchLabel,
      zIndex: 5,
      data: {
        switchName: switchName,
        networkConfig: networkConfig
      }
    })

    // 如果有网关配置，自动创建路由器并连接
    if (networkConfig && networkConfig.gateway) {
      this.createAndConnectRouter(switchNode, switchName, networkConfig)
    }

    console.log(`创建交换机: ${switchName}`, networkConfig)
    return switchNode
  }

  // 创建并连接路由器
  private createAndConnectRouter(switchNode: any, switchName: string, networkConfig: any) {
    const routerName = `${switchName}_router`

    // 检查是否已存在对应的路由器
    const existingRouters = this.graph.getNodes().filter(node => {
      const label = node.attr('text/text')
      return node.shape === 'network-router' && typeof label === 'string' && label.includes(routerName)
    })

    if (existingRouters.length === 0) {
      // 创建路由器，网关信息显示在路由器上
      const routerLabel = networkConfig?.gateway
        ? `${routerName}\nGW: ${networkConfig.gateway}`
        : routerName

      const routerNode = this.createRouter(routerLabel)

      // 设置路由器位置（在交换机右边）
      const switchPos = switchNode.getPosition()
      routerNode.setPosition({
        x: switchPos.x + 100, // 在交换机右边100px
        y: switchPos.y
      })

      // 创建连接
      this.graph.addEdge({
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
            targetMarker: {
              name: 'block',
              width: 8,
              height: 6,
            },
          },
        },
        zIndex: 2,
      })

      console.log(`创建路由器并连接: ${routerName}`)
    }
  }

  // 创建路由器
  createRouter(routerName: string = 'Router') {
    const routerPosition = this.getNextRouterPosition()

    const routerNode = this.graph.addNode({
      shape: 'network-router',
      x: routerPosition.x,
      y: routerPosition.y,
      label: routerName,
      zIndex: 5,
    })

    console.log(`创建路由器: ${routerName}`)
    return routerNode
  }

  // 获取交换机下一个位置
  private getNextSwitchPosition() {
    const existingSwitches = this.graph.getNodes().filter(node => node.shape === 'network-switch')

    return {
      x: 800 + (existingSwitches.length % 3) * 150, // 每行3个
      y: 100 + Math.floor(existingSwitches.length / 3) * 150, // 每排间隔150px
    }
  }

  // 获取路由器下一个位置（自动放在所有交换机右侧）
  private getNextRouterPosition() {
    const existingRouters = this.graph.getNodes().filter(node => node.shape === 'network-router')
    const existingSwitches = this.graph.getNodes().filter(node => node.shape === 'network-switch')

    // 计算所有交换机的最右侧位置
    let maxSwitchX = 800 // 默认值
    if (existingSwitches.length > 0) {
      maxSwitchX = Math.max(...existingSwitches.map(sw => sw.getPosition().x))
    }

    // 路由器放在交换机右侧 200px 处
    const routerStartX = maxSwitchX + 200

    return {
      x: routerStartX + (existingRouters.length % 2) * 150, // 每行2个
      y: 100 + Math.floor(existingRouters.length / 2) * 150, // 每排间隔150px
    }
  }

  // 连接网卡到交换机（如果交换机不存在则自动创建）
  private connectNetworkToSwitch(networkNode: any, switchName: string) {
    // 查找对应的交换机节点
    let switches = this.graph.getNodes().filter(node =>
      node.shape === 'network-switch' && (node.attr('text/text') || '') === switchName
    )

    let switchNode: any

    if (switches.length > 0) {
      // 使用现有交换机
      switchNode = switches[0]
      console.log(`找到现有交换机: ${switchName}`)
    } else {
      // 自动创建交换机
      console.log(`未找到交换机 ${switchName}，自动创建`)
      switchNode = this.createSwitch(switchName)
    }

    // 创建连接线
    const edge = this.graph.addEdge({
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
          stroke: '#6c757d',
          strokeWidth: 2,
          strokeDasharray: '2,2',
        },
      },
      data: {
        originalStroke: '#6c757d',
        originalWidth: 2,
      },
      labels: [
        {
          attrs: {
            text: {
              text: '网络连接',
              fontSize: 10,
              fill: '#666',
            },
          },
        },
      ],
    })

    console.log(`连接网卡 ${networkNode.attr('text/text') || 'network'} 到交换机 ${switchName}`)
    return { edge, switchNode }
  }

  // 自动连接bridge类型的交换机到路由器
  private connectSwitchToRouter(switchNode: any) {
    // 查找或创建默认路由器
    let routers = this.graph.getNodes().filter(node => node.shape === 'network-router')

    if (routers.length === 0) {
      routers = [this.createRouter('Default Router')]
    }

    const router = routers[0]

    // 检查是否已经连接到路由器（避免重复连接）
    const existingEdges = this.graph.getEdges().filter(edge =>
      edge.getSourceNode()?.id === switchNode.id && edge.getTargetNode()?.id === router.id
    )

    if (existingEdges.length > 0) {
      console.log(`交换机 ${switchNode.attr('text/text') || 'switch'} 已经连接到路由器，跳过`)
      return existingEdges[0]
    }

    // 创建连接线
    const edge = this.graph.addEdge({
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
        cell: router.id,
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
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
          },
        },
      },
      data: {
        originalStroke: '#28a745',
        originalWidth: 3,
      },
      labels: [
        {
          attrs: {
            text: {
              text: 'Bridge',
              fontSize: 10,
              fill: '#28a745',
            },
          },
        },
      ],
    })

    console.log(`连接交换机 ${switchNode.attr('text/text') || 'switch'} 到路由器`)
    return edge
  }

  // 手动连接网卡到交换机
  manualConnectNetworkToSwitch(networkNodeId: string, switchName: string, switchNetworkConfig?: { subnet: string, gateway: string }) {
    const networkNode = this.graph.getCellById(networkNodeId)
    if (!networkNode || networkNode.shape !== 'docker-network') {
      console.error('无效的网卡节点')
      return false
    }

    // 检查是否已经连接到交换机
    const existingEdges = this.graph.getConnectedEdges(networkNode).filter(edge => {
      const target = edge.getTargetNode()
      return target && target.shape === 'network-switch'
    })

    if (existingEdges.length > 0) {
      console.log('网卡已经连接到交换机，请先断开连接')
      return false
    }

    // 查找或创建交换机
    let switches = this.graph.getNodes().filter(node =>
      node.shape === 'network-switch' && (node.attr('text/text') || '') === switchName
    )

    let switchNode: any
    if (switches.length > 0) {
      switchNode = switches[0]
    } else {
      switchNode = this.createSwitch(switchName)
    }

    // 创建连接
    const result = this.connectNetworkToSwitch(networkNode, switchName)

    // 更新网卡节点状态，保留原有的网络接口信息并添加交换机配置
    const currentData = networkNode.getData() || {}
    const currentNetworkInterface = currentData.networkInterface || {}

    // 如果网卡有静态IP配置，确保标签正确显示
    if (currentNetworkInterface.ipConfig === 'static' && currentNetworkInterface.staticIP) {
      const interfaceLabel = `${currentNetworkInterface.interfaceName}\n${currentNetworkInterface.staticIP}`
      networkNode.attr('text/text', interfaceLabel)
    }

    networkNode.setData({
      ...currentData,
      isConnected: true,
      connectedSwitch: switchName,
      switchNetworkConfig: switchNetworkConfig, // 保存交换机网络配置
      // 确保网络接口信息完整
      networkInterface: {
        ...currentNetworkInterface,
        switchName: switchName // 更新交换机名称
      }
    })

    // 自动连接交换机到路由器
    if (result && result.switchNode) {
      setTimeout(() => {
        this.connectSwitchToRouter(result.switchNode)
      }, 50)
    }

    console.log(`手动连接网卡 ${networkNode.attr('text/text') || 'network'} 到交换机 ${switchName}`)
    return true
  }

  // 断开网卡与交换机的连接
  disconnectNetworkFromSwitch(networkNodeId: string) {
    const networkNode = this.graph.getCellById(networkNodeId)
    if (!networkNode || networkNode.shape !== 'docker-network') {
      console.error('无效的网卡节点')
      return false
    }

    // 查找连接到交换机的边
    const connectedEdges = this.graph.getConnectedEdges(networkNode).filter(edge => {
      const target = edge.getTargetNode()
      return target && target.shape === 'network-switch'
    })

    if (connectedEdges.length === 0) {
      console.log('网卡未连接到任何交换机')
      return false
    }

    // 删除连接边
    connectedEdges.forEach(edge => {
      this.graph.removeCell(edge)
    })

    // 更新网卡节点状态
    networkNode.setData({
      ...networkNode.getData(),
      isConnected: false,
      connectedSwitch: undefined
    })

    console.log(`断开网卡 ${networkNode.attr('text/text') || 'network'} 的连接`)
    return true
  }

  // 获取所有网卡节点
  getNetworkNodes() {
    return this.graph.getNodes().filter(node => node.shape === 'docker-network')
  }

  // 获取所有交换机节点
  getSwitchNodes() {
    return this.graph.getNodes().filter(node => node.shape === 'network-switch')
  }

  // 检查网卡是否已连接到交换机
  isNetworkConnected(networkNodeId: string) {
    const networkNode = this.graph.getCellById(networkNodeId)
    if (!networkNode) return false

    const connectedEdges = this.graph.getConnectedEdges(networkNode).filter(edge => {
      const target = edge.getTargetNode()
      return target && target.shape === 'network-switch'
    })

    return connectedEdges.length > 0
  }

  // 获取网卡连接的交换机
  getConnectedSwitch(networkNodeId: string) {
    const networkNode = this.graph.getCellById(networkNodeId)
    if (!networkNode) return null

    const connectedEdges = this.graph.getConnectedEdges(networkNode).filter(edge => {
      const target = edge.getTargetNode()
      return target && target.shape === 'network-switch'
    })

    if (connectedEdges.length > 0) {
      const switchNode = connectedEdges[0].getTargetNode()
      return switchNode ? (switchNode.attr('text/text') || null) : null
    }

    return null
  }

  // 动态添加组件方法

  // 为容器动态添加端口
  addPortToContainer(containerNode: any, port: string = '8080') {
    const children = containerNode.getChildren() || []
    const portNodes = children.filter((child: any) => child.shape === 'docker-port')

    // 计算新端口的位置
    const containerPos = containerNode.getPosition()
    const yOffset = 70 + portNodes.length * 30 // 从容器底部开始排列

    const portNode = this.graph.addNode({
      shape: 'docker-port',
      x: containerPos.x + 500,
      y: containerPos.y + yOffset,
      label: port,
      zIndex: 10,
    })

    // 添加为子节点
    containerNode.addChild(portNode)

    console.log(`添加端口: ${port}`)
    return portNode
  }

  // 为容器动态添加卷
  addVolumeToContainer(containerNode: any, volume: string = '/data:/app/data') {
    const children = containerNode.getChildren() || []
    const volumeNodes = children.filter((child: any) => child.shape === 'docker-volume')

    // 计算新卷的位置
    const containerPos = containerNode.getPosition()
    const yOffset = 180 + volumeNodes.length * 30

    const volumeNode = this.graph.addNode({
      shape: 'docker-volume',
      x: containerPos.x + 350,
      y: containerPos.y + yOffset,
      label: volume,
      zIndex: 10,
    })

    // 添加为子节点
    containerNode.addChild(volumeNode)

    console.log(`添加卷: ${volume}`)
    return volumeNode
  }

  // 为容器动态添加网络接口
  addNetworkToContainer(containerNode: any, interfaceName: string = 'eth0', switchName: string = 'default') {
    const children = containerNode.getChildren() || []
    const networkNodes = children.filter((child: any) => child.shape === 'docker-network')

    // 计算新网络接口的位置 - 放置在容器右下方，靠近底部边缘
    const containerPos = containerNode.getPosition()
    const containerHeight = containerNode.getSize().height || 320
    const yOffset = containerHeight - 80 + networkNodes.length * 55 // 从底部向上排列

    const networkNode = this.graph.addNode({
      shape: 'docker-network',
      x: containerPos.x + 580, // 移到容器右侧边缘附近
      y: containerPos.y + yOffset,
      label: interfaceName,
      zIndex: 10,
      data: {
        networkInterface: {
          interfaceName,
          switchName,
          ipConfig: 'dynamic'
        }
      }
    })

    // 添加为子节点
    containerNode.addChild(networkNode)

    console.log(`添加网络接口: ${interfaceName} -> ${switchName}`)
    return networkNode
  }

  // 删除子组件
  removeChildComponent(childNode: any) {
    const parent = childNode.getParent()
    if (parent) {
      const containerData = parent.getData() || {}
      const config = containerData.config || {}
      const childShape = childNode.shape
      const childLabel = childNode.attr('text/text')

      // 根据组件类型，清空对应的配置
      switch (childShape) {
        case 'docker-user':
          // 清空用户配置
          parent.setData({
            ...containerData,
            config: { ...config, user: undefined }
          })
          console.log(`清空容器 ${parent.attr('text/text')} 的用户配置`)
          break

        case 'docker-image':
          // 清空镜像配置（恢复默认值）
          parent.setData({
            ...containerData,
            config: { ...config, image: 'nginx:latest' }
          })
          console.log(`清空容器 ${parent.attr('text/text')} 的镜像配置`)
          break

        case 'docker-port':
          // 从端口数组中移除此端口
          const ports = (config.ports || []).filter((p: string) => p !== childLabel)
          parent.setData({
            ...containerData,
            config: { ...config, ports }
          })
          console.log(`从容器 ${parent.attr('text/text')} 移除端口 ${childLabel}`)
          break

        case 'docker-volume':
          // 从卷数组中移除此卷
          const volumes = (config.volumes || []).filter((v: string) => v !== childLabel)
          parent.setData({
            ...containerData,
            config: { ...config, volumes }
          })
          console.log(`从容器 ${parent.attr('text/text')} 移除卷 ${childLabel}`)
          break

        case 'docker-script':
          // 检查脚本类型
          const scriptData = childNode.getData()
          const scriptType = scriptData?.scriptType
          if (scriptType === 'entrypoint') {
            parent.setData({
              ...containerData,
              config: { ...config, entrypoint: '' }
            })
            console.log(`清空容器 ${parent.attr('text/text')} 的 entrypoint`)
          } else if (scriptType === 'command' || !scriptType) {
            parent.setData({
              ...containerData,
              config: { ...config, command: 'tail -f /etc/hosts' }
            })
            console.log(`清空容器 ${parent.attr('text/text')} 的 command`)
          }
          break

        case 'docker-network':
          // 从网络接口数组中移除此接口
          const networkData = childNode.getData()
          const networkInterface = networkData?.networkInterface
          if (networkInterface) {
            const networkInterfaces = (config.networkInterfaces || []).filter(
              (ni: any) => ni.interfaceName !== networkInterface.interfaceName
            )
            parent.setData({
              ...containerData,
              config: { ...config, networkInterfaces }
            })
            console.log(`从容器 ${parent.attr('text/text')} 移除网络接口 ${networkInterface.interfaceName}`)
          }
          break
      }

      // 移除父子关系
      parent.removeChild(childNode)
    }

    // 删除相关连接
    const connectedEdges = this.graph.getConnectedEdges(childNode)
    connectedEdges.forEach(edge => this.graph.removeEdge(edge))

    // 删除节点
    this.graph.removeNode(childNode)

    console.log(`删除组件: ${childNode.shape}`)
  }

  // 检查容器是否已有指定类型的唯一组件
  hasUniqueComponent(containerNode: any, componentShape: string): boolean {
    const children = containerNode.getChildren() || []
    return children.some((child: any) => child.shape === componentShape)
  }

  // 获取容器的子组件统计
  getContainerComponentStats(containerNode: any) {
    const children = containerNode.getChildren() || []

    const stats = {
      service: children.filter((child: any) => child.shape === 'docker-service').length,
      image: children.filter((child: any) => child.shape === 'docker-image').length,
      user: children.filter((child: any) => child.shape === 'docker-user').length,
      script: children.filter((child: any) => child.shape === 'docker-script').length,
      port: children.filter((child: any) => child.shape === 'docker-port').length,
      volume: children.filter((child: any) => child.shape === 'docker-volume').length,
      network: children.filter((child: any) => child.shape === 'docker-network').length,
    }

    return stats
  }
}