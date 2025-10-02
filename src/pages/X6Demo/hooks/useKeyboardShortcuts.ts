import { useCallback, useEffect } from 'react';
import type { Graph } from '@antv/x6';
import { getCellsWithChildren } from '../utils/graphConfig';

export const useKeyboardShortcuts = (
  graph?: Graph,
  togglePanningMode?: (enabled: boolean) => void,
  isEditingInModal?: boolean
) => {
  const bindShortcuts = useCallback(() => {
    if (!graph) return;

    // 复制 (Ctrl/Cmd+C)
    graph.bindKey(['meta+c', 'ctrl+c'], () => {
      const selectedCells = graph.getSelectedCells();
      if (selectedCells.length) {
        const cellsWithChildren = getCellsWithChildren(selectedCells);
        const nodes = cellsWithChildren.filter(cell => cell.isNode());
        const edges = cellsWithChildren.filter(cell => cell.isEdge());

        graph.copy(cellsWithChildren);
        console.log(`已复制: 直接选中 ${selectedCells.length} 个元素，包含父子关系后 ${cellsWithChildren.length} 个元素`, {
          选中: selectedCells.length,
          总计: cellsWithChildren.length,
          节点: nodes.length,
          边: edges.length
        });
      }
      return false;
    });

    // 剪切 (Ctrl/Cmd+X)
    graph.bindKey(['meta+x', 'ctrl+x'], () => {
      const selectedCells = graph.getSelectedCells();
      if (selectedCells.length) {
        const cellsWithChildren = getCellsWithChildren(selectedCells);
        const nodes = cellsWithChildren.filter(cell => cell.isNode());
        const edges = cellsWithChildren.filter(cell => cell.isEdge());

        graph.cut(cellsWithChildren);
        console.log(`已剪切: 直接选中 ${selectedCells.length} 个元素，包含父子关系后 ${cellsWithChildren.length} 个元素`, {
          选中: selectedCells.length,
          总计: cellsWithChildren.length,
          节点: nodes.length,
          边: edges.length
        });
      }
      return false;
    });

    // 粘贴 (Ctrl/Cmd+V)
    graph.bindKey(['meta+v', 'ctrl+v'], () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 });

        // 为复制的docker-container节点确保完整配置
        cells.forEach((cell, index) => {
          if (cell.isNode() && cell.shape === 'docker-container') {
            const existingData = cell.getData() || {};
            const existingConfig = existingData.config || {};

            // 生成唯一的容器名和标签
            const currentLabel = cell.attr('text/text') || '';
            const baseLabel = currentLabel || existingConfig.containerName || 'container';
            const baseName = baseLabel.replace(/\d+$/, ''); // 移除末尾数字

            // 寻找下一个可用的数字后缀
            let suffix = 2;
            const allContainers = graph?.getNodes().filter(n => n.shape === 'docker-container') || [];
            const existingLabels = allContainers.map(n => n.attr('text/text') || '');

            while (existingLabels.includes(`${baseName}${suffix}`)) {
              suffix++;
            }

            const newLabel = `${baseName}${suffix}`;
            const containerName = newLabel;

            // 确保有完整的配置，包括switchNetworks
            const completeConfig = {
              containerName: containerName,
              image: existingConfig.image || 'docker.io/library/nginx:latest',
              ports: existingConfig.ports || ['80'],
              volumes: existingConfig.volumes || [],
              environment: existingConfig.environment || [],
              networkInterfaces: existingConfig.networkInterfaces || [
                {
                  interfaceName: 'eth0',
                  switchName: 'nginx-tomcat',
                  ipConfig: 'static',
                  staticIP: `172.20.0.${100 + index}`
                }
              ],
              switchNetworks: existingConfig.switchNetworks || {
                'nginx-tomcat': {
                  subnet: '172.20.0.0/16',
                  gateway: '172.20.0.1'
                },
                'switch1': {
                  subnet: '172.18.0.0/16',
                  gateway: '172.18.0.1'
                },
                'switch2': {
                  subnet: '172.19.0.0/16',
                  gateway: '172.19.0.1'
                }
              },
              entrypoint: existingConfig.entrypoint || '',
              entrypointIsArray: existingConfig.entrypointIsArray, // 保留格式标记
              command: existingConfig.command || 'tail -f /etc/hosts',
              commandIsArray: existingConfig.commandIsArray, // 保留格式标记
              restart: existingConfig.restart || 'unless-stopped'
            };

            // 设置节点标签和数据
            cell.attr('text/text', newLabel);
            cell.setData({
              ...existingData,
              config: completeConfig
            });
          }
        });

        graph.cleanSelection();
        graph.select(cells);
        console.log(`已粘贴 ${cells.length} 个元素`);
      }
      return false;
    });

    // 撤销 (Ctrl/Cmd+Z)
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (graph.history.canUndo()) {
        graph.history.undo();
      }
      return false;
    });

    // 重做 (Ctrl/Cmd+Shift+Z)
    graph.bindKey(['meta+shift+z', 'ctrl+shift+z', 'ctrl+y', 'meta+y'], () => {
      if (graph.history.canRedo()) {
        graph.history.redo();
      }
      return false;
    });

    // 全选 (Ctrl/Cmd+A)
    graph.bindKey(['meta+a', 'ctrl+a'], () => {
      const nodes = graph.getNodes();
      if (nodes) {
        graph.select(nodes);
      }
    });

    // 删除 (Delete/Backspace)
    const deleteSelected = () => {
      const activeElement = document.activeElement;

      // 检查是否在可编辑的文本元素中
      const isEditingText = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.getAttribute('contenteditable') === 'true' ||
        (activeElement as HTMLElement).isContentEditable ||
        (activeElement.tagName === 'DIV' &&
         activeElement.closest('.x6-widget-text-editor'))
      );

      // 检查是否在模态框中编辑
      const isEditingInModalNow = activeElement && (
        activeElement.closest('.ant-modal') ||
        activeElement.closest('[role="dialog"]') ||
        isEditingInModal
      );

      // 如果正在编辑文本或在模态框中，不执行删除节点操作
      if (isEditingText || isEditingInModalNow) {
        return false;
      }

      const selectedCells = graph.getSelectedCells();
      if (selectedCells.length) {
        const cellsWithChildren = getCellsWithChildren(selectedCells);
        const nodes = cellsWithChildren.filter(cell => cell.isNode());
        const edges = cellsWithChildren.filter(cell => cell.isEdge());

        graph.removeCells(cellsWithChildren);
        console.log(`已删除: 直接选中 ${selectedCells.length} 个元素，包含父子关系后 ${cellsWithChildren.length} 个元素`, {
          选中: selectedCells.length,
          总计: cellsWithChildren.length,
          节点: nodes.length,
          边: edges.length
        });
        return true;
      }
      return false;
    };

    graph.bindKey('delete', () => {
      const handled = deleteSelected();
      return handled;
    });

    // 缩放控制
    graph.bindKey(['ctrl+1', 'meta+1'], () => {
      const zoom = graph.zoom();
      if (zoom < 1.5) {
        graph.zoom(0.1);
      }
    });

    graph.bindKey(['ctrl+2', 'meta+2'], () => {
      const zoom = graph.zoom();
      if (zoom > 0.5) {
        graph.zoom(-0.1);
      }
    });

  }, [graph, isEditingInModal]);

  // 空格键控制拖拽模式
  useEffect(() => {
    let isSpacePressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        // 检查当前焦点是否在表单元素上
        const activeElement = document.activeElement;
        const isFormElement = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.getAttribute('contenteditable') === 'true'
        );

        // 如果焦点在表单元素上，不触发拖拽模式
        if (isFormElement) {
          return;
        }

        e.preventDefault();
        isSpacePressed = true;
        if (togglePanningMode) {
          togglePanningMode(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpacePressed) {
        e.preventDefault();
        isSpacePressed = false;
        if (togglePanningMode) {
          togglePanningMode(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [togglePanningMode]);

  return { bindShortcuts };
};