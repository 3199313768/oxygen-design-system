# 公共 API 审计修复计划

目标：落实已获用户批准的 F01–F12 审计建议，保持既有导出、命名、兼容别名与包边界。

1. 为组合、挂载、受控值、回调及类型契约增加失败回归测试。
2. 修复 asChild 的单子节点组合与内部 Portal 的 forceMount 传递。
3. 修复 Combobox 受控展示及富标签文本、Transfer 选择通知、Accordion 空键冲突和 Pagination 整数边界。
4. 对齐 Button/QRCode 公开类型，兼容增加 Patterns 根属性，清除重复清单键；保留 ColorPicker 测试草稿属性并说明用途。
5. 同步人工文档及自动生成 API，执行类型、lint、单元测试、构建和相关浏览器验证。

不增加依赖，不提交、推送或部署。P3 属性清理采用保留兼容和明确说明的方式，不删除现有能力。各修复分组使用不重叠的文件集合并行执行，最终集中检查差异和回归。

已完成上述步骤。pnpm verify、67 页文档检查、73 项 Chromium Docs 检查及两包独立 tarball 消费验证通过。修复与兼容性记录见 docs/reviews/2026-11-02-public-api-repairs.md。
