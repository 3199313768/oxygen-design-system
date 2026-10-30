# 人工读屏、键盘与实体设备验收

本清单是**待执行的验收协议**。当前没有在此记录任何已完成的人工 VoiceOver、NVDA、TalkBack 或实体 iOS/Android 结果。自动化对应证据见 [64 项组件状态矩阵](component-state-matrix.md)；统一命令与运行结果以 `docs/reviews/2026-10-30-foundation-completion.md` 本次报告为准。Playwright WebKit 不等于 Safari，移动浏览器模拟不等于实体手机，DOM 可访问名称断言不等于真实语音播报。

## 自动检查转入的复核队列

本轮 348 个主题案例中有 36 个保留人工复核状态；逐例 `test_id`、阶段、节点、规则与原始 JSON 见 `output/playwright/foundation/`。这不代表 36 个已确定缺陷，也不能因为测试运行成功而关闭验收。

- NavigationMenu：空焦点代理及展开后重叠元素；确认连续 Tab/Shift+Tab、读屏焦点与可见落点一致，检查内容分组/标签和最终对比度。
- Tree：父节点只朗读自身标签，子节点独立命名；展开/收起和方向键不混入整棵子树文字。自动扫描将后代文本计入父标签的已核实限制仍保留记录。
- InputNumber：读屏名称“增加/减少”、符号和数值变化可理解，边界禁用无歧义；核对最终图形对比度。
- Steps、Timeline：伪元素、符号与步骤线相邻背景下的实际对比度及状态含义。
- Combobox、Sheet：浮层/长内容遮挡区域的文字可读性；必要操作不被遮挡。
- TreeSelect、Cascader、ColorPicker、Popover：实际打开后名称、角色、控制关系和关闭后的焦点回退；axe 无法确定的 ID 关联需结合真实 DOM 与读屏结果核实。

上列是自动结果转入的专项队列；其余人工任务仍按完整矩阵执行，不能仅验这 36 例就宣布所有辅助技术组合通过。

## 环境与记录准备

使用本次交付的同一构建，记录 Git revision、未提交变更快照、包版本/构建时间与页面 URL。先由负责启动验证环境的人提供可访问的本地预览地址，不在此要求部署、公开端口或上传用户数据。实体手机需能访问同一经过授权的验收页面；若网络不可达，记“阻塞”，不能替换成模拟器通过。

每个组件从矩阵链接的 Storybook `Playground` 与具名状态开始。所需状态没有现成 Story 时，先在已有 Controls 中设置，或由开发者提供最小 fixture，再记录参数。不能仅切换视觉 CSS 假装控件 disabled/readonly/invalid。Field/Form 错误需要真实关联的错误节点；Form.Item 必填 ARIA 不自动提供浏览器的原生 `required` 提交拦截。

| 必验组合 | 实际设备/软件信息 | 初始状态 | 目的 |
| --- | --- | --- | --- |
| macOS + Safari + VoiceOver | 待填写 OS、Safari、机器型号与系统语音 | 待执行 | Safari 原生控件、VO 光标、焦点和动态播报 |
| Windows + Firefox + NVDA | 待填写 OS、Firefox、NVDA 版本与语音 | 待执行 | 浏览/焦点模式及 Firefox 表单、树和弹层 |
| Windows + Chromium 浏览器 + NVDA | 待填写具体浏览器及版本、NVDA版本 | 待执行 | 同一任务在 Chromium 的读屏结果，不能沿用 Firefox 记录 |
| 实体 iPhone/iPad + Safari + VoiceOver | 待填写型号、iOS/iPadOS版本、显示/字体设置 | 待执行 | 触摸、软键盘、系统选择器、读屏手势 |
| 实体 Android + Chromium 浏览器 + TalkBack | 待填写型号、Android、浏览器、TalkBack版本 | 待执行 | 触摸、软键盘、系统选择器及范围控件手势 |

使用干净测试数据，关闭会抢占键盘的无关扩展。记录缩放、系统大字、深浅主题、减少动态效果与高对比设置。语音转录只记录组件名称、状态、描述等验收相关内容，避免录入真实个人信息。

## K：桌面键盘与真实焦点

