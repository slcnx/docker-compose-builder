import { useEffect } from 'react'
import type { Graph } from '@antv/x6'

interface UseGraphEventsProps {
  graph: Graph | undefined
  handleContextMenu: (e: any, node: any) => void
  hideContextMenu: () => void
  handleDoubleClick: (cell: any, e?: any) => void
}

export const useGraphEvents = ({
  graph,
  handleContextMenu,
  hideContextMenu,
  handleDoubleClick,
}: UseGraphEventsProps) => {
  useEffect(() => {
    if (!graph) return

    // 控制连接桩显示/隐藏
    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    }

    // 节点右键菜单
    const onNodeContextMenu = ({ e, node }: any) => {
      handleContextMenu(e, node)
    }

    // 点击空白处隐藏右键菜单
    const onBlankClick = () => {
      hideContextMenu()
    }

    // 节点双击编辑
    const onNodeDoubleClick = ({ node, e }: any) => {
      handleDoubleClick(node, e)
    }

    // 通用双击编辑（支持节点和边）
    const onCellDoubleClick = ({ cell, e }: any) => {
      handleDoubleClick(cell, e)
    }

    // 鼠标进入节点时显示连接点
    const onNodeMouseEnter = ({ node }: any) => {
      // 获取相关的节点（容器或独立设备）
      let targetNodes: any[] = []

      if (node.shape === 'docker-container') {
        // 如果是容器节点，显示容器的连接点
        targetNodes = [node]
      } else if (['docker-service', 'docker-script', 'docker-image', 'docker-volume', 'docker-port', 'docker-network', 'docker-env'].includes(node.shape)) {
        // 如果是容器内的子元素，查找父容器并显示其连接点
        const parentContainer = node.getParent()
        if (parentContainer && parentContainer.shape === 'docker-container') {
          targetNodes = [parentContainer]
        }
        // 同时显示子元素自身的连接点（如果有的话）
        targetNodes.push(node)
      } else if (['network-switch', 'network-router'].includes(node.shape)) {
        // 如果是网络设备，显示其连接点
        targetNodes = [node]
      } else {
        // 其他类型节点，显示自身连接点
        targetNodes = [node]
      }

      // 显示相关节点的连接点
      targetNodes.forEach(targetNode => {
        const nodeElement = graph.findViewByCell(targetNode)?.container
        if (nodeElement) {
          const ports = nodeElement.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
          showPorts(ports, true)
        }
      })
    }

    // 鼠标离开节点时隐藏连接点
    const onNodeMouseLeave = ({ node, e }: any) => {
      // 延迟隐藏，避免在容器内移动时闪烁
      setTimeout(() => {
        // 检查鼠标是否还在相关的节点上
        const currentHoveredElement = document.elementFromPoint(e.clientX || 0, e.clientY || 0)
        const isStillOnRelevantNode = currentHoveredElement?.closest('.x6-node')

        if (!isStillOnRelevantNode) {
          const container = graph.container
          const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
          showPorts(ports, false)
        }
      }, 100)
    }

    // 边的鼠标悬停效果和交互工具
    const onEdgeMouseEnter = ({ edge }: any) => {
      // 添加边的交互工具
      edge.addTools([
        {
          name: 'vertices',
          args: {
            attrs: { fill: '#007bff', stroke: '#fff', 'stroke-width': 2 },
            snapRadius: 20,
          },
        },
        {
          name: 'segments',
          args: {
            threshold: 40,
            attrs: {
              width: 20,
              height: 8,
              x: -10,
              y: -4,
              rx: 4,
              ry: 4,
              fill: '#007bff',
              stroke: '#fff',
              'stroke-width': 2,
            },
          },
        },
        {
          name: 'source-arrowhead',
          args: {
            attrs: {
              fill: '#28a745',
              stroke: '#fff',
              'stroke-width': 2,
              cursor: 'move',
            },
          },
        },
        {
          name: 'target-arrowhead',
          args: {
            attrs: {
              fill: '#dc3545',
              stroke: '#fff',
              'stroke-width': 2,
              cursor: 'move',
            },
          },
        },
        {
          name: 'button-remove',
          args: {
            distance: 20,
            markup: [
              {
                tagName: 'circle',
                selector: 'button',
                attrs: {
                  r: 8,
                  stroke: '#dc3545',
                  'stroke-width': 2,
                  fill: '#fff',
                  cursor: 'pointer',
                },
              },
              {
                tagName: 'text',
                textContent: '×',
                selector: 'icon',
                attrs: {
                  fill: '#dc3545',
                  'font-size': 12,
                  'text-anchor': 'middle',
                  'pointer-events': 'none',
                  y: '0.3em',
                  'font-weight': 'bold',
                },
              },
            ],
          },
        },
      ])

      // 如果边没有被选中，则显示悬停效果
      if (!graph.isSelected(edge)) {
        // 从数据中获取原始样式，如果没有则使用默认值
        const data = edge.getData() || {}
        const originalStroke = data.originalStroke || '#6c757d'
        const originalWidth = data.originalWidth || 2

        // 根据连线类型选择高亮颜色
        let hoverColor = '#007bff'
        if (data.type === 'dependency') {
          hoverColor = '#e63946' // 依赖关系用更深的红色高亮
        }

        edge.attr({
          line: {
            strokeWidth: originalWidth + 2,
            stroke: hoverColor
          }
        })

        // 保存原始样式以便恢复（只在第一次保存）
        if (!data.originalStroke) {
          edge.setData({
            ...data,
            originalStroke,
            originalWidth,
            isHovering: true
          })
        } else {
          edge.setData({
            ...data,
            isHovering: true
          })
        }
      }
    }

    // 边的鼠标离开事件
    const onEdgeMouseLeave = ({ edge }: any) => {
      // 移除边的交互工具
      edge.removeTools()

      // 如果边没有被选中，则恢复原始样式
      if (!graph.isSelected(edge) && edge.getData()?.isHovering) {
        const data = edge.getData()
        edge.attr({
          line: {
            strokeWidth: data.originalWidth || 2,
            stroke: data.originalStroke || '#6c757d'
          }
        })

        edge.setData({ ...data, isHovering: false })
      }
    }

    // 选择变化事件
    const onSelectionChanged = ({ added, removed }: any) => {
      // 移除取消选择的边的工具
      removed.forEach((cell: any) => {
        if (cell.isEdge()) {
          cell.removeTools()
        }
      })

      // 调试信息
      const selectedCells = graph.getSelectedCells()
      console.log('选中的单元格:', selectedCells)
    }

    // 注册事件
    graph.on('node:contextmenu', onNodeContextMenu)
    graph.on('blank:click', onBlankClick)
    graph.on('node:dblclick', onNodeDoubleClick) // 节点专用双击事件
    // graph.on('cell:dblclick', onCellDoubleClick) // 通用双击事件（节点和边）
    graph.on('node:mouseenter', onNodeMouseEnter)
    graph.on('node:mouseleave', onNodeMouseLeave)
    graph.on('edge:mouseenter', onEdgeMouseEnter)
    graph.on('edge:mouseleave', onEdgeMouseLeave)
    graph.on('selection:changed', onSelectionChanged)

    // 点击空白处隐藏右键菜单（document 事件）
    document.addEventListener('click', hideContextMenu)

    // 清理事件
    return () => {
      graph.off('node:contextmenu', onNodeContextMenu)
      graph.off('blank:click', onBlankClick)
      graph.off('node:dblclick', onNodeDoubleClick)
      // graph.off('cell:dblclick', onCellDoubleClick)
      graph.off('node:mouseenter', onNodeMouseEnter)
      graph.off('node:mouseleave', onNodeMouseLeave)
      graph.off('edge:mouseenter', onEdgeMouseEnter)
      graph.off('edge:mouseleave', onEdgeMouseLeave)
      graph.off('selection:changed', onSelectionChanged)
      document.removeEventListener('click', hideContextMenu)
    }
  }, [graph, handleContextMenu, hideContextMenu, handleDoubleClick])
}
