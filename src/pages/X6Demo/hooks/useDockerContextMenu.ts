import { useState, useCallback } from 'react'
import { Graph } from '@antv/x6'
import { DockerComponentFactory } from '../utils/dockerNodes'
import { ContextMenuState, NetworkModalData } from '../types'

/**
 * Docker容器专用的右键菜单Hook
 */
export const useDockerContextMenu = (
  graph: Graph | undefined,
  dockerFactory: DockerComponentFactory | undefined
) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
    nodeType: ''
  })

  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const [currentContainerNode, setCurrentContainerNode] = useState<any>(null)
  const [networkModalData, setNetworkModalData] = useState<NetworkModalData>({
    interfaceName: '',
    switchName: '',
    ipConfig: 'dynamic',
    staticIP: ''
  })

  // 右键菜单处理函数
  const handleContextMenu = useCallback((e: MouseEvent, node: any) => {
    e.preventDefault()

    let nodeType = ''
    if (node.shape === 'docker-container') {
      nodeType = 'container'
    } else if (['docker-service', 'docker-image', 'docker-port', 'docker-volume', 'docker-network', 'docker-script', 'docker-user'].includes(node.shape)) {
      nodeType = 'component'
    } else {
      nodeType = 'other'
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
      nodeType
    })
  }, [])

  // 隐藏右键菜单
  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  // 处理菜单项点击
  const handleMenuItemClick = useCallback((action: string) => {
    if (!dockerFactory || !contextMenu.node) return

    const node = contextMenu.node

    switch (action) {
      case 'add-port':
        if (node.shape === 'docker-container') {
          const port = prompt('请输入端口映射 (例如: 8080:80)', '8080:80')
          if (port) {
            dockerFactory.addPortToContainer(node, port)
          }
        }
        break

      case 'add-volume':
        if (node.shape === 'docker-container') {
          const volume = prompt('请输入卷挂载 (例如: /host/path:/container/path)', '/data:/app/data')
          if (volume) {
            dockerFactory.addVolumeToContainer(node, volume)
          }
        }
        break

      case 'add-network':
        if (node.shape === 'docker-container') {
          // 获取现有接口名用于重名检验
          const children = node.getChildren() || []
          const existingInterfaces = children
            .filter((child: any) => child.shape === 'docker-network')
            .map((child: any) => {
              const data = child.getData() || {}
              return data.networkInterface?.interfaceName || child.attr('text/text')?.split('\n')[0] || ''
            })

          // 生成默认接口名
          let defaultInterfaceName = 'eth0'
          let counter = 0
          while (existingInterfaces.includes(defaultInterfaceName)) {
            counter++
            defaultInterfaceName = `eth${counter}`
          }

          // 设置默认值并打开modal
          setNetworkModalData({
            interfaceName: defaultInterfaceName,
            switchName: '',
            ipConfig: 'dynamic',
            staticIP: ''
          })
          setCurrentContainerNode(node)
          setShowNetworkModal(true)
        }
        break

      case 'add-user':
        if (node.shape === 'docker-container') {
          if (dockerFactory.hasUniqueComponent(node, 'docker-user')) {
            alert('容器已有用户配置，每个容器只能有一个用户配置')
            break
          }
          const user = prompt('请输入用户配置 (例如: root 或 1000:1000)', 'root')
          if (user) {
            const containerPos = node.getPosition()
            const userNode = graph?.addNode({
              shape: 'docker-user',
              x: containerPos.x + 180,
              y: containerPos.y + 40,
              label: `user: ${user}`,
              zIndex: 10,
            })
            if (userNode) {
              node.addChild(userNode)
            }
          }
        }
        break

      case 'delete-component':
        if (contextMenu.nodeType === 'component') {
          if (confirm('确定要删除此组件吗？')) {
            dockerFactory.removeChildComponent(node)
          }
        }
        break
    }

    hideContextMenu()
  }, [dockerFactory, contextMenu.node, contextMenu.nodeType, graph, hideContextMenu])

  return {
    contextMenu,
    handleContextMenu,
    hideContextMenu,
    handleMenuItemClick,
    showNetworkModal,
    setShowNetworkModal,
    currentContainerNode,
    networkModalData,
    setNetworkModalData
  }
}