1. 暂时关闭读屏，打开浏览器的完整键盘访问设置；记录设置，避免 Safari 默认 Tab 过滤控件影响结论。先从地址栏进入页面，单用 Tab/Shift+Tab 按任务顺序遍历。
2. 在 Button、Breadcrumb 链接、Typography.Link、可关闭 Tag、分页按钮上用 Enter；原生按钮另用 Space。检查每次激活只产生一次回调/一次界面变化，链接语义保持为链接。
3. Checkbox/Switch 用 Space 切换。RadioGroup 用方向键换项，检查单选关系、禁用项跳过与焦点可见。Slider 用方向键、Home/End，范围 Slider 分别操作两个有区分名称的 thumb，检查实际值、上下界与读屏值一致。
4. Tabs、Accordion、Tree、菜单和选择控件按组件支持的方向键/Home/End/Enter/Escape 路径操作；检查焦点、选中、展开是各自可辨的状态。Tree 要覆盖层级、父子展开及部分勾选；TagInput 要覆盖输入法组合期间 Enter 不提前提交、删除标签后继续输入。
5. Dialog、AlertDialog、Sheet、ImagePreview 打开后检查初始焦点进入内容；Tab/Shift+Tab 不泄漏到背景。取消/关闭后回触发器；确认后焦点落在合理的下一步。普通 Dialog/Sheet 覆盖 Escape；AlertDialog 按确认/取消语义验收，不强行要求所有关闭手势都生效。
6. Popover、DropdownMenu、NavigationMenu、Select、Combobox、TreeSelect、Cascader、Tooltip 检查展开后相关内容可达、Escape收起、关闭后焦点不丢失。Popover 是否限制焦点依据实际 modal 配置；不能把所有轻量浮层都要求为模态。

通过标准：无焦点陷阱（模态内容的受控循环除外）、无无法通过键盘触发的主要操作、焦点可见且不被遮挡/裁切；禁用与 loading 控件不能触发提交；readonly 输入可聚焦、读取/复制但不能更改。只看到 `disabled`/`readonly` 属性不能判为通过。

## SR：桌面真实读屏任务

在 macOS 用系统方式开启 VoiceOver（通常 Command+F5），记录是否启用快速导航；使用 VO 导航/转子和 Tab 两种路径。Windows 启动 NVDA，用浏览模式阅读标题、landmark、表格；进入表单时切换焦点模式，必要时用 NVDA+Space，记录实际模式。每条任务在 Safari+VoiceOver、Firefox+NVDA、Chromium+NVDA 分别记录，不能将一套结果复制到另一套。

| 任务 | 操作步骤 | 通过标准 |
| --- | --- | --- |
| 名称、角色、值 | 遍历按钮、链接、输入、checkbox、radio、switch、slider与选择控件；切换其值 | 名称能区分用途；角色与真实操作一致；选中/展开/当前页/值更新可感知，不只朗读颜色 |
| Field/Form 错误 | 聚焦必填控件；触发错误，再更正；同时设置帮助说明与外部错误 | 必填可读，错误说明关联到实际控件；更正本地错误不抹掉仍存在的服务端错误；无不存在ID导致的信息丢失 |
| 弹层与菜单 | 从触发器打开，阅读标题/描述，遍历操作，关闭 | 语音进入正确内容；模态背景不成为主要导航路径；关闭后焦点与读屏位置合理；无多余未知按钮 |
| Calendar/范围/日期时间 | 阅读月份、today、选中日期、禁选日期；选两个端点；原生日期/时间盘修改并取消 | 日期/端点/月份有可理解名称，禁选不可提交；取消不意外改变值；实际系统选择器可完成任务 |
| Tree/Transfer/Table | 展开父节点、部分勾选；搜索后移动项目；选择表格行/全选 | 层级、部分选中、列表方向、行列关系及选中汇总可理解；移动/筛选后焦点可继续操作 |
| 状态消息 | 触发 Alert、Message、Notification、Toast、StatusMessage；加载后成功/失败 | 新信息按合适紧急程度可感知；同条消息不反复/双重播报；用户阅读时不会因过短超时无法完成任务 |
| 静态结构 | 用标题/地标/列表/表格导航读取 Card、Descriptions、Layout、Steps、Timeline、Result、Patterns | 结构顺序与视觉一致，标题层级合理；加载/错误不朗读为旧成功数据；装饰图片/图标不制造噪声 |
| 名称与装饰 | 读取 Badge、Tag、Image失败替代、Skeleton、Spin、Progress、QRCode | 状态不依赖颜色；意义图有替代文本，装饰图不重复播报；二维码有可访问的文本替代路径；进度值有意义 |

