import type { Graph, Cell } from '@antv/x6';

export interface MenuAction {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
}

export const getMenuActions = (
  type: 'node' | 'edge' | 'blank',
  graph: Graph,
  target?: Cell
): MenuAction[] => {
  const commonActions: MenuAction[] = [
    { key: 'copy', label: '复制', icon: '📋' },
    { key: 'paste', label: '粘贴', icon: '📄', disabled: graph.isClipboardEmpty() },
    { key: 'divider1', label: '', divider: true },
    { key: 'undo', label: '撤销', icon: '↶', disabled: !graph.canUndo() },
    { key: 'redo', label: '重做', icon: '↷', disabled: !graph.canRedo() },
  ];

  if (type === 'node' || type === 'edge') {
    const textActions = [
      { key: 'editText', label: '编辑文本', icon: '✏️' },
      { key: 'increaseFontSize', label: '增大字体', icon: '🔍+' },
      { key: 'decreaseFontSize', label: '减小字体', icon: '🔍-' },
      { key: 'toggleBold', label: '粗体/正常', icon: '𝐁' },
    ];

    const colorActions = [
      { key: 'fillColor-blue', label: '蓝色填充', icon: '🔵' },
      { key: 'fillColor-green', label: '绿色填充', icon: '🟢' },
      { key: 'fillColor-red', label: '红色填充', icon: '🔴' },
      { key: 'fillColor-yellow', label: '黄色填充', icon: '🟡' },
      { key: 'fillColor-purple', label: '紫色填充', icon: '🟣' },
      { key: 'fillColor-gray', label: '灰色填充', icon: '⚫' },
      { key: 'divider-color', label: '', divider: true },
      { key: 'textColor-black', label: '黑色文字', icon: '⚫' },
      { key: 'textColor-red', label: '红色文字', icon: '🔴' },
      { key: 'textColor-blue', label: '蓝色文字', icon: '🔵' },
      { key: 'textColor-green', label: '绿色文字', icon: '🟢' },
    ];

    return [
      { key: 'copy', label: '复制', icon: '📋' },
      { key: 'cut', label: '剪切', icon: '✂️' },
      { key: 'delete', label: '删除', icon: '🗑️' },
      { key: 'divider1', label: '', divider: true },
      ...textActions,
      { key: 'divider2', label: '', divider: true },
      ...colorActions,
      { key: 'divider3', label: '', divider: true },
      { key: 'toTop', label: '置于顶层', icon: '⬆️' },
      { key: 'toBottom', label: '置于底层', icon: '⬇️' },
      { key: 'divider4', label: '', divider: true },
      ...commonActions,
    ];
  }

  if (type === 'blank') {
    return [
      { key: 'paste', label: '粘贴', icon: '📄', disabled: graph.isClipboardEmpty() },
      { key: 'selectAll', label: '全选', icon: '🔲' },
      { key: 'divider1', label: '', divider: true },
      { key: 'undo', label: '撤销', icon: '↶', disabled: !graph.canUndo() },
      { key: 'redo', label: '重做', icon: '↷', disabled: !graph.canRedo() },
      { key: 'divider2', label: '', divider: true },
      { key: 'zoomToFit', label: '适应画布', icon: '🔍' },
      { key: 'zoomToActual', label: '实际大小', icon: '🔎' },
    ];
  }

  return commonActions;
};

export const handleMenuAction = (
  action: string,
  graph: Graph,
  target?: Cell,
  contextType?: 'node' | 'edge' | 'blank'
) => {
  switch (action) {
    case 'copy':
      if (target) {
        graph.copy([target]);
      } else {
        const selected = graph.getSelectedCells();
        if (selected.length) graph.copy(selected);
      }
      break;

    case 'cut':
      if (target) {
        graph.cut([target]);
      } else {
        const selected = graph.getSelectedCells();
        if (selected.length) graph.cut(selected);
      }
      break;

    case 'paste':
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 });
        graph.cleanSelection();
        graph.select(cells);
      }
      break;

    case 'delete':
      if (target) {
        graph.removeCell(target);
      } else {
        const selected = graph.getSelectedCells();
        if (selected.length) graph.removeCells(selected);
      }
      break;

    case 'toTop':
      if (target) target.toFront();
      break;

    case 'toBottom':
      if (target) target.toBack();
      break;

    case 'selectAll':
      const allCells = graph.getCells();
      if (allCells.length) graph.select(allCells);
      break;

    case 'undo':
      if (graph.canUndo()) graph.undo();
      break;

    case 'redo':
      if (graph.canRedo()) graph.redo();
      break;

    case 'zoomToFit':
      graph.zoomToFit({ padding: 20 });
      break;

    case 'zoomToActual':
      graph.zoom(1);
      graph.centerContent();
      break;


    case 'editText':
      if (target) {
        target.addTools([{ name: 'node-editor' }]);
      }
      break;

    case 'increaseFontSize':
      if (target) {
        const textSelector = target.shape === 'custom-image' ? 'label/fontSize' : 'text/fontSize';
        const currentSize = Number(target.attr(textSelector)) || 14;
        target.attr(textSelector, Math.min(currentSize + 2, 48));
      }
      break;

    case 'decreaseFontSize':
      if (target) {
        const textSelector = target.shape === 'custom-image' ? 'label/fontSize' : 'text/fontSize';
        const currentSize = Number(target.attr(textSelector)) || 14;
        target.attr(textSelector, Math.max(currentSize - 2, 8));
      }
      break;

    case 'toggleBold':
      if (target) {
        const textSelector = target.shape === 'custom-image' ? 'label/fontWeight' : 'text/fontWeight';
        const currentWeight = target.attr(textSelector) || 'normal';
        target.attr(textSelector, currentWeight === 'bold' ? 'normal' : 'bold');
      }
      break;

    default:
      // 处理颜色相关操作
      if (action.startsWith('fillColor-')) {
        const colorMap: Record<string, string> = {
          'fillColor-blue': '#1890ff',
          'fillColor-green': '#52c41a',
          'fillColor-red': '#ff4d4f',
          'fillColor-yellow': '#faad14',
          'fillColor-purple': '#722ed1',
          'fillColor-gray': '#8c8c8c',
        };
        if (target && colorMap[action]) {
          target.attr('body/fill', colorMap[action]);
        }
      } else if (action.startsWith('textColor-')) {
        const colorMap: Record<string, string> = {
          'textColor-black': '#000000',
          'textColor-red': '#ff4d4f',
          'textColor-blue': '#1890ff',
          'textColor-green': '#52c41a',
        };
        if (target && colorMap[action]) {
          const textSelector = target.shape === 'custom-image' ? 'label/fill' : 'text/fill';
          target.attr(textSelector, colorMap[action]);
        }
      }
      break;
  }
};