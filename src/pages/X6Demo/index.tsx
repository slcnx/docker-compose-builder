import React, { useEffect, useRef, useState } from 'react'
import { Graph, Shape, Addon } from '@antv/x6'
import './index.css'
import { registerDockerNodes, DockerComponentFactory } from './utils/dockerNodes'
import { DockerPanel } from './components/DockerPanel'
import { useStorage } from './hooks/useStorage'
import { useDockerCompose } from './hooks/useDockerCompose'
import { useDockerContextMenu } from './hooks/useDockerContextMenu'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { usePanningMode } from './hooks/usePanningMode'
import { useNodeEditor } from './hooks/useNodeEditor'
import { createGraphConfig, getCellsWithChildren } from './utils/graphConfig'

const Example: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stencilRef = useRef<HTMLDivElement>(null)
  const minimapRef = useRef<HTMLDivElement>(null)
  const [dockerFactory, setDockerFactory] = useState<DockerComponentFactory>()
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [exportYml, setExportYml] = useState('')
  const [importYml, setImportYml] = useState('')
  const graphRef = useRef<Graph>()
  const hasRestoredRef = useRef(false) // 标记是否已经尝试过恢复
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false) // 工具栏折叠状态
  const [edgeStyle, setEdgeStyle] = useState<'manhattan' | 'smooth'>('manhattan') // 连线样式：直角或曲线

  // 使用存储 Hook
  const { saveYaml, clearStorage, checkAndPromptRestore } = useStorage()

  // 使用 Docker Compose Hook
  const { exportDockerCompose: exportDockerComposeHook, importDockerCompose: importDockerComposeHook } = useDockerCompose(
    graphRef.current,
    dockerFactory
  )

  // 使用拖拽模式 Hook
  const { isDragMode, togglePanningMode } = usePanningMode(graphRef.current)

  // 计算是否在模态框中编辑
  const isEditingInModal = showConfigModal || showExportModal || showImportModal

  // 使用快捷键 Hook
  const { bindShortcuts } = useKeyboardShortcuts(graphRef.current, togglePanningMode, isEditingInModal)

  // 使用节点编辑器 Hook
  const { handleDoubleClick } = useNodeEditor(graphRef.current)

  // 使用 Docker 右键菜单 Hook
  const {
    contextMenu,
    handleContextMenu,
    hideContextMenu,
    handleMenuItemClick,
    showNetworkModal,
    setShowNetworkModal,
    currentContainerNode,
    networkModalData,
    setNetworkModalData
  } = useDockerContextMenu(graphRef.current, dockerFactory)

  // 检查并恢复localStorage中的数据（使用 useStorage hook）
  const checkAndRestoreFromStorage = () => {
    checkAndPromptRestore((yaml) => {
      // console.log(yaml,'index import')
      const success = importDockerComposeHook(yaml)
      if (success) {
        setShowImportModal(false)
        setImportYml('')
      }
    })
  }

  // 导出Docker Compose功能（使用 useDockerCompose hook）
  const exportDockerCompose = () => {
    const yamlString = exportDockerComposeHook()
    setExportYml(yamlString)
    setShowExportModal(true)
  }

  // 导入Docker Compose功能（使用 useDockerCompose hook）
  const importDockerCompose = (yamlContent?: string | React.MouseEvent) => {
    // 如果参数是事件对象或未传递，使用 state 中的 importYml
    const yamlToImport = (typeof yamlContent === 'string' ? yamlContent : importYml)

    const success = importDockerComposeHook(yamlToImport)
    if (success) {
      setShowImportModal(false)
      setImportYml('')
    }
  }

  // 重置画布
  const handleReset = () => {
    if (confirm('确定要清空画布吗？所有未保存的内容将丢失。')) {
      graphRef.current?.clearCells()
      clearStorage()
      console.log('画布已重置')
    }
  }

  // 导出图片 (PNG)
  const handleExportImage = () => {
    if (!graphRef.current) return

    graphRef.current.toPNG((dataUri: string) => {
      const link = document.createElement('a')
      link.download = 'docker-compose-diagram.png'
      link.href = dataUri
      link.click()
    }, {
      backgroundColor: '#f5f5f5',
      padding: 20,
    })
  }

  // 导出 SVG
  const handleExportSVG = () => {
    if (!graphRef.current) return

    graphRef.current.toSVG((dataUri: string) => {
      const link = document.createElement('a')
      link.download = 'docker-compose-diagram.svg'
      link.href = dataUri
      link.click()
    }, {
      preserveDimensions: true,
    })
  }

  // 导出 JSON
  const handleExportJSON = () => {
    if (!graphRef.current) return

    const data = graphRef.current.toJSON()
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'docker-compose-diagram.json'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  // 缩放到合适大小
  const handleZoomToFit = () => {
    if (!graphRef.current) return
    graphRef.current.zoomToFit({ padding: 20, maxScale: 1 })
  }

  // 居中显示
  const handleCenter = () => {
    if (!graphRef.current) return
    graphRef.current.centerContent()
  }

  // 放大
  const handleZoomIn = () => {
    if (!graphRef.current) return
    const zoom = graphRef.current.zoom()
    if (zoom < 2) {
      graphRef.current.zoom(0.1)
    }
  }

  // 缩小
  const handleZoomOut = () => {
    if (!graphRef.current) return
    const zoom = graphRef.current.zoom()
    if (zoom > 0.2) {
      graphRef.current.zoom(-0.1)
    }
  }

  // 重置缩放
  const handleZoomReset = () => {
    if (!graphRef.current) return
    graphRef.current.zoomTo(1)
  }

  // 切换连线样式
  const toggleEdgeStyle = () => {
    if (!graphRef.current) return

    const newStyle = edgeStyle === 'manhattan' ? 'smooth' : 'manhattan'
    setEdgeStyle(newStyle)

    // 更新所有边的连线样式
    const edges = graphRef.current.getEdges()
    edges.forEach(edge => {
      if (newStyle === 'smooth') {
        // 切换到曲线
        edge.setRouter({ name: 'normal' })
        edge.setConnector({ name: 'smooth' })
      } else {
        // 切换到直角
        edge.setRouter({
          name: 'manhattan',
          args: {
            padding: 1,
            step: 10,
          }
        })
        edge.setConnector({ name: 'normal' })
      }
    })
  }
  useEffect(() => {
    if (!containerRef.current || !stencilRef.current || !minimapRef.current) return

    // 注册Docker节点
    registerDockerNodes()

    // 获取容器尺寸，确保画布填满右侧区域
    const containerWidth = containerRef.current.clientWidth || window.innerWidth - 180
    const containerHeight = containerRef.current.clientHeight || window.innerHeight - 125

    // 初始化画布（使用 graphConfig 工具）
    const graphConfig = createGraphConfig(
      containerRef.current,
      minimapRef.current,
      containerWidth,
      containerHeight
    )
    const graph = new Graph(graphConfig)

    // 保存graph实例到ref中
    graphRef.current = graph

    // 绑定快捷键（在 graph 实例化后）
    bindShortcuts()

    // 初始化 stencil
    const stencil = new Addon.Stencil({
      title: '流程图',
      target: graph,
      stencilGraphWidth: 200,
      stencilGraphHeight: 180,
      collapsable: true,
      groups: [
        {
          title: '基础流程图',
          name: 'group1',
        },
        {
          title: '系统设计图',
          name: 'group2',
          graphHeight: 250,
          layoutOptions: {
            rowHeight: 70,
          },
        },
      ],
      layoutOptions: {
        columns: 2,
        columnWidth: 80,
        rowHeight: 55,
      },
    })
    // stencilRef.current.appendChild(stencil.container)

    // 添加右键菜单事件监听
    graph.on('node:contextmenu', ({ e, node }) => {
      handleContextMenu(e, node)
    })

    // 点击空白处隐藏右键菜单
    document.addEventListener('click', hideContextMenu)
    graph.on('blank:click', hideContextMenu)

    // 控制连接桩显示/隐藏
    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    }

    // 鼠标进入节点时显示连接点
    graph.on('node:mouseenter', ({ node }) => {
      // 获取相关的节点（容器或独立设备）
      let targetNodes: any[] = []

      if (node.shape === 'docker-container') {
        // 如果是容器节点，显示容器的连接点
        targetNodes = [node]
      } else if (['docker-service', 'docker-script', 'docker-image', 'docker-volume', 'docker-port', 'docker-network'].includes(node.shape)) {
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
    })

    // 鼠标离开节点时隐藏连接点
    graph.on('node:mouseleave', ({ node, e }) => {
      // 延迟隐藏，避免在容器内移动时闪烁
      setTimeout(() => {
        // 检查鼠标是否还在相关的节点上
        const currentHoveredElement = document.elementFromPoint(e.clientX || 0, e.clientY || 0)
        const isStillOnRelevantNode = currentHoveredElement?.closest('.x6-node')

        if (!isStillOnRelevantNode) {
          const ports = containerRef.current!.querySelectorAll(
            '.x6-port-body',
          ) as NodeListOf<SVGElement>
          showPorts(ports, false)
        }
      }, 100)
    })

    // 边的鼠标悬停效果和交互工具
    graph.on('edge:mouseenter', ({ edge }) => {
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
    })

    graph.on('edge:mouseleave', ({ edge }) => {
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
    })

    // 双击编辑（使用 useNodeEditor hook）
    graph.on('cell:dblclick', ({ cell, e }) => {
      handleDoubleClick(cell, e)
    })

    // 监听选择变化，便于调试多选功能
    graph.on('selection:changed', ({ added, removed }) => {
      const selectedCells = graph.getSelectedCells()

      // 移除取消选择的边的工具
      removed.forEach(cell => {
        if (cell.isEdge()) {
          cell.removeTools()
        }
      })

      // 重置所有边的样式
      graph.getEdges().forEach(edge => {
        const data = edge.getData() || {}
        const originalStroke = data.originalStroke || (edge.getTargetNode()?.shape === 'network-router' ? '#28a745' : '#6c757d')
        const originalWidth = data.originalWidth || (edge.getTargetNode()?.shape === 'network-router' ? 3 : 2)

        edge.attr({
          line: {
            strokeWidth: originalWidth,
            stroke: originalStroke
          }
        })
      })

      // 高亮选中的边并添加工具
      const selectedEdges = selectedCells.filter(cell => cell.isEdge())
      selectedEdges.forEach(edge => {
        edge.attr({
          line: {
            strokeWidth: 4,
            stroke: '#ff6b35'
          }
        })

        // 为选中的边添加高级工具
        edge.addTools([
          {
            name: 'vertices',
            args: {
              attrs: { fill: '#ff6b35', stroke: '#fff', 'stroke-width': 2 },
              snapRadius: 20,
            },
          },
          {
            name: 'segments',
            args: {
              threshold: 30,
              attrs: {
                width: 24,
                height: 10,
                x: -12,
                y: -5,
                rx: 5,
                ry: 5,
                fill: '#ff6b35',
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
                'stroke-width': 3,
                cursor: 'move',
                d: 'M 12 -10 -12 0 12 10 Z',
              },
            },
          },
          {
            name: 'target-arrowhead',
            args: {
              attrs: {
                fill: '#dc3545',
                stroke: '#fff',
                'stroke-width': 3,
                cursor: 'move',
                d: 'M -12 -10 12 0 -12 10 Z',
              },
            },
          },
          {
            name: 'button-remove',
            args: {
              distance: 30,
              markup: [
                {
                  tagName: 'circle',
                  selector: 'button',
                  attrs: {
                    r: 10,
                    stroke: '#dc3545',
                    'stroke-width': 3,
                    fill: '#fff',
                    cursor: 'pointer',
                  },
                },
                {
                  tagName: 'text',
                  textContent: '✕',
                  selector: 'icon',
                  attrs: {
                    fill: '#dc3545',
                    'font-size': 14,
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
      })

      if (selectedCells.length > 0) {
        const nodes = selectedCells.filter(cell => cell.isNode())
        const edges = selectedCells.filter(cell => cell.isEdge())

        // 计算包含父子关系的总数
        const cellsWithChildren = getCellsWithChildren(selectedCells)
        const totalNodes = cellsWithChildren.filter(cell => cell.isNode())
        const totalEdges = cellsWithChildren.filter(cell => cell.isEdge())

        console.log(`选择变化: 直接选中 ${selectedCells.length} 个元素，包含addChild关系后 ${cellsWithChildren.length} 个元素`, {
          直接选中: {
            总计: selectedCells.length,
            节点: nodes.length,
            边: edges.length
          },
          包含子节点后: {
            总计: cellsWithChildren.length,
            节点: totalNodes.length,
            边: totalEdges.length
          },
          操作: {
            新增: added.length,
            移除: removed.length
          }
        })

        // 显示具体的父子关系
        nodes.forEach(node => {
          const children = node.getChildren()
          if (children && children.length > 0) {
            console.log(`节点 ${node.id} 有 ${children.length} 个子节点:`, children.map(child => child.id))
          }
        })
      }
    })

    // 初始化图形
    const ports = {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
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
              stroke: '#5F95FF',
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
              stroke: '#5F95FF',
              strokeWidth: 1,
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
              stroke: '#5F95FF',
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
        {
          group: 'top',
        },
        {
          group: 'right',
        },
        {
          group: 'bottom',
        },
        {
          group: 'left',
        },
      ],
    }

    // 注册自定义节点
    Graph.registerNode(
      'custom-rect',
      {
        inherit: 'rect',
        width: 66,
        height: 36,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
        },
        ports: { ...ports },
      },
      true,
    )

    Graph.registerNode(
      'custom-polygon',
      {
        inherit: 'polygon',
        width: 66,
        height: 36,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
        },
        ports: {
          ...ports,
          items: [
            {
              group: 'top',
            },
            {
              group: 'bottom',
            },
          ],
        },
      },
      true,
    )

    Graph.registerNode(
      'custom-circle',
      {
        inherit: 'circle',
        width: 45,
        height: 45,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
        },
        ports: { ...ports },
      },
      true,
    )

    Graph.registerNode(
      'custom-image',
      {
        inherit: 'rect',
        width: 52,
        height: 52,
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'image',
          },
          {
            tagName: 'text',
            selector: 'label',
          },
        ],
        attrs: {
          body: {
            stroke: '#5F95FF',
            fill: '#5F95FF',
          },
          image: {
            width: 26,
            height: 26,
            refX: 13,
            refY: 16,
          },
          label: {
            refX: 3,
            refY: 2,
            textAnchor: 'left',
            textVerticalAnchor: 'top',
            fontSize: 12,
            fill: '#fff',
          },
        },
        ports: { ...ports },
      },
      true,
    )

    // 创建基础流程图节点
    const r1 = graph.createNode({
      shape: 'custom-rect',
      label: '开始',
      attrs: {
        body: {
          rx: 20,
          ry: 26,
        },
      },
    })
    const r2 = graph.createNode({
      shape: 'custom-rect',
      label: '过程',
    })
    const r3 = graph.createNode({
      shape: 'custom-rect',
      attrs: {
        body: {
          rx: 6,
          ry: 6,
        },
      },
      label: '可选过程',
    })
    const r4 = graph.createNode({
      shape: 'custom-polygon',
      attrs: {
        body: {
          refPoints: '0,10 10,0 20,10 10,20',
        },
      },
      label: '决策',
    })
    const r5 = graph.createNode({
      shape: 'custom-polygon',
      attrs: {
        body: {
          refPoints: '10,0 40,0 30,20 0,20',
        },
      },
      label: '数据',
    })
    const r6 = graph.createNode({
      shape: 'custom-circle',
      label: '连接',
    })
    stencil.load([r1, r2, r3, r4, r5, r6], 'group1')

    // 创建系统设计图节点
    const imageShapes = [
      {
        label: 'Client',
        image:
          'https://gw.alipayobjects.com/zos/bmw-prod/687b6cb9-4b97-42a6-96d0-34b3099133ac.svg',
      },
      {
        label: 'Http',
        image:
          'https://gw.alipayobjects.com/zos/bmw-prod/dc1ced06-417d-466f-927b-b4a4d3265791.svg',
      },
      {
        label: 'Api',
        image:
          'https://gw.alipayobjects.com/zos/bmw-prod/c55d7ae1-8d20-4585-bd8f-ca23653a4489.svg',
      },
      {
        label: 'Sql',
        image:
          'https://gw.alipayobjects.com/zos/bmw-prod/6eb71764-18ed-4149-b868-53ad1542c405.svg',
      },
      {
        label: 'Cloud',
        image:
          'https://gw.alipayobjects.com/zos/bmw-prod/c36fe7cb-dc24-4854-aeb5-88d8dc36d52e.svg',
      },
      {
        label: 'Mq',
        image:
          'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
      },
    ]
    const imageNodes = imageShapes.map((item) =>
      graph.createNode({
        shape: 'custom-image',
        label: item.label,
        attrs: {
          image: {
            'xlink:href': item.image,
          },
        },
      }),
    )
    stencil.load(imageNodes, 'group2')

    // 创建Docker组件工厂
    const factory = new DockerComponentFactory(graph)
    setDockerFactory(factory)

    // // 窗口大小改变时调整画布大小，确保填满右侧区域
    // const handleResize = () => {
    //   if (containerRef.current) {
    //     const newWidth = containerRef.current.clientWidth || window.innerWidth - 180
    //     const newHeight = containerRef.current.clientHeight || window.innerHeight
    //     graph.resize(newWidth, newHeight)
    //   }
    // }

    // window.addEventListener('resize', handleResize)

    // 清理函数，组件卸载时销毁图形实例
    return () => {
      // window.removeEventListener('resize', handleResize)
      document.removeEventListener('click', hideContextMenu)
      graph.dispose()
    }
  }, []) // 空依赖数组，只在组件挂载时执行一次

  // 当 graph 或 dockerFactory 初始化完成后，重新绑定 hooks
  useEffect(() => {
    if (graphRef.current) {
      // 重新绑定快捷键
      bindShortcuts()
    }
  }, [bindShortcuts])

  // 当 dockerFactory 初始化完成后，尝试恢复 localStorage 数据（仅首次加载时）
  useEffect(() => {
    if (dockerFactory && graphRef.current && !hasRestoredRef.current) {
      // 标记为已尝试恢复，避免重复触发
      hasRestoredRef.current = true

      // 延迟一小段时间确保所有初始化完成
      const timer = setTimeout(() => {
        checkAndRestoreFromStorage()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [dockerFactory, checkAndRestoreFromStorage]) // 依赖 dockerFactory 和恢复函数

  return (
    <div className="app">
           {/* 左侧组件库 */}
      <div ref={stencilRef} className="stencil-container" />

      {/* 中间画布区域 */}
      <div className="app-content" ref={containerRef} />

      {/* 右侧小地图 */}
      <div ref={minimapRef} className="minimap-container" />

      {/* 工具栏折叠/展开按钮 */}
      <button
        onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#ffc107',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 1001,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.backgroundColor = '#e0a800'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.backgroundColor = '#ffc107'
        }}
        title={isToolbarCollapsed ? '展开工具栏' : '折叠工具栏'}
      >
        {isToolbarCollapsed ? '☰' : '✕'}
      </button>

      {/* 右侧操作按钮组 - 第一行 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '80px',
        display: isToolbarCollapsed ? 'none' : 'flex',
        gap: '10px',
        zIndex: 1000,
      }}>
        {/* 导入按钮 */}
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#138496'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#17a2b8'
          }}
          title="导入Docker Compose"
        >
          📤
        </button>

        {/* 导出YAML按钮 */}
        <button
          onClick={exportDockerCompose}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#1e7e34'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#28a745'
          }}
          title="导出Docker Compose YAML"
        >
          📁
        </button>

        {/* 导出图片按钮 */}
        <button
          onClick={handleExportImage}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#5a32a3'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#6f42c1'
          }}
          title="导出为 PNG 图片"
        >
          🖼️
        </button>

        {/* 配置按钮 */}
        <button
          onClick={() => setShowConfigModal(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#0056b3'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#007bff'
          }}
          title="Docker配置"
        >
          🐳
        </button>

        {/* 重置按钮 */}
        <button
          onClick={handleReset}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#c82333'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#dc3545'
          }}
          title="重置画布（清空所有内容）"
        >
          🔄
        </button>

        {/* 切换连线样式按钮 */}
        <button
          onClick={toggleEdgeStyle}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: edgeStyle === 'manhattan' ? '#fd7e14' : '#20c997',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: edgeStyle === 'manhattan' ? '0 4px 12px rgba(253, 126, 20, 0.3)' : '0 4px 12px rgba(32, 201, 151, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = edgeStyle === 'manhattan' ? '#e8590c' : '#1aa179'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = edgeStyle === 'manhattan' ? '#fd7e14' : '#20c997'
          }}
          title={edgeStyle === 'manhattan' ? '切换到曲线' : '切换到直角连线'}
        >
          {edgeStyle === 'manhattan' ? '📐' : '〰️'}
        </button>
      </div>

      {/* 右侧操作按钮组 - 第二行（视图控制） */}
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '80px',
        display: isToolbarCollapsed ? 'none' : 'flex',
        gap: '10px',
        zIndex: 1000,
      }}>
        {/* 放大按钮 */}
        <button
          onClick={handleZoomIn}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#5a6268'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
          title="放大"
        >
          ➕
        </button>

        {/* 缩小按钮 */}
        <button
          onClick={handleZoomOut}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#5a6268'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
          title="缩小"
        >
          ➖
        </button>

        {/* 重置缩放按钮 */}
        <button
          onClick={handleZoomReset}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#5a6268'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
          title="重置缩放 (100%)"
        >
          1:1
        </button>

        {/* 适应画布按钮 */}
        <button
          onClick={handleZoomToFit}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#5a6268'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
          title="缩放到合适大小"
        >
          🔍
        </button>

        {/* 居中按钮 */}
        <button
          onClick={handleCenter}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.backgroundColor = '#5a6268'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
          title="居中显示"
        >
          🎯
        </button>
      </div>

      {/* Modal 配置面板 */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '600px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowConfigModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>

            {/* Docker配置面板内容 */}
            {dockerFactory ? (
              <DockerPanel dockerFactory={dockerFactory} onClose={() => setShowConfigModal(false)} />
            ) : (
              <div style={{ color: '#666', textAlign: 'center', padding: '50px' }}>
                正在初始化...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 导出面板 */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '800px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowExportModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>

            {/* 标题 */}
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
              📁 导出 Docker Compose
            </h2>

            {/* 操作按钮 */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportYml)
                  console.log('已复制到剪贴板')
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                📋 复制到剪贴板
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([exportYml], { type: 'text/yaml' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'docker-compose.yml'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                💾 下载文件
              </button>
            </div>

            {/* YAML内容 */}
            <div
              style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                padding: '15px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '500px',
                overflow: 'auto',
                color: '#333',
              }}
            >
              {exportYml}
            </div>
          </div>
        </div>
      )}

      {/* Modal 导入面板 */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '800px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => {
                setShowImportModal(false)
                setImportYml('')
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>

            {/* 标题 */}
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
              📤 导入 Docker Compose
            </h2>

            {/* 说明文字 */}
            <p style={{ color: '#666', marginBottom: '15px' }}>
              请粘贴您的 docker-compose.yml 内容到下方文本框中，然后点击导入按钮。
            </p>

            {/* 示例按钮 */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const exampleYaml = `version: "3.8"
services:
  redis-master:
    image: redis:7-alpine
    command: redis-server --port 6379
    ports:
      - "6379:6379"
    volumes:
      - redis-master-data:/data
    networks:
      redis-cluster:
        ipv4_address: 172.20.0.10
    restart: unless-stopped

  redis-slave-1:
    image: redis:7-alpine
    command: redis-server --port 6380 --replicaof redis-master 6379
    ports:
      - "6380:6380"
    volumes:
      - redis-slave1-data:/data
    networks:
      redis-cluster:
        ipv4_address: 172.20.0.11
    depends_on:
      - redis-master
    restart: unless-stopped

  redis-slave-2:
    image: redis:7-alpine
    command: redis-server --port 6381 --replicaof redis-master 6379
    ports:
      - "6381:6381"
    volumes:
      - redis-slave2-data:/data
    networks:
      redis-cluster:
        ipv4_address: 172.20.0.12
    depends_on:
      - redis-master
    restart: unless-stopped

networks:
  redis-cluster:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1

volumes:
  redis-master-data:
  redis-slave1-data:
  redis-slave2-data:`
                  setImportYml(exampleYaml)
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                📝 使用 Redis 集群示例
              </button>
              <span style={{ fontSize: '12px', color: '#999' }}>
                点击后会填入一个完整的 Redis 主从配置示例
              </span>
            </div>

            {/* 文本输入区域 */}
            <textarea
              value={importYml}
              onChange={(e) => setImportYml(e.target.value)}
              placeholder="请在此处粘贴 docker-compose.yml 内容..."
              style={{
                width: '100%',
                height: '400px',
                padding: '15px',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '20px',
              }}
            />

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportYml('')
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={importDockerCompose}
                disabled={!importYml.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: importYml.trim() ? '#17a2b8' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: importYml.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                🚀 导入
              </button>
            </div>

            {/* 功能说明 */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>✨ 智能导入功能：</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><strong>服务架构：</strong> 自动创建容器节点，清晰展示服务名、镜像、命令</li>
                <li><strong>端口映射：</strong> 可视化显示端口配置，支持多端口</li>
                <li><strong>卷挂载：</strong> 直观展示数据卷挂载关系</li>
                <li><strong>网络拓扑：</strong> 自动创建交换机，展示网络连接结构</li>
                <li><strong>智能布局：</strong> 自动排列容器，避免重叠，支持依赖关系</li>
                <li><strong>配置完整：</strong> 包含环境变量、重启策略、启动命令等</li>
              </ul>
              <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '3px' }}>
                💡 <strong>提示：</strong> 导入后可在画布上手动调整布局，连接网络接口到交换机
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 网络配置Modal */}
      {showNetworkModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '500px',
              maxWidth: '90vw',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowNetworkModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>

            {/* 标题 */}
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
              🌐 添加网络接口
            </h2>

            {/* 接口名输入 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                接口名称：
              </label>
              <input
                type="text"
                value={networkModalData.interfaceName}
                onChange={(e) => setNetworkModalData(prev => ({ ...prev, interfaceName: e.target.value }))}
                placeholder="例如: eth0, eth1"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* 交换机选择 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                连接到交换机：
              </label>
              <select
                value={networkModalData.switchName}
                onChange={(e) => setNetworkModalData(prev => ({ ...prev, switchName: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="">请选择交换机</option>
                {graphRef.current?.getNodes()
                  .filter(node => node.shape === 'network-switch')
                  .map(switchNode => {
                    const switchData = switchNode.getData() || {}
                    const switchLabel = switchNode.attr('text/text')
                    const switchName = switchData.switchName || (typeof switchLabel === 'string' ? switchLabel.split('\n')[0] : 'switch')
                    return (
                      <option key={switchNode.id} value={switchName}>
                        {switchName}
                      </option>
                    )
                  })}
                <option value="new-switch">+ 创建新交换机</option>
              </select>
            </div>

            {/* 新交换机名称输入 */}
            {networkModalData.switchName === 'new-switch' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  新交换机名称：
                </label>
                <input
                  type="text"
                  placeholder="例如: switch1, redis-net"
                  onChange={(e) => setNetworkModalData(prev => ({ ...prev, switchName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            {/* IP配置选择 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                IP配置：
              </label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="ipConfig"
                    value="dynamic"
                    checked={networkModalData.ipConfig === 'dynamic'}
                    onChange={(e) => setNetworkModalData(prev => ({
                      ...prev,
                      ipConfig: e.target.value as 'dynamic' | 'static',
                      staticIP: ''
                    }))}
                    style={{ marginRight: '5px' }}
                  />
                  动态分配 (DHCP)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="ipConfig"
                    value="static"
                    checked={networkModalData.ipConfig === 'static'}
                    onChange={(e) => setNetworkModalData(prev => ({
                      ...prev,
                      ipConfig: e.target.value as 'dynamic' | 'static'
                    }))}
                    style={{ marginRight: '5px' }}
                  />
                  静态IP
                </label>
              </div>
            </div>

            {/* 静态IP输入 */}
            {networkModalData.ipConfig === 'static' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  静态IP地址：
                </label>
                <input
                  type="text"
                  value={networkModalData.staticIP}
                  onChange={(e) => setNetworkModalData(prev => ({ ...prev, staticIP: e.target.value }))}
                  placeholder="例如: 172.20.0.100"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNetworkModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!networkModalData.interfaceName.trim()) {
                    alert('请输入接口名称')
                    return
                  }
                  if (!networkModalData.switchName.trim()) {
                    alert('请选择或输入交换机名称')
                    return
                  }
                  if (networkModalData.ipConfig === 'static' && !networkModalData.staticIP.trim()) {
                    alert('请输入静态IP地址')
                    return
                  }

                  // 检查接口名重复
                  const children = currentContainerNode?.getChildren() || []
                  const existingInterfaces = children
                    .filter((child: any) => child.shape === 'docker-network')
                    .map((child: any) => {
                      const data = child.getData() || {}
                      return data.networkInterface?.interfaceName || child.attr('text/text')?.split('\n')[0] || ''
                    })

                  if (existingInterfaces.includes(networkModalData.interfaceName)) {
                    alert(`接口名 "${networkModalData.interfaceName}" 已存在，请使用其他名称`)
                    return
                  }

                  // 创建网络接口
                  if (dockerFactory && currentContainerNode) {
                    const networkNode = dockerFactory.addNetworkToContainer(
                      currentContainerNode,
                      networkModalData.interfaceName,
                      networkModalData.switchName
                    )

                    // 设置网络接口数据
                    const networkInterface = {
                      interfaceName: networkModalData.interfaceName,
                      switchName: networkModalData.switchName,
                      ipConfig: networkModalData.ipConfig,
                      staticIP: networkModalData.ipConfig === 'static' ? networkModalData.staticIP : undefined
                    }

                    networkNode.setData({
                      networkInterface: networkInterface,
                      isConnected: false
                    })

                    // 更新标签显示
                    const interfaceLabel = networkModalData.ipConfig === 'static' && networkModalData.staticIP
                      ? `${networkModalData.interfaceName}\n${networkModalData.staticIP}`
                      : `${networkModalData.interfaceName}\ndynamic`

                    networkNode.attr('text/text', interfaceLabel)

                    // 自动连接到交换机
                    setTimeout(() => {
                      if (dockerFactory.manualConnectNetworkToSwitch) {
                        dockerFactory.manualConnectNetworkToSwitch(networkNode.id, networkModalData.switchName)
                      }
                    }, 100)

                    console.log(`添加网络接口: ${networkModalData.interfaceName} -> ${networkModalData.switchName}`)
                  }

                  setShowNetworkModal(false)
                }}
                disabled={!networkModalData.interfaceName.trim() || !networkModalData.switchName.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: (!networkModalData.interfaceName.trim() || !networkModalData.switchName.trim()) ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!networkModalData.interfaceName.trim() || !networkModalData.switchName.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                🚀 创建网络接口
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          {contextMenu.nodeType === 'container' && (
            <>
              <div
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f0f0f0',
                }}
                onClick={() => handleMenuItemClick('add-port')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                🔌 添加端口
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f0f0f0',
                }}
                onClick={() => handleMenuItemClick('add-volume')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                💾 添加卷
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f0f0f0',
                }}
                onClick={() => handleMenuItemClick('add-network')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                🌐 添加网络
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={() => handleMenuItemClick('add-user')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                👤 添加用户
              </div>
            </>
          )}
          {contextMenu.nodeType === 'component' && (
            <div
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#ff4d4f',
              }}
              onClick={() => handleMenuItemClick('delete-component')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff2f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              🗑️ 删除组件
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Example