记录听到的实际短语，不要求不同读屏器逐字使用同一句话；按信息是否完整、操作能否完成判定。播报重复、没有状态反馈、焦点落到隐藏区域等问题需附重现步骤与录音/转录。自动测试已读到可访问名称仍不能替代此表。

## ColorPicker 重点任务

使用 [FoundationExamples](../../tests/workbench/src/FoundationExamples.tsx) 中 `Foundation color` fixture；其外部错误为 `Choose an approved brand color`，必填描述为 `Required color`，草稿格式错误为 `Use six hex digits`，确认/取消为 `Apply color` / `Cancel color`。该 fixture 采用受控值，初始 `#336699 / 0`；对照 [focused 单测](../../packages/ui/tests/color-picker-accessibility.test.tsx) 与 [浏览器回归](../../tests/browser/foundation.spec.ts)，实际执行结果仍以本次报告为准。

1. 不打开弹层，Tab/读屏定位到 `Foundation color`。应识别为按钮，并能获得必填及外部错误描述。不能靠改成 textbox 角色来实现；不能只靠红色边框识别错误。
2. Enter 或触摸双击打开，焦点进入真实文本输入。应具有对应名称、必填/无效状态和外部错误描述。原生颜色选择输入要有独立名称，不应把十六进制草稿格式错误误报为原生色板的值错误。
3. 输入 `bad`，应获知格式错误；确认不可用，已提交值/计数不变。输入 `#abcdef`，格式错误消失，外部品牌限制仍保持，确认可提交候选值。读取描述，确认 Field帮助/错误与本地错误均不丢失或重复堆叠。
4. 先选取消，再重新打开：仍显示原已提交颜色；桌面再覆盖 Escape 丢弃草稿与焦点返回。修改后确认：只提交一次、规范化为 `#ABCDEF`，计数只增加1；关闭后焦点回原按钮。
5. 定位 `Disabled foundation color`、`Loading foundation color`：不能展开/提交。再用带 `aria-required={false}` / `aria-invalid={false}` 的 Field 组合 fixture 核查显式覆盖；必须记录该fixture的提供方式，缺少时记待执行。
6. 在实体手机打开原生色板再取消、确认，记录焦点/页面滚动与系统弹窗行为；不能只验证桌面输入HEX就宣布原生色板可用。

通过标准：按钮与输入各有正确角色，外部状态和草稿错误可区分，确认才提交，取消不改值，焦点与可见内容一致。浏览器开发者工具可辅助检查属性/可访问树，但最终必须完成读屏和真实操作任务。

## V：视觉状态、字体与用户偏好

- 对矩阵中 H/A/F 适用的部件分别截图普通、hover、鼠标按住、键盘focus；检查焦点与selected/invalid不混淆，disabled/loading不会仍显示可激活反馈。触屏没有hover时记不适用，仍需验收触摸按下与读屏焦点。
- 检查 Light、Dark、系统主题与嵌套主题，包含 portal 浮层。对照文字和非文字控件边界的对比度，验证错误/成功还有文案或形状；不能只检查 token 值就认定所有最终背景上的对比度达标。
- 浏览器200%缩放、窄视口/横竖屏与系统大字下阅读长标题、表格、日期范围和多列级联。非必要二维布局不应强迫横向滚动；表格/图形等二维内容要提供可发现且键盘/触摸可用的滚动。
- 在宿主默认字体和作用域覆盖字体下检查 Button、Input、Typography 与 Patterns 的截断、换行、行高和控件尺寸。代码文本可识别，覆盖不泄漏到宿主正文；不要求加载外部字体。
- 在操作系统开启“减少动态效果/动画”后重开页面，执行展开、切换、loading与进度更新：非必要过渡/旋转/脉冲减少，状态、数值、焦点和内容仍可用。Spin/loading 不能因为关动画而完全没有提示。

