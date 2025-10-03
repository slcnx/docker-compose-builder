import React from 'react'
import { EdgeContextMenuState } from '../hooks/useEdgeContextMenu'

interface EdgeContextMenuProps {
  contextMenu: EdgeContextMenuState
  onMenuItemClick: (action: string) => void
  onHide: () => void
}

export const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({
  contextMenu,
  onMenuItemClick,
  onHide,
}) => {
  if (!contextMenu.visible) return null

  return (
    <>
      {/* 背景遮罩，点击关闭菜单 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onClick={onHide}
      />

      {/* 菜单内容 */}
      <div
        style={{
          position: 'fixed',
          left: contextMenu.x,
          top: contextMenu.y,
          background: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '150px',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            borderBottom: '1px solid #f0f0f0',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
          }}
          onClick={() => onMenuItemClick('solid-line')}
        >
          实线
        </div>

        <div
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            borderBottom: '1px solid #f0f0f0',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
          }}
          onClick={() => onMenuItemClick('dashed-line')}
        >
          虚线
        </div>

        <div
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
          }}
          onClick={() => onMenuItemClick('focus-relation')}
        >
          🔍 聚焦关系
        </div>
      </div>
    </>
  )
}
