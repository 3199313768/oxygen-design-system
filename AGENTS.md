# Oxygen Design System — 项目开发规范

## 1. 项目定位

Oxygen Design System 是一个面向 React 开发者的开源企业级 UI 设计系统。

目标：

- 建立独立的设计语言。
- 提供高质量、可复用的 React 组件。
- 提供完整的 TypeScript 类型支持。
- 支持 Light / Dark 主题。
- 支持企业级中后台应用。
- 提供完整的组件文档和交互示例。
- 支持 npm 独立发布。

## 2. 技术原则

- React 19
- TypeScript
- pnpm Workspace
- Vite
- CSS Variables
- Tailwind CSS v4（主要用于文档和示例）
- Radix UI（复杂交互的底层能力）
- CVA
- Lucide React
- Vitest
- Testing Library
- Playwright
- Changesets

## 3. 核心开发原则

1. 设计 Token 优先，禁止随意硬编码颜色、间距和圆角。
2. 组件 API 统一，遵循一致的命名规则。
3. 基础组件与业务组件分离。
4. 组件不能依赖具体业务项目。
5. 样式必须可定制，不污染宿主项目。
6. 必须支持合理的受控与非受控模式。
7. 优先保证无障碍和键盘操作。
8. 不为追求灵活而设计过度复杂的 Props。
9. 保持良好的 Tree Shaking 能力。
10. 不得破坏已经存在的公共 API。

## 4. 组件开发要求

每个组件必须包含：

- 组件实现
- TypeScript 类型定义
- 独立样式
- 组件导出
- Storybook 示例
- 使用文档
- 单元测试

复杂交互组件还需要：

- 键盘交互
- 焦点管理
- 无障碍属性
- 边界情况测试

## 5. 代码质量要求

- 严格 TypeScript。
- 避免 any。
- 遵循单一职责原则。
- 保持组件内部状态清晰。
- 避免不必要的重复渲染。
- 禁止组件之间产生循环依赖。
- 不随意引入第三方依赖。
- 不得删除或改变已有功能来规避问题。

## 6. AI 开发约束

每次开发前：

1. 先检查现有项目结构。
2. 先阅读相关组件及其依赖。
3. 先明确开发方案。
4. 明确新增和修改的文件。
5. 确认是否影响已有公共 API。

开发后：

1. 检查 TypeScript。
2. 执行相关单元测试。
3. 检查构建结果。
4. 检查组件文档。
5. 检查是否引入不必要的依赖。

禁止未经分析直接重构整个项目。

## 7. 项目长期目标

逐步建立完整的 Foundation、Primitives、Components、Pro Components 和 Patterns 体系。

最终形成独立、稳定、可维护、可扩展的开源企业级设计系统。
