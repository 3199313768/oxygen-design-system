import type { ComponentDoc } from '../types';

export const patternsDocs: ComponentDoc[] = [
  {
    "name": "AppShell",
    "title": "应用框架",
    "category": "页面模式",
    "description": "组合桌面侧栏、顶部栏、主内容和移动抽屉导航。",
    "design": [
      "sidebar 与 mobileNavigation 提供同一信息架构的两种布局。",
      "topbarActions 放全局操作，页面级操作放 PageHeader。"
    ],
    "restrictions": [
      "不管理路由或选中导航；移动抽屉不会自动跟随路由关闭。",
      "根结构包含 main，主内容避免再嵌套主地标。"
    ],
    "accessibility": [
      "移动菜单按钮和抽屉标题/描述有本地化默认名称。",
      "导航内容应使用 nav，沿用 Sheet 的焦点管理。"
    ],
    "interaction": "窄屏菜单按钮打开左侧 Sheet，关闭按钮/Escape 返回；导航跳转由传入内容负责。",
    "stateNotes": "断点样式切换桌面侧栏与移动入口；不提供全局加载/错误状态。",
    "propNotes": {
      "title": {
        "description": "应用名，顶部展示。"
      },
      "sidebar": {
        "description": "必填桌面侧栏节点。"
      },
      "mobileNavigation": {
        "description": "必填移动导航节点。"
      },
      "children": {
        "description": "主区域内容。"
      },
      "topbarActions": {
        "description": "顶部栏操作。"
      },
      "navigationTitle": {
        "description": "移动导航标题，默认由 locale.common.navigationTitle(title) 生成。"
      },
      "navigationDescription": {
        "description": "移动导航描述，默认本地化说明。"
      },
      "navigationTriggerLabel": {
        "description": "移动菜单按钮名称，默认本地化打开导航。"
      }
    }
  },
  {
    "name": "EmptyState",
    "title": "空状态",
    "category": "页面模式",
    "description": "用标题、说明和可选操作解释页面暂无内容的原因。",
    "design": [
      "说明区分首次使用、无搜索结果和无权限，不凭空编造数据。",
      "有补救路径时提供 action。"
    ],
    "restrictions": [
      "静态展示，不自动判断请求、权限或筛选状态。"
    ],
    "accessibility": [
      "标题为 h2；自定义 icon 的装饰属性由调用方设置。",
      "动态替换内容时由宿主提供恰当播报或焦点位置。"
    ],
    "interaction": "action 中的创建或清除筛选按钮负责操作，组件自身不获取数据。",
    "stateNotes": "支持有无 icon/action，不提供 loading 或 error 属性。",
    "propNotes": {
      "title": {
        "description": "必填空态标题。"
      },
      "description": {
        "description": "必填原因和指引。"
      },
      "icon": {
        "description": "可选视觉图标。"
      },
      "action": {
        "description": "可选补救操作。"
      }
    }
  },
  {
    "name": "PageHeader",
    "title": "页面页头",
    "category": "页面模式",
    "description": "将页面主标题、描述和操作组织成一致的页头。",
    "design": [
      "title 表达当前页面任务，actions 按主次排序。",
      "长描述使用简短段落，验证窄屏操作布局。"
    ],
    "restrictions": [
      "不提供返回按钮、面包屑或权限判断；需要时在页面组合。"
    ],
    "accessibility": [
      "固定输出 h1，单页通常只放一个主标题。",
      "操作节点应使用原生按钮或链接并清楚命名。"
    ],
    "interaction": "标题与说明静态展示，按钮行为由 actions 的调用方管理。",
    "stateNotes": "支持可选描述和操作；请求状态应展示在内容或操作按钮中。",
    "propNotes": {
      "title": {
        "description": "必填 h1 页面标题。"
      },
      "description": {
        "description": "可选页面描述。"
      },
      "actions": {
        "description": "可选页面操作节点。"
      }
    }
  },
  {
    "name": "StatusMessage",
    "title": "状态消息",
    "category": "页面模式",
    "description": "以 Alert 组合正文、可选标题及操作，适合页面内的处理结果和下一步提示。",
    "design": [
      "正文描述原因与影响，action 提供明确处理路径。"
    ],
    "restrictions": [
      "不管理关闭、重试或计时，不能替代后端状态判断。"
    ],
    "accessibility": [
      "error 使用 alert，其余沿用 status。",
      "图标为装饰，正文需包含实际状态含义；标题为 AlertTitle 的 h5。"
    ],
    "interaction": "修改 tone/children 显示新结果，重试操作通过 action 传入。",
    "stateNotes": "支持四种 AlertTone，有无标题和操作。",
    "propNotes": {
      "tone": {
        "description": "状态语义。",
        "default": "info"
      },
      "title": {
        "description": "可选标题。"
      },
      "children": {
        "description": "必填正文。"
      },
      "action": {
        "description": "可选重试或后续操作。"
      }
    }
  }
];
