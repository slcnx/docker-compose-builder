import { useCallback } from 'react'

const STORAGE_KEYS = {
  YAML: 'docker-compose-builder-yaml',
  TIMESTAMP: 'docker-compose-builder-timestamp',
}

export const useStorage = () => {
  // 保存 YAML 到 localStorage
  const saveYaml = useCallback((yaml: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.YAML, yaml)
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, new Date().toISOString())
      console.log('自动保存到localStorage成功')
      return true
    } catch (error) {
      console.warn('保存到localStorage失败:', error)
      return false
    }
  }, [])

  // 从 localStorage 获取保存的 YAML
  const loadYaml = useCallback(() => {
    try {
      const savedYaml = localStorage.getItem(STORAGE_KEYS.YAML)
      const savedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP)

      if (!savedYaml || !savedTimestamp) {
        return null
      }

      const timestamp = new Date(savedTimestamp)
      const now = new Date()
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

      // 如果保存时间超过24小时，返回 null
      if (hoursDiff >= 24) {
        return null
      }

      return {
        yaml: savedYaml,
        timestamp,
        hoursDiff,
      }
    } catch (error) {
      console.warn('读取localStorage失败:', error)
      return null
    }
  }, [])

  // 清理 localStorage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.YAML)
      localStorage.removeItem(STORAGE_KEYS.TIMESTAMP)
      console.log('已清理localStorage数据')
      return true
    } catch (error) {
      console.warn('清理localStorage失败:', error)
      return false
    }
  }, [])

  // 检查并提示用户恢复数据
  const checkAndPromptRestore = useCallback((onRestore: (yaml: string) => void) => {
    const data = loadYaml()

    if (data) {
      const shouldRestore = window.confirm(
        `发现 ${Math.round(data.hoursDiff * 10) / 10} 小时前的保存数据，是否恢复？\n\n` +
        `保存时间: ${data.timestamp.toLocaleString()}`
      )
      // console.log(data,'---->')
      if (shouldRestore) {
        console.log('开始尝试恢复数据...')
        onRestore(data.yaml)
      }
    }
  }, [loadYaml])

  return {
    saveYaml,
    loadYaml,
    clearStorage,
    checkAndPromptRestore,
  }
}