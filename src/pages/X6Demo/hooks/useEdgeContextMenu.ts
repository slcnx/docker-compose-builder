import { useState, useCallback } from 'react'
import { Graph, Edge } from '@antv/x6'

export interface EdgeContextMenuState {
  visible: boolean
  x: number
  y: number
  edge: Edge | null
}

export interface EdgeRelationModalData {
  visible: boolean
  edge: Edge | null
  sourceNode: any
  targetNode: any
}

/**
 * 边的右键菜单Hook
 */
export const useEdgeContextMenu = (graph: Graph | undefined) => {
  const [edgeContextMenu, setEdgeContextMenu] = useState<EdgeContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    edge: null,
  })

  const [edgeRelationModal, setEdgeRelationModal] = useState<EdgeRelationModalData>({
    visible: false,
    edge: null,
    sourceNode: null,
    targetNode: null,
  })

  const [isFocusMode, setIsFocusMode] = useState(false)
  const [hiddenCells, setHiddenCells] = useState<any[]>([])
  const [hiddenCellIds, setHiddenCellIds] = useState<string[]>([])

  // 处理边的右键/点击菜单
  const handleEdgeContextMenu = useCallback((e: MouseEvent, edge: Edge) => {
    e.preventDefault()
    e.stopPropagation()

    setEdgeContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      edge,
    })
  }, [])

  // 隐藏边的右键菜单
  const hideEdgeContextMenu = useCallback(() => {
    setEdgeContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  // 聚焦显示边和相关节点
  const focusEdgeRelation = useCallback(() => {
    if (!graph || !edgeContextMenu.edge) return

    const edge = edgeContextMenu.edge
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()

    if (!sourceNode || !targetNode) return

    // 获取要显示的节点（如果是容器子节点，获取父容器）
    const getDisplayNode = (node: any) => {
      if (node.shape === 'docker-container') {
        return node
      }
      const parent = node.getParent()
      if (parent && parent.shape === 'docker-container') {
        return parent
      }
      return node
    }

    const sourceDisplayNode = getDisplayNode(sourceNode)
    const targetDisplayNode = getDisplayNode(targetNode)

    // 收集要显示的节点ID（包括子节点）
    const visibleNodeIds = new Set<string>()

    const addNodeAndChildren = (node: any) => {
      visibleNodeIds.add(node.id)
      const children = node.getChildren()
      if (children) {
        children.forEach((child: any) => {
          visibleNodeIds.add(child.id)
        })
      }
    }

    addNodeAndChildren(sourceDisplayNode)
    if (targetDisplayNode.id !== sourceDisplayNode.id) {
      addNodeAndChildren(targetDisplayNode)
    }

    // 收集容器的网络相关节点和边
    const collectNetworkRelations = (containerNode: any) => {
      const children = containerNode.getChildren() || []

      // 找到所有网卡节点
      const networkNodes = children.filter((child: any) => child.shape === 'docker-network')

      networkNodes.forEach((networkNode: any) => {
        // 确保网卡节点可见
        visibleNodeIds.add(networkNode.id)

        // 找到网卡连接的所有边
        const connectedEdges = graph.getConnectedEdges(networkNode)

        connectedEdges.forEach((connectedEdge: any) => {
          // 标记这条边为可见
          visibleNodeIds.add(connectedEdge.id)

          // 找到边连接的另一端（交换机）
          const otherNode = connectedEdge.getSourceNode()?.id === networkNode.id
            ? connectedEdge.getTargetNode()
            : connectedEdge.getSourceNode()

          if (otherNode) {
            // 如果是交换机，标记为可见
            if (otherNode.shape === 'network-switch') {
              visibleNodeIds.add(otherNode.id)

              // 找到交换机连接的路由器
              const switchEdges = graph.getConnectedEdges(otherNode)
              switchEdges.forEach((switchEdge: any) => {
                visibleNodeIds.add(switchEdge.id)

                const routerNode = switchEdge.getSourceNode()?.id === otherNode.id
                  ? switchEdge.getTargetNode()
                  : switchEdge.getSourceNode()

                if (routerNode && routerNode.shape === 'network-router') {
                  visibleNodeIds.add(routerNode.id)
                }
              })
            }
          }
        })
      })
    }

    // 收集两个容器的网络关系
    collectNetworkRelations(sourceDisplayNode)
    if (targetDisplayNode.id !== sourceDisplayNode.id) {
      collectNetworkRelations(targetDisplayNode)
    }

    // 隐藏其他所有节点和边
    const allCells = graph.getCells()
    const cellsToHide: any[] = []
    const cellIdsToHide: string[] = []

    allCells.forEach(cell => {
      // 如果是当前边，不隐藏
      if (cell.id === edge.id) return

      // 如果是要显示的节点或边，不隐藏
      if (visibleNodeIds.has(cell.id)) return

      // 隐藏其他元素
      cell.hide()
      cellsToHide.push(cell)
      cellIdsToHide.push(cell.id)
    })

    setHiddenCells(cellsToHide)
    setHiddenCellIds(cellIdsToHide)
    setIsFocusMode(true)

    console.log(`聚焦模式: 显示 ${visibleNodeIds.size} 个节点和 1 条边，隐藏 ${cellsToHide.length} 个元素`)
    console.log('隐藏的元素ID:', cellIdsToHide)
  }, [graph, edgeContextMenu.edge])

  // 退出聚焦模式，显示所有元素
  const exitFocusMode = useCallback(() => {
    if (!graph) return

    console.log('开始退出聚焦模式，需要恢复的元素ID:', hiddenCellIds)

    // 方法1: 使用保存的ID列表来恢复元素
    hiddenCellIds.forEach(cellId => {
      const cell = graph.getCellById(cellId)
      if (cell) {
        if (!cell.isVisible()) {
          cell.show()
          console.log('通过ID恢复显示:', cellId, cell.isNode() ? '节点' : '边')
        }
      } else {
        console.warn('无法找到元素:', cellId)
      }
    })

    // 方法2: 遍历所有单元格，确保都可见（双保险）
    const allCells = graph.getCells()
    let restoredCount = 0
    allCells.forEach(cell => {
      if (!cell.isVisible()) {
        cell.show()
        restoredCount++
        console.log('额外恢复隐藏元素:', cell.id)
      }
    })

    console.log(`退出聚焦模式完成: 通过ID恢复 ${hiddenCellIds.length} 个元素，额外恢复 ${restoredCount} 个元素`)

    setHiddenCells([])
    setHiddenCellIds([])
    setIsFocusMode(false)
  }, [graph, hiddenCellIds])

  // 处理边菜单项点击
  const handleEdgeMenuItemClick = useCallback((action: string) => {
    if (!graph || !edgeContextMenu.edge) return

    const edge = edgeContextMenu.edge

    switch (action) {
      case 'solid-line':
        // 设置为实线
        edge.attr('line/strokeDasharray', 0)
        break

      case 'dashed-line':
        // 设置为虚线
        edge.attr('line/strokeDasharray', '5 5')
        break

      case 'focus-relation':
        // 聚焦显示关系
        focusEdgeRelation()
        break
    }

    hideEdgeContextMenu()
  }, [graph, edgeContextMenu.edge, hideEdgeContextMenu, focusEdgeRelation])

  // 关闭关系模态框
  const closeEdgeRelationModal = useCallback(() => {
    setEdgeRelationModal({
      visible: false,
      edge: null,
      sourceNode: null,
      targetNode: null,
    })
  }, [])

  return {
    edgeContextMenu,
    handleEdgeContextMenu,
    hideEdgeContextMenu,
    handleEdgeMenuItemClick,
    edgeRelationModal,
    closeEdgeRelationModal,
    isFocusMode,
    exitFocusMode,
  }
}
