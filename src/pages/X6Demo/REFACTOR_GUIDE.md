# Index.tsx 重构指南

## 已创建的模块

### 1. 类型定义 (`types.ts`)

包含所有 TypeScript 类型定义，包括：

- `ContextMenuState` - 上下文菜单状态
- `NetworkModalData` - 网络模态框数据
- `DockerServiceConfig` - Docker 服务配置
- `DockerComposeData` - Docker Compose 数据
- `NetworkInterface` - 网络接口
- `ContainerConfig` - 容器配置

### 2. Hooks

#### `hooks/useStorage.ts`

处理 localStorage 相关操作：

```typescript
const { saveYaml, loadYaml, clearStorage, checkAndPromptRestore } =
  useStorage();
```

#### `hooks/useDockerCompose.ts`

处理 Docker Compose 导入导出：

```typescript
const { exportDockerCompose, importDockerCompose } = useDockerCompose(
  graph,
  dockerFactory,
);
```

### 3. 工具函数

#### `utils/dockerCompose.ts`

Docker Compose 相关工具函数：

- `convertToYaml()` - 对象转 YAML
- `parseYaml()` - 解析 YAML
- `containerConfigToService()` - 容器配置转服务配置
- `generateNetworkConfig()` - 生成网络配置

#### `utils/graphConfig.ts`

Graph 配置工具：

- `createGraphConfig()` - 创建 Graph 配置
- `getCellsWithChildren()` - 获取包含子节点的单元格集合

## 如何在 index.tsx 中使用

### 1. 导入必要的模块

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '@antv/x6';
import './index.css';
import {
  registerDockerNodes,
  DockerComponentFactory,
} from './utils/dockerNodes';
import { DockerPanel } from './components/DockerPanel';
import { createGraphConfig } from './utils/graphConfig';
import { useStorage } from './hooks/useStorage';
import { useDockerCompose } from './hooks/useDockerCompose';
import type { ContextMenuState, NetworkModalData } from './types';
```

### 2. 初始化 Hooks

```typescript
const Example: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const minimapRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph>()
  const [dockerFactory, setDockerFactory] = useState<DockerComponentFactory>()

  // 使用存储 hook
  const { checkAndPromptRestore } = useStorage()

  // 使用 Docker Compose hook
  const { exportDockerCompose, importDockerCompose } = useDockerCompose(
    graphRef.current,
    dockerFactory
  )

  // ... 其他状态
```

### 3. 初始化 Graph（简化版）

```typescript
useEffect(() => {
  if (!containerRef.current || !minimapRef.current) return;

  registerDockerNodes();

  const containerWidth =
    containerRef.current.clientWidth || window.innerWidth - 180;
  const containerHeight =
    containerRef.current.clientHeight || window.innerHeight - 125;

  // 使用配置工具创建 Graph
  const graphConfig = createGraphConfig(
    containerRef.current,
    minimapRef.current,
    containerWidth,
    containerHeight,
  );

  const graph = new Graph(graphConfig);
  graphRef.current = graph;

  // 创建 Docker 组件工厂
  const factory = new DockerComponentFactory(graph);
  setDockerFactory(factory);

  // 延迟检查并恢复 localStorage 数据
  setTimeout(() => {
    checkAndPromptRestore(importDockerCompose);
  }, 500);

  // 其他事件监听器...
}, []);
```

### 4. 导出功能

```typescript
const handleExport = () => {
  const yamlContent = exportDockerCompose();
  setExportYml(yamlContent);
  setShowExportModal(true);
};
```

### 5. 导入功能

```typescript
const handleImport = () => {
  const success = importDockerCompose(importYml);
  if (success) {
    setShowImportModal(false);
    setImportYml('');
  }
};
```

## 重构步骤建议

### 第一步：替换导入导出逻辑

1. 删除 `exportDockerCompose` 和 `importDockerCompose` 函数
2. 使用 `useDockerCompose` hook 替代
3. 测试导入导出功能

### 第二步：替换存储逻辑

1. 删除 `checkAndRestoreFromStorage` 函数
2. 使用 `useStorage` hook 替代
3. 测试自动保存和恢复功能

### 第三步：重构 Graph 初始化

1. 提取 Graph 配置到 `createGraphConfig`
2. 简化 useEffect 中的代码
3. 测试 Graph 功能

### 第四步：拆分 UI 组件（可选）

如果需要进一步拆分，可以将模态框提取为独立组件：

- `components/modals/ExportModal.tsx`
- `components/modals/ImportModal.tsx`
- `components/modals/NetworkModal.tsx`

## 好处

✅ **代码组织更清晰** - 每个模块职责单一 ✅ **更易维护** - 修改某个功能只需关注对应模块 ✅ **更易测试** - 工具函数和 hooks 可以独立测试 ✅ **更易复用** - hooks 和工具函数可以在其他地方使用 ✅ **类型安全** - 统一的类型定义减少类型错误

## 注意事项

⚠️ 重构时建议：

1. 一次重构一个模块
2. 每次重构后进行充分测试
3. 保留原文件的备份
4. 使用 Git 进行版本控制
