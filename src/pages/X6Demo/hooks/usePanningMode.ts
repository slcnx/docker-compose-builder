import { useState, useCallback } from 'react';
import type { Graph } from '@antv/x6';

export const usePanningMode = (graph?: Graph) => {
  const [isDragMode, setIsDragMode] = useState(false);

  const togglePanningMode = useCallback((enabled: boolean) => {
    if (!graph) return;

    setIsDragMode(enabled);

    if (enabled) {
      // 开启拖拽模式
      graph.enablePanning();
      graph.disableSelection();
      graph.disableRubberband();
    } else {
      // 关闭拖拽模式
      graph.disablePanning();
      graph.enableSelection();
      graph.enableRubberband();
    }
  }, [graph]);

  return {
    isDragMode,
    togglePanningMode,
  };
};