通过标准：状态可辨、焦点可见，缩放不丢内容/操作，减少动态效果不改变功能。记录测量或截图，不将截图清晰等同于读屏通过。

## M / Native：实体 iOS 与 Android

两类实体设备各执行一次普通触摸，再分别开启 VoiceOver / TalkBack执行同一任务。记录浏览器页面与系统选择器之间的切换；不同厂商系统控件的行为差异单独记录。

1. 单指探索/左右滑动阅读，双击激活；在读屏关闭时单击操作。遍历所有主要入口，验证命中区域不与相邻按钮混淆，重要说明不依赖hover。
2. 输入 Input、Textarea、InputNumber、Combobox、TagInput、ColorPicker：软键盘出现时当前控件、候选、错误、确认/取消仍能看到并触达；中文输入法组合/删除/Enter不造成提前提交，页面不因焦点无故跳回顶部。
3. 读取并调整 Slider（包括双thumb）、RadioGroup、Checkbox、Switch；用各系统读屏的调整手势修改值，确认实际值与播报一致。若设备/控件不能完成调整，记失败或待修复，不能以拖动正常替代读屏调整。
4. 打开 DatePicker、TimePicker、ColorPicker 原生选择器并取消/确认；通过 Upload 打开系统文件选择/相机或媒体入口，取消后返回，分别测试单选/多选和超限错误。仅使用测试文件；不上传真实照片/私人文件。
5. 选择 Calendar/DateRangePicker 日期、TreeSelect/Cascader 项，展开 Tree/Accordion/Tabs；检查滚动后点击/读屏焦点仍对应目标，不出现不可达的浮层列。
6. 打开 Dialog、Sheet、ImagePreview、AppShell移动导航；横竖屏切换并滚动长内容，检查背景滚动、顶部安全区、关闭入口、关闭后焦点及位置。读取消息，观察多条通知是否遮住关键操作。
7. 用另一台真实设备扫描 QRCode 示例，验证实际目标与可访问文本地址一致；在缩放、深色背景与不同亮度下记录可扫情况。SVG生成测试只证明输出，不证明实体扫码成功。

通过标准：主要任务可由触摸和读屏两条路径完成，无无法关闭的系统/组件浮层、软键盘遮挡的必需操作、误触或状态丢失。设备未覆盖、无法访问测试环境、缺少fixture都明确记待执行/阻塞。

## 结果记录模板

每条记录的状态只能选：`待执行`、`通过`、`失败`、`阻塞`、`不适用（附理由）`。通过必须附实际观察；不适用只用于矩阵确认无此组件状态，不能用于跳过缺少设备的测试。

```text
记录ID：
日期/执行人：
构建：revision / dirty快照 / 包版本 / 构建时间
环境：设备型号 / OS / 浏览器及版本 / 读屏器及版本 / 语音
设置：主题 / 缩放 / 字体大小 / 减少动态效果 / 键盘访问 / 读屏模式
组件与状态：
URL / Story ID / Controls或fixture参数：
任务编号：K / SR / ColorPicker / V / M-Native
前置数据：
步骤（逐步）：
预期：
实际（语音短语、焦点位置、值与提交次数）：
结果：待执行
证据：截图 / 录音或转录 / 视频 / 可访问树 / 缺陷链接
限制或阻塞：
修复后复测环境与记录ID：
```

初始签收表（不预填通过）：

| 组合 | K/读屏任务 | ColorPicker | V/偏好 | 原生控件/设备任务 | 证据与执行人 |
| --- | --- | --- | --- | --- | --- |
| Safari + VoiceOver | 待执行 | 待执行 | 待执行 | 待执行 | — |
| Firefox + NVDA | 待执行 | 待执行 | 待执行 | 待执行 | — |
| Chromium + NVDA | 待执行 | 待执行 | 待执行 | 待执行 | — |
| 实体 iOS Safari + VoiceOver | 待执行 | 待执行 | 待执行 | 待执行 | — |
| 实体 Android Chromium + TalkBack | 待执行 | 待执行 | 待执行 | 待执行 | — |
