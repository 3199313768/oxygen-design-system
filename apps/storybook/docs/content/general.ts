import type { ComponentDoc } from '../types';

export const generalDocs: ComponentDoc[] = [
  {
    "name": "Button",
    "title": "按钮",
    "category": "通用与配置",
    "description": "触发保存、提交等即时操作，或通过 asChild 将按钮样式应用于链接。",
    "design": [
      "同一区域突出一个主操作；危险操作使用 destructive。",
      "图标按钮使用 icon 尺寸，文字按钮优先描述动作。"
    ],
    "restrictions": [
      "组件不管理请求与重复请求的业务幂等性。",
      "asChild 必须传入一个可接收属性和 ref 的元素；表单内非提交操作显式设置 type=\"button\"。"
    ],
    "accessibility": [
      "纯图标按钮必须有 aria-label。",
      "loading 设置 aria-busy 并阻止激活；asChild 禁用时移出 Tab 顺序。"
    ],
    "interaction": "点击调用 onClick；异步期间由宿主维护 loading，完成后恢复操作。",
    "stateNotes": "支持禁用、加载、五种视觉变体和小号/图标尺寸。",
    "propNotes": {
      "variant": {
        "description": "操作视觉层级。",
        "default": "default"
      },
      "size": {
        "description": "default、sm 或 icon。",
        "default": "default"
      },
      "asChild": {
        "description": "使用 Radix Slot 合并到单个子元素。",
        "default": "false"
      },
      "loading": {
        "description": "阻止操作并显示忙碌状态。",
        "default": "false"
      },
      "disabled": {
        "description": "禁止激活；与 loading 合并。"
      }
    }
  },
  {
    "name": "ConfigProvider",
    "title": "全局配置",
    "category": "通用与配置",
    "description": "为组件子树设置主题、密度和通用文案，并向受支持的 Portal 传递主题。",
    "design": [
      "在应用入口设默认配置，在局部区域覆盖主题。",
      "紧凑密度适合信息密集的表格和表单。"
    ],
    "restrictions": [
      "locale 按默认中文配置合并；嵌套 Provider 的 locale 不继承父级定制词条。",
      "不会切换 document 属性；仍须导入组件样式。"
    ],
    "accessibility": [
      "本地化关闭、搜索和分页等辅助名称。",
      "提供 calendar.locale 与 labels，保持日期视觉语言和辅助名称一致。"
    ],
    "interaction": "调整 theme、density 或 locale 后子树更新，Provider 本身没有交互控件。",
    "stateNotes": "主题可为 light、dark、system；省略 theme 时继承最近的上下文并允许宿主主题生效。",
    "propNotes": {
      "children": {
        "description": "配置作用的组件子树。"
      },
      "density": {
        "description": "组件密度。",
        "default": "default"
      },
      "theme": {
        "description": "局部主题模式，省略时继承上下文。"
      },
      "locale": {
        "description": "按 common、calendar、steps 等分组覆盖默认中文文案。"
      }
    }
  },
  {
    "name": "Typography",
    "title": "排版",
    "category": "通用与配置",
    "description": "提供 Title、Text、Paragraph 和 Link，建立标题、正文、说明和链接层级。",
    "design": [
      "用 level 匹配文档层级，避免仅凭字号选择标题。",
      "辅助正文使用 secondary，状态正文同时保留明确文字。"
    ],
    "restrictions": [
      "不提供自动省略、复制、编辑或 Markdown 解析。",
      "Typography 是子组件对象，使用 Typography.Title 等成员。"
    ],
    "accessibility": [
      "Title 输出对应 h1–h5；Paragraph 输出 p。",
      "Link 保留原生链接语义，提供有意义的 href 和链接文本。"
    ],
    "interaction": "静态文字没有内部交互；Link 的跳转遵循浏览器及宿主路由。",
    "stateNotes": "支持 strong、语义色和段落 code；无统一 loading 或 disabled。",
    "propNotes": {
      "TypographyTitle.level": {
        "description": "标题语义级别 1–5。",
        "default": "1"
      },
      "TypographyText.type": {
        "description": "secondary、success、warning、danger 语义文本色。"
      },
      "TypographyText.strong": {
        "description": "以强调样式呈现文字。"
      },
      "TypographyParagraph.code": {
        "description": "将段落内容包裹在 code 中。"
      },
      "TypographyLink.href": {
        "description": "原生链接目的地址。"
      }
    }
  },
  {
    "name": "Icons",
    "title": "图标",
    "category": "通用与配置",
    "description": "从组件库入口导入精选 Lucide 图标，统一线条风格。Upload 图标在入口命名为 UploadIcon。",
    "design": [
      "与文字同行时保持尺寸和基线一致。",
      "状态图标应配合文字，避免单靠形状表达复杂含义。"
    ],
    "restrictions": [
      "公开集合为 Check、ChevronDown、Clock3、Eye、EyeOff、Files、Menu、RefreshCw、Search、Settings、Trash2、UploadIcon、Users、X。",
      "图标本身不提供按钮、提示或点击区域。"
    ],
    "accessibility": [
      "装饰图标设置 aria-hidden。",
      "有操作的图标放入具名 Button，独立传达信息的 SVG 提供可理解的名称。"
    ],
    "interaction": "图标是 SVG 展示元素；点击和键盘行为由外部按钮或链接承载。",
    "stateNotes": "通过 size、color、strokeWidth 定制外观，不具备组件级加载或禁用状态。",
    "propNotes": {
      "size": {
        "description": "Lucide SVG 尺寸；遵循所安装 Lucide 的类型及默认值。"
      },
      "color": {
        "description": "SVG 描边颜色，优先继承 currentColor。"
      },
      "strokeWidth": {
        "description": "线条宽度，保持同一界面一致。"
      }
    }
  }
];
