import { useState, useCallback } from 'react';
import type { Cell, Graph } from '@antv/x6';
import { getMenuActions, handleMenuAction, type MenuAction } from '../utils/contextMenu';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: 'node' | 'edge' | 'blank';
  target?: Cell;
}

export const useContextMenu = (graph?: Graph) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    type: 'blank',
  });

  const showContextMenu = useCallback((
    e: MouseEvent,
    type: 'node' | 'edge' | 'blank',
    target?: Cell
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type,
      target,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const getMenuItems = useCallback((): MenuAction[] => {
    if (!graph) return [];
    return getMenuActions(contextMenu.type, graph, contextMenu.target);
  }, [graph, contextMenu.type, contextMenu.target]);

  const handleAction = useCallback((action: string) => {
    if (!graph) return;

    handleMenuAction(action, graph, contextMenu.target, contextMenu.type);
    hideContextMenu();
  }, [graph, contextMenu.target, contextMenu.type, hideContextMenu]);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    getMenuItems,
    handleAction,
  };
};