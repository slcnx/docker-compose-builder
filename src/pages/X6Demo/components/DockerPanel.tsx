import React, { useState } from 'react'

interface DockerPanelProps {
  dockerFactory?: any
  onClose?: () => void
}

export const DockerPanel: React.FC<DockerPanelProps> = ({ dockerFactory, onClose }) => {
  const [containerName, setContainerName] = useState('n1')
  const [imageName, setImageName] = useState('nginx:latest')
  const [entrypoint, setEntrypoint] = useState('')  // 默认为空，导出时会变成[]
  const [command, setCommand] = useState('tail -f /etc/hosts')  // 默认命令
  const [ports, setPorts] = useState('80')
  const [volumes, setVolumes] = useState('')
  const [restartPolicy, setRestartPolicy] = useState('always')  // 全局restart策略
  const [networkInterfaces, setNetworkInterfaces] = useState<{
    interfaceName: string
    switchName: string
    ipConfig: 'static' | 'dynamic'
    staticIP?: string
  }[]>([])
  const [newSwitchName, setNewSwitchName] = useState('nginx-tomcat')
  const [newSwitchSubnet, setNewSwitchSubnet] = useState('172.20.0.0/16')
  const [newSwitchGateway, setNewSwitchGateway] = useState('172.20.0.1')
  const [availableSwitches, setAvailableSwitches] = useState<string[]>(['switch1', 'switch2'])
  const [existingNetworks, setExistingNetworks] = useState<Array<{
    id: string
    label: string
    isConnected: boolean
    connectedSwitch?: string
  }>>([])

  // 交换机网络配置
  const [switchNetworks, setSwitchNetworks] = useState<{
    [switchName: string]: {
      subnet: string
      gateway: string
    }
  }>({
    'switch1': { subnet: '172.18.0.0/16', gateway: '172.18.0.1' },
    'switch2': { subnet: '172.19.0.0/16', gateway: '172.19.0.1' }
  })

  // 从图中同步现有交换机
  const syncSwitchesFromGraph = () => {
    if (!dockerFactory) return

    // 获取图中所有交换机节点
    const existingSwitches = dockerFactory.graph.getNodes()
      .filter((node: any) => node.shape === 'network-switch')
      .map((node: any) => node.attr('text/text') || 'switch')

    // 合并现有状态和图中的交换机，去重
    const allSwitches = [...new Set([...availableSwitches, ...existingSwitches])]
    setAvailableSwitches(allSwitches)
  }

  // 刷新画布上现有的网卡节点
  const refreshExistingNetworks = () => {
    if (!dockerFactory) return

    const networkNodes = dockerFactory.getNetworkNodes()
    const networks = networkNodes.map((node: any) => ({
      id: node.id,
      label: node.attr('text/text') || 'network',
      isConnected: dockerFactory.isNetworkConnected(node.id),
      connectedSwitch: dockerFactory.getConnectedSwitch(node.id)
    }))

    setExistingNetworks(networks)
  }

  // 连接网卡到交换机
  const handleConnectNetwork = (networkId: string, switchName: string) => {
    if (!dockerFactory) return

    // 获取交换机的网络配置
    const switchNetworkConfig = switchNetworks[switchName]

    const success = dockerFactory.manualConnectNetworkToSwitch(networkId, switchName, switchNetworkConfig)
    if (success) {
      // 刷新网卡状态
      refreshExistingNetworks()
      // 刷新交换机列表（可能创建了新交换机）
      syncSwitchesFromGraph()
    }
  }

  // 断开网卡连接
  const handleDisconnectNetwork = (networkId: string) => {
    if (!dockerFactory) return

    const success = dockerFactory.disconnectNetworkFromSwitch(networkId)
    if (success) {
      refreshExistingNetworks()
    }
  }

  // 组件挂载时和dockerFactory变化时同步交换机和网卡
  React.useEffect(() => {
    if (dockerFactory) {
      syncSwitchesFromGraph()
      refreshExistingNetworks()
    }
  }, [dockerFactory])

  const handleCreateArchitecture = () => {
    if (!dockerFactory) return

    const config = {
      containerName: containerName || 'my-container',
      image: imageName || 'docker.io/library/nginx:latest',
      entrypoint: entrypoint.trim() || undefined,
      command: command.trim() || 'tail -f /etc/hosts', // 默认命令
      restart: restartPolicy, // 添加restart策略
      ports: ports.split(',').map(p => p.trim()).filter(Boolean),
      volumes: volumes.split(',').map(v => v.trim()).filter(Boolean),
      networkInterfaces: networkInterfaces,
      switchNetworks: switchNetworks, // 传递交换机网络配置
    }

    dockerFactory.createDockerArchitecture(config)
    // 刷新网卡状态
    setTimeout(() => {
      refreshExistingNetworks()
    }, 200)
    onClose?.()
  }

  const handleCreateSwitch = () => {
    if (!dockerFactory || !newSwitchName.trim()) return

    const switchName = newSwitchName.trim()

    // 检查交换机是否已存在
    if (availableSwitches.includes(switchName)) {
      alert('交换机已存在！')
      return
    }

    // 验证网络配置格式
    if (!newSwitchSubnet.trim() || !newSwitchGateway.trim()) {
      alert('请填写完整的网络配置！')
      return
    }

    // 在图中创建交换机节点
    dockerFactory.createSwitch(switchName)

    // 保存交换机网络配置
    setSwitchNetworks(prev => ({
      ...prev,
      [switchName]: {
        subnet: newSwitchSubnet.trim(),
        gateway: newSwitchGateway.trim()
      }
    }))

    // 从图中重新同步交换机列表
    setTimeout(() => {
      syncSwitchesFromGraph()
    }, 100)

    setNewSwitchName('')
    // 自动递增网络段
    const currentNetwork = parseInt(newSwitchSubnet.split('.')[2])
    const nextNetwork = currentNetwork + 1
    setNewSwitchSubnet(`172.${nextNetwork}.0.0/16`)
    setNewSwitchGateway(`172.${nextNetwork}.0.1`)
  }

  const handleAddNetworkInterface = () => {
    const newInterface = {
      interfaceName: `eth${networkInterfaces.length}`,
      switchName: availableSwitches[0] || '',
      ipConfig: 'dynamic' as const,
      staticIP: undefined
    }
    setNetworkInterfaces(prev => [...prev, newInterface])
  }

  const handleRemoveNetworkInterface = (index: number) => {
    setNetworkInterfaces(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateNetworkInterface = (index: number, field: keyof typeof networkInterfaces[0], value: any) => {
    setNetworkInterfaces(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value }

        // 如果切换到静态IP模式，自动填充建议的IP
        if (field === 'ipConfig' && value === 'static' && !updated.staticIP) {
          const switchNetwork = switchNetworks[updated.switchName]
          if (switchNetwork) {
            // 从网关IP推算一个建议的静态IP
            const gatewayParts = switchNetwork.gateway.split('.')
            gatewayParts[3] = String(100 + index) // 基于接口索引设置IP
            updated.staticIP = gatewayParts.join('.')
          }
        }

        // 如果切换到动态IP模式，清除静态IP
        if (field === 'ipConfig' && value === 'dynamic') {
          updated.staticIP = undefined
        }

        return updated
      }
      return item
    }))
  }

  const handleClear = () => {
    if (!dockerFactory) return
    dockerFactory.clear()

    // 重置交换机列表到默认状态
    setAvailableSwitches(['switch1', 'switch2'])
    // 清空网卡列表
    setExistingNetworks([])
  }

  const handleCreateExample = () => {
    if (!dockerFactory) return

    // 创建示例交换机（如果不存在）
    if (!availableSwitches.includes('switch1')) {
      dockerFactory.createSwitch('switch1')
    }
    if (!availableSwitches.includes('switch2')) {
      dockerFactory.createSwitch('switch2')
    }

    // 同步交换机列表
    setTimeout(() => {
      syncSwitchesFromGraph()
    }, 100)

    // 创建示例 Nginx 架构
    const exampleConfig = {
      containerName: 'nginx-container',
      image: 'docker.io/library/nginx:latest',
      entrypoint: '/docker-entrypoint',
      command: 'nginx -g daemon off',
      ports: ['8080', '9090', '9091'],
      volumes: [
        '/data/container1/app:/app/data',
        '/data/container1/app2:/app/data2'
      ],
      networkInterfaces: [
        {
          interfaceName: 'eth0',
          switchName: 'switch1',
          ipConfig: 'static' as const,
          staticIP: '172.16.0.100'
        },
        {
          interfaceName: 'eth1',
          switchName: 'switch2',
          ipConfig: 'dynamic' as const
        }
      ],
    }

    dockerFactory.createDockerArchitecture(exampleConfig)
    // 刷新网卡状态
    setTimeout(() => {
      refreshExistingNetworks()
    }, 200)
    onClose?.()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    marginBottom: '8px',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical' as const,
    fontFamily: 'monospace',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px',
    marginBottom: '8px',
  }

  const clearButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#333',
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', fontWeight: 600, color: '#333', fontSize: '16px' }}>
        🐳 Docker 配置面板
      </div>

      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '14px' }}>基础配置</h4>

        <label style={labelStyle}>容器名称</label>
        <input
          type="text"
          value={containerName}
          onChange={(e) => setContainerName(e.target.value)}
          placeholder="容器名称"
          style={inputStyle}
        />

        <label style={labelStyle}>镜像</label>
        <input
          type="text"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          placeholder="docker.io/library/nginx:latest"
          style={inputStyle}
        />
      </div>

      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '14px' }}>启动配置</h4>

        <label style={labelStyle}>入口点脚本</label>
        <input
          type="text"
          value={entrypoint}
          onChange={(e) => setEntrypoint(e.target.value)}
          placeholder="/docker-entrypoint"
          style={inputStyle}
        />

        <label style={labelStyle}>启动命令</label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="tail -f /etc/hosts"
          style={inputStyle}
        />

        <label style={labelStyle}>重启策略</label>
        <select
          value={restartPolicy}
          onChange={(e) => setRestartPolicy(e.target.value)}
          style={inputStyle}
        >
          <option value="no">no - 不自动重启</option>
          <option value="always">always - 总是重启</option>
          <option value="unless-stopped">unless-stopped - 除非手动停止</option>
          <option value="on-failure">on-failure - 仅故障时重启</option>
        </select>
      </div>

      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '14px' }}>网络与存储</h4>

        <label style={labelStyle}>端口映射 (逗号分隔)</label>
        <textarea
          value={ports}
          onChange={(e) => setPorts(e.target.value)}
          placeholder="8080,9090,9091"
          style={textareaStyle}
        />

        <label style={labelStyle}>卷映射 (逗号分隔)</label>
        <textarea
          value={volumes}
          onChange={(e) => setVolumes(e.target.value)}
          placeholder="/host/path:/container/path"
          style={textareaStyle}
        />

        <label style={labelStyle}>交换机管理</label>

        {/* 创建新交换机 */}
        <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
          <div style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 'bold' }}>创建新交换机</div>

          <div style={{ marginBottom: '6px' }}>
            <input
              type="text"
              value={newSwitchName}
              onChange={(e) => setNewSwitchName(e.target.value)}
              placeholder="交换机名称"
              style={{ ...inputStyle, marginBottom: '0', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <input
              type="text"
              value={newSwitchSubnet}
              onChange={(e) => setNewSwitchSubnet(e.target.value)}
              placeholder="网络子网 (如: 172.20.0.0/16)"
              style={{ ...inputStyle, marginBottom: '0', fontSize: '12px', flex: 2 }}
            />
            <input
              type="text"
              value={newSwitchGateway}
              onChange={(e) => setNewSwitchGateway(e.target.value)}
              placeholder="网关 (如: 172.20.0.1)"
              style={{ ...inputStyle, marginBottom: '0', fontSize: '12px', flex: 1 }}
            />
          </div>

          <button
            onClick={handleCreateSwitch}
            style={{
              width: '100%',
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ➕ 创建交换机
          </button>
        </div>

        {/* 网络接口管理 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>网络接口配置：</span>
          <button
            onClick={handleAddNetworkInterface}
            style={{
              padding: '4px 8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            ➕ 添加接口
          </button>
        </div>

        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {networkInterfaces.length === 0 ? (
            <div style={{ color: '#999', fontSize: '12px', textAlign: 'center', padding: '16px' }}>
              暂无网络接口，点击"添加接口"创建
            </div>
          ) : (
            networkInterfaces.map((networkInterface, index) => (
              <div key={index} style={{
                border: '1px solid #e9ecef',
                borderRadius: '3px',
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>接口 {index + 1}</span>
                  <button
                    onClick={() => handleRemoveNetworkInterface(index)}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '10px',
                    }}
                  >
                    删除
                  </button>
                </div>

                {/* 接口名称 */}
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#666' }}>接口名称：</label>
                  <input
                    type="text"
                    value={networkInterface.interfaceName}
                    onChange={(e) => handleUpdateNetworkInterface(index, 'interfaceName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '11px',
                    }}
                  />
                </div>

                {/* 交换机选择 */}
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#666' }}>连接交换机：</label>
                  <select
                    value={networkInterface.switchName}
                    onChange={(e) => handleUpdateNetworkInterface(index, 'switchName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '11px',
                    }}
                  >
                    {availableSwitches.map(switchName => (
                      <option key={switchName} value={switchName}>{switchName}</option>
                    ))}
                  </select>
                </div>

                {/* 显示选中交换机的网络信息 */}
                {switchNetworks[networkInterface.switchName] && (
                  <div style={{
                    padding: '4px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '2px',
                    marginBottom: '4px',
                    fontSize: '10px',
                    color: '#0066cc'
                  }}>
                    📡 网络: {switchNetworks[networkInterface.switchName].subnet}
                    <br />
                    🏠 网关: {switchNetworks[networkInterface.switchName].gateway}
                  </div>
                )}

                {/* IP配置方式 */}
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#666' }}>IP配置：</label>
                  <select
                    value={networkInterface.ipConfig}
                    onChange={(e) => handleUpdateNetworkInterface(index, 'ipConfig', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '11px',
                    }}
                  >
                    <option value="dynamic">动态分配 (DHCP)</option>
                    <option value="static">静态IP</option>
                  </select>
                </div>

                {/* 静态IP输入 */}
                {networkInterface.ipConfig === 'static' && (
                  <div>
                    <label style={{ fontSize: '11px', color: '#666' }}>静态IP地址：</label>
                    <input
                      type="text"
                      value={networkInterface.staticIP || ''}
                      onChange={(e) => handleUpdateNetworkInterface(index, 'staticIP', e.target.value)}
                      placeholder={
                        switchNetworks[networkInterface.switchName]
                          ? `在 ${switchNetworks[networkInterface.switchName].subnet} 中的IP`
                          : "如: 172.20.0.100"
                      }
                      style={{
                        width: '100%',
                        padding: '2px 4px',
                        border: '1px solid #ddd',
                        borderRadius: '2px',
                        fontSize: '11px',
                      }}
                    />
                    {switchNetworks[networkInterface.switchName] && (
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>
                        💡 建议IP范围: {switchNetworks[networkInterface.switchName].subnet}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 现有网卡连接管理 */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>现有网卡连接管理：</span>
            <button
              onClick={refreshExistingNetworks}
              style={{
                padding: '4px 8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              🔄 刷新
            </button>
          </div>

          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {existingNetworks.length === 0 ? (
              <div style={{ color: '#999', fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                暂无网卡节点，请先创建容器架构
              </div>
            ) : (
              existingNetworks.map((network) => (
                <div key={network.id} style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '3px',
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: network.isConnected ? '#e8f5e8' : '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: network.isConnected ? '#28a745' : '#6c757d'
                    }}>
                      📡 {network.label}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: network.isConnected ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {network.isConnected ? '已连接' : '未连接'}
                    </span>
                  </div>

                  {network.isConnected && network.connectedSwitch && (
                    <div style={{
                      fontSize: '10px',
                      color: '#28a745',
                      marginBottom: '6px',
                      padding: '2px 0'
                    }}>
                      🔗 连接到: {network.connectedSwitch}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {!network.isConnected ? (
                      <>
                        <select
                          style={{
                            flex: 1,
                            padding: '2px 4px',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            fontSize: '10px',
                          }}
                          defaultValue={availableSwitches[0] || ''}
                          id={`switch-select-${network.id}`}
                        >
                          {availableSwitches.map(switchName => (
                            <option key={switchName} value={switchName}>{switchName}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const selectElement = document.getElementById(`switch-select-${network.id}`) as HTMLSelectElement
                            const selectedSwitch = selectElement?.value
                            if (selectedSwitch) {
                              handleConnectNetwork(network.id, selectedSwitch)
                            }
                          }}
                          style={{
                            padding: '2px 8px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          连接
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDisconnectNetwork(network.id)}
                        style={{
                          width: '100%',
                          padding: '2px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        断开连接
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px' }}>
        <button
          onClick={handleCreateArchitecture}
          style={buttonStyle}
          title="根据配置生成Docker架构图"
        >
          🚀 生成架构图
        </button>

        <button
          onClick={handleCreateExample}
          style={{...buttonStyle, backgroundColor: '#28a745'}}
          title="生成示例Nginx架构"
        >
          📋 示例架构
        </button>

        <button
          onClick={handleClear}
          style={clearButtonStyle}
          title="清除画布上的所有内容"
        >
          🗑️ 清除画布
        </button>

        <button
          onClick={() => {
            if (!dockerFactory) return
            const count = dockerFactory.getContainerCount()
            const relationships = dockerFactory.getDAGRelationships()
            alert(`容器数量: ${count}\nDAG信息: ${JSON.stringify(relationships, null, 2)}`)
          }}
          style={{...buttonStyle, backgroundColor: '#6c757d'}}
          title="查看容器统计和DAG关系"
        >
          📊 查看统计
        </button>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d',
        lineHeight: '1.4'
      }}>
        <strong>💡 使用提示：</strong><br />
        • 先创建交换机，然后选择容器要连接的交换机<br />
        • 点击"示例架构"快速生成示例<br />
        • 填写各项配置后点击"生成架构图"<br />
        • 容器会自动连接到选中的交换机<br />
        • 支持多个端口、卷用逗号分隔<br />
        • 生成后可双击节点编辑文本内容
      </div>
    </div>
  )
}