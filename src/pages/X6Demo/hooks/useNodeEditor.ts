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
    console.log('add node-editor')
    // 使用X6官方的node-editor工具
    node.addTools([{
      name: 'node-editor',
      args: {
        event,
        // attrs: {
        //   fontSize: '12px',
        //   fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        //   color: '#333',
        //   backgroundColor: '#fff',
        // },
        // getText() {
        //   return node.attr('text/text') || '文本';
        // },
        // setText(text: string) {
        //   const newText = text.trim() || '文本';
        //   node.attr('text/text', newText);
        // },
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
        event,
        labelAddable: true,
        attrs: {
          fontSize: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#333',
          backgroundColor: '#fff',
        },
        getText() {
          return edge.getLabels()?.[0]?.attrs?.text?.text || '';
        },
        setText(text: string) {
          const newText = text.trim();
          if (newText) {
            edge.setLabels([{
              attrs: {
                text: {
                  text: newText,
                  fontSize: 12,
                  fill: '#333',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
                rect: {
                  fill: '#fff',
                  stroke: '#1890ff',
                  strokeWidth: 1,
                  rx: 4,
                  ry: 4,
                  refWidth: '100%',
                  refHeight: '100%',
                  refX: '-50%',
                  refY: '-50%',
                },
              },
            }]);
          } else {
            edge.setLabels([]);
          }
        },
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