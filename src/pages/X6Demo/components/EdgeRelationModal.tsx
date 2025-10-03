import React, { useEffect, useRef } from 'react'
import { Graph } from '@antv/x6'
import { EdgeRelationModalData } from '../hooks/useEdgeContextMenu'

interface EdgeRelationModalProps {
  data: EdgeRelationModalData
  onClose: () => void
}

export const EdgeRelationModal: React.FC<EdgeRelationModalProps> = ({ data, onClose }) => {
  const miniGraphRef = useRef<HTMLDivElement>(null)
  const miniGraphInstance = useRef<Graph>()

  const { edge, sourceNode, targetNode } = data

  // 获取容器级别的节点信息
  const getContainerInfo = (node: any) => {
    if (!node) return null

    // 检查是否是 docker-container 或其子节点
    let containerNode = node

    // 如果是子节点，找到父容器
    if (node.shape !== 'docker-container') {
      const parent = node.getParent()
      if (parent && parent.shape === 'docker-container') {
        containerNode = parent
      } else {
        // 不是容器相关节点，返回基本信息
        return {
          isContainer: false,
          shape: node.shape || '未知',
          label: node.attr('text/text') || node.id,
          id: node.id,
          position: node.getPosition(),
        }
      }
    }

    // 提取容器信息
    const containerData = containerNode.getData() || {}
    const config = containerData.config || {}
    const children = containerNode.getChildren() || []

    // 获取服务名称
    const serviceNode = children.find((child: any) => child.shape === 'docker-service')
    const serviceName = serviceNode?.attr('text/text') || config.containerName || '未命名容器'

    // 获取镜像
    const imageNode = children.find((child: any) => child.shape === 'docker-image')
    const image = imageNode?.attr('text/text') || config.image || '无'

    // 获取端口
    const portNodes = children.filter((child: any) => child.shape === 'docker-port')
    const ports = portNodes.map((node: any) => node.attr('text/text'))

    // 获取网络
    const networkNodes = children.filter((child: any) => child.shape === 'docker-network')
    const networks = networkNodes.map((node: any) => {
      const data = node.getData()
      return data?.networkInterface || {}
    })

    return {
      isContainer: true,
      serviceName,
      image,
      ports,
      networks,
      restart: config.restart,
      user: config.user,
      position: containerNode.getPosition(),
      id: containerNode.id,
    }
  }

  // 获取节点信息（向后兼容非容器节点）
  const getNodeInfo = (node: any) => {
    if (!node) return { shape: '未知', label: '未知节点' }

    const shape = node.shape || '未知'
    const label = node.attr('text/text') || node.id
    const position = node.getPosition()
    const size = node.getSize()

    return {
      shape,
      label,
      id: node.id,
      position,
      size,
    }
  }

  // 获取边信息
  const getEdgeInfo = (edge: any) => {
    if (!edge) return {}

    const attrs = edge.getAttrs()
    const router = edge.getRouter()
    const data = edge.getData()

    return {
      id: edge.id,
      stroke: attrs?.line?.stroke || '未知',
      strokeWidth: attrs?.line?.strokeWidth || 1,
      strokeDasharray: attrs?.line?.strokeDasharray || '无',
      router: router?.name || '默认',
      data,
    }
  }

  const sourceContainerInfo = getContainerInfo(sourceNode)
  const targetContainerInfo = getContainerInfo(targetNode)
  const sourceInfo = getNodeInfo(sourceNode)
  const targetInfo = getNodeInfo(targetNode)
  const edgeInfo = getEdgeInfo(edge)

  // 判断关系类型
  const getRelationType = () => {
    const edgeData = edge?.getData() || {}
    if (edgeData.type === 'dependency') {
      return '依赖关系'
    }
    if (sourceNode?.shape === 'docker-network' || targetNode?.shape === 'network-switch') {
      return '网络连接'
    }
    if (sourceNode?.shape === 'network-switch' && targetNode?.shape === 'network-router') {
      return '网关连接'
    }
    return '未知关系'
  }

  const relationType = getRelationType()

  // 初始化迷你图形
  useEffect(() => {
    if (!miniGraphRef.current || !data.visible) return

    // 清理旧的图形实例
    if (miniGraphInstance.current) {
      miniGraphInstance.current.dispose()
    }

    // 创建迷你图形实例
    const miniGraph = new Graph({
      container: miniGraphRef.current,
      width: 700,
      height: 300,
      background: {
        color: '#f5f5f5',
      },
      grid: {
        size: 10,
        visible: true,
        type: 'dot',
        args: {
          color: '#d0d0d0',
          thickness: 1,
        },
      },
      interacting: false, // 禁用交互
      panning: false,
      mousewheel: false,
    })

    miniGraphInstance.current = miniGraph

    // 获取要显示的节点（如果是容器的子节点，则获取父容器）
    const getDisplayNode = (node: any) => {
      if (!node) return null

      // 如果是容器节点，直接返回
      if (node.shape === 'docker-container') {
        return node
      }

      // 如果是容器的子节点，返回父容器
      const parent = node.getParent()
      if (parent && parent.shape === 'docker-container') {
        return parent
      }

      // 其他情况返回节点本身
      return node
    }

    const sourceDisplayNode = getDisplayNode(sourceNode)
    const targetDisplayNode = getDisplayNode(targetNode)

    // 计算节点位置以居中显示
    const centerX = 350
    const centerY = 150
    const nodeSpacing = 300

    const clonedNodes: any = {}

    // 克隆并添加源节点（包含子节点）
    if (sourceDisplayNode) {
      const sourceClone = sourceDisplayNode.clone({ deep: true })
      sourceClone.position(centerX - nodeSpacing / 2 - sourceClone.size().width / 2, centerY - sourceClone.size().height / 2)
      miniGraph.addNode(sourceClone)
      clonedNodes[sourceDisplayNode.id] = sourceClone

      // 添加子节点
      const children = sourceDisplayNode.getChildren()
      if (children && children.length > 0) {
        children.forEach((child: any) => {
          const childClone = child.clone()
          sourceClone.addChild(childClone)
          miniGraph.addNode(childClone)
        })
      }
    }

    // 克隆并添加目标节点（包含子节点）
    if (targetDisplayNode && targetDisplayNode.id !== sourceDisplayNode?.id) {
      const targetClone = targetDisplayNode.clone({ deep: true })
      targetClone.position(centerX + nodeSpacing / 2 - targetClone.size().width / 2, centerY - targetClone.size().height / 2)
      miniGraph.addNode(targetClone)
      clonedNodes[targetDisplayNode.id] = targetClone

      // 添加子节点
      const children = targetDisplayNode.getChildren()
      if (children && children.length > 0) {
        children.forEach((child: any) => {
          const childClone = child.clone()
          targetClone.addChild(childClone)
          miniGraph.addNode(childClone)
        })
      }
    }

    // 克隆并添加边
    if (edge) {
      const edgeClone = edge.clone()

      // 增强边的视觉效果
      edgeClone.attr({
        line: {
          strokeWidth: 3,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      })

      // 如果源节点和目标节点都是容器，直接连接容器
      if (sourceDisplayNode?.shape === 'docker-container' && targetDisplayNode?.shape === 'docker-container') {
        const sourceClone = clonedNodes[sourceDisplayNode.id]
        const targetClone = clonedNodes[targetDisplayNode.id]

        if (sourceClone && targetClone) {
          edgeClone.setSource(sourceClone)
          edgeClone.setTarget(targetClone)
          miniGraph.addEdge(edgeClone)
        }
      } else {
        // 否则，尝试连接原始节点
        const allNodes = miniGraph.getNodes()
        const sourceCloneNode = allNodes.find(n => n.id === sourceNode?.id)
        const targetCloneNode = allNodes.find(n => n.id === targetNode?.id)

        if (sourceCloneNode && targetCloneNode) {
          edgeClone.setSource(sourceCloneNode)
          edgeClone.setTarget(targetCloneNode)
          miniGraph.addEdge(edgeClone)
        }
      }
    }

    // 清理函数
    return () => {
      if (miniGraphInstance.current) {
        miniGraphInstance.current.dispose()
        miniGraphInstance.current = undefined
      }
    }
  }, [data.visible, edge, sourceNode, targetNode])

  if (!data.visible) return null

  return (
    <>
      {/* 遮罩层 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex: 1000,
        }}
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1001,
          minWidth: '600px',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        {/* 标题 */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {relationType} - 详细信息
          <span
            style={{
              float: 'right',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#999',
            }}
            onClick={onClose}
          >
            ×
          </span>
        </div>

        {/* 内容 */}
        <div style={{ padding: '24px' }}>
          {/* 迷你图形视图 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#722ed1' }}>🔍 关系图示</h3>
            <div
              ref={miniGraphRef}
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                overflow: 'hidden',
                background: '#f5f5f5',
              }}
            />
          </div>

          {/* 源节点信息 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#1890ff' }}>
              源节点 {sourceContainerInfo?.isContainer && '(Docker 容器)'}
            </h3>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              {sourceContainerInfo?.isContainer ? (
                <>
                  <p><strong>🐳 服务名称:</strong> {sourceContainerInfo.serviceName}</p>
                  <p><strong>📦 镜像:</strong> {sourceContainerInfo.image}</p>
                  {sourceContainerInfo.user && (
                    <p><strong>👤 用户:</strong> {sourceContainerInfo.user}</p>
                  )}
                  {sourceContainerInfo.restart && (
                    <p><strong>🔄 重启策略:</strong> {sourceContainerInfo.restart}</p>
                  )}
                  {sourceContainerInfo.ports && sourceContainerInfo.ports.length > 0 && (
                    <p><strong>🔌 端口:</strong> {sourceContainerInfo.ports.join(', ')}</p>
                  )}
                  {sourceContainerInfo.networks && sourceContainerInfo.networks.length > 0 && (
                    <div>
                      <strong>🌐 网络:</strong>
                      {sourceContainerInfo.networks.map((net: any, idx: number) => (
                        <div key={idx} style={{ marginLeft: '16px', fontSize: '12px' }}>
                          • {net.interfaceName} → {net.switchName} ({net.ipConfig === 'static' ? net.staticIP : 'DHCP'})
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                    <strong>ID:</strong> {sourceContainerInfo.id}
                  </p>
                </>
              ) : (
                <>
                  <p><strong>类型:</strong> {sourceInfo.shape}</p>
                  <p><strong>标签:</strong> {sourceInfo.label}</p>
                  <p><strong>ID:</strong> {sourceInfo.id}</p>
                  {sourceInfo.position && (
                    <p><strong>位置:</strong> ({sourceInfo.position.x}, {sourceInfo.position.y})</p>
                  )}
                  {sourceInfo.size && (
                    <p><strong>尺寸:</strong> {sourceInfo.size.width} × {sourceInfo.size.height}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 边信息 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#52c41a' }}>连接信息</h3>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              {/* 关系说明 */}
              {relationType === '依赖关系' && sourceContainerInfo?.isContainer && targetContainerInfo?.isContainer && (
                <div style={{
                  background: '#fff7e6',
                  border: '1px solid #ffd591',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}>
                  <p style={{ margin: 0, color: '#d46b08' }}>
                    <strong>📋 关系说明:</strong> 容器 <strong>{targetContainerInfo.serviceName}</strong> 依赖于 <strong>{sourceContainerInfo.serviceName}</strong>
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ad6800' }}>
                    这意味着 {sourceContainerInfo.serviceName} 必须先启动，{targetContainerInfo.serviceName} 才会启动。
                  </p>
                </div>
              )}

              {relationType === '网络连接' && (
                <div style={{
                  background: '#e6f7ff',
                  border: '1px solid #91d5ff',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}>
                  <p style={{ margin: 0, color: '#096dd9' }}>
                    <strong>🌐 关系说明:</strong> 网络接口连接到交换机
                  </p>
                </div>
              )}

              <p><strong>类型:</strong> {relationType}</p>
              <p><strong>边ID:</strong> {edgeInfo.id}</p>
              <p><strong>颜色:</strong> <span style={{ color: edgeInfo.stroke }}>{edgeInfo.stroke}</span></p>
              <p><strong>线宽:</strong> {edgeInfo.strokeWidth}px</p>
              <p><strong>线型:</strong> {edgeInfo.strokeDasharray}</p>
              <p><strong>路由:</strong> {edgeInfo.router}</p>
              {edgeInfo.data && Object.keys(edgeInfo.data).length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>数据:</strong>
                  <pre style={{
                    background: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                  }}>
                    {JSON.stringify(edgeInfo.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* 目标节点信息 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#ff4d4f' }}>
              目标节点 {targetContainerInfo?.isContainer && '(Docker 容器)'}
            </h3>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              {targetContainerInfo?.isContainer ? (
                <>
                  <p><strong>🐳 服务名称:</strong> {targetContainerInfo.serviceName}</p>
                  <p><strong>📦 镜像:</strong> {targetContainerInfo.image}</p>
                  {targetContainerInfo.user && (
                    <p><strong>👤 用户:</strong> {targetContainerInfo.user}</p>
                  )}
                  {targetContainerInfo.restart && (
                    <p><strong>🔄 重启策略:</strong> {targetContainerInfo.restart}</p>
                  )}
                  {targetContainerInfo.ports && targetContainerInfo.ports.length > 0 && (
                    <p><strong>🔌 端口:</strong> {targetContainerInfo.ports.join(', ')}</p>
                  )}
                  {targetContainerInfo.networks && targetContainerInfo.networks.length > 0 && (
                    <div>
                      <strong>🌐 网络:</strong>
                      {targetContainerInfo.networks.map((net: any, idx: number) => (
                        <div key={idx} style={{ marginLeft: '16px', fontSize: '12px' }}>
                          • {net.interfaceName} → {net.switchName} ({net.ipConfig === 'static' ? net.staticIP : 'DHCP'})
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                    <strong>ID:</strong> {targetContainerInfo.id}
                  </p>
                </>
              ) : (
                <>
                  <p><strong>类型:</strong> {targetInfo.shape}</p>
                  <p><strong>标签:</strong> {targetInfo.label}</p>
                  <p><strong>ID:</strong> {targetInfo.id}</p>
                  {targetInfo.position && (
                    <p><strong>位置:</strong> ({targetInfo.position.x}, {targetInfo.position.y})</p>
                  )}
                  {targetInfo.size && (
                    <p><strong>尺寸:</strong> {targetInfo.size.width} × {targetInfo.size.height}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #f0f0f0',
            textAlign: 'right',
          }}
        >
          <button
            style={{
              padding: '6px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </>
  )
}
