import { Graph, Shape } from '@antv/x6'

/**
 * 创建 Graph 配置
 */
export const createGraphConfig = (
  container: HTMLDivElement,
  minimapContainer: HTMLDivElement,
  width: number,
  height: number
): Graph.Options => {
  return {
    container,
    width,
    height,
    grid: true,
    // 启用 Scroller 滚动功能
    scroller: {
      enabled: true,
      pannable: false, // 默认关闭，通过 space 键控制
      pageVisible: false,
      pageBreak: false,
      autoResize: true,
      padding: 50,
    },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: {
        name: 'manhattan',
        args: {
          padding: 1,
          startDirections: ['right'],
          endDirections: ['left'],
          step: 10,
          excludeTerminals: [],
        },
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF',
          },
        },
      },
    },
    resizing: true,
    rotating: true,
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
      showEdgeSelectionBox: true,
      movable: true,
      multiple: true,
      strict: false,
      following: true,
    },
    snapline: {
      enabled: true,
    },
    keyboard: true,
    clipboard: true,
    history: true,
    minimap: {
      enabled: true,
      container: minimapContainer,
      width: 250,
      height: 150,
      padding: 10,
      scalable: true,
      graphOptions: {
        async: true,
        createCellView(cell) {
          // 在小地图中不渲染边
          if (cell.isEdge()) {
            return null
          }
        },
      },
    },
  }
}

/**
 * 获取包含父子关系的完整单元格集合
 */
export const getCellsWithChildren = (selectedCells: any[]) => {
  const allCells = new Set(selectedCells)

  // 递归添加子节点
  const addChildrenRecursively = (parentCell: any) => {
    const children = parentCell.getChildren()
    if (children && children.length > 0) {
      children.forEach((child: any) => {
        allCells.add(child)
        addChildrenRecursively(child)
      })
    }
  }

  // 为每个选中的单元格添加其所有子节点
  selectedCells.forEach(cell => {
    addChildrenRecursively(cell)
  })

  return Array.from(allCells)
}