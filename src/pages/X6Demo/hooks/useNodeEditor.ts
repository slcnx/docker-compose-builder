import { useCallback } from 'react';
import type { Graph, Cell, Node, Edge } from '@antv/x6';

export const useNodeEditor = (graph?: Graph) => {
  // 清理所有编辑工具
  const clearAllEditingTools = useCallback(() => {
    if (!graph) return;

    // 清理所有节点和边的工具
    graph.getCells().forEach(cell => {
      cell.removeTools();
    });
  }, [graph]);

  // 为节点使用官方的node-editor工具
  const addNodeEditor = (node: Node, event?: any) => {
    if (!graph) return;
    // 使用X6官方的node-editor工具
    node.addTools([{
      name: 'node-editor',
      args: {
        event,
       
      },
    }]);
  } 

  // 为边使用官方的edge-editor工具
  const addEdgeEditor = useCallback((edge: Edge, event?: any) => {
    if (!graph) return;

    // 使用X6官方的edge-editor工具
    edge.addTools([{
      name: 'edge-editor',
      args: {
        event
      },
    }]);
  }, [graph]);

  // 处理双击编辑
  const handleDoubleClick = useCallback((cell: Cell, event?: any) => {
    if (cell.isNode()) {
      addNodeEditor(cell as Node, event);
    } else if (cell.isEdge()) {
      addEdgeEditor(cell as Edge, event);
    }
  }, [addNodeEditor, addEdgeEditor]);

  return {
    clearAllEditingTools,
    addNodeEditor,
    addEdgeEditor,
    handleDoubleClick,
  };
};