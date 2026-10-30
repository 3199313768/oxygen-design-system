import type { ComponentDoc } from '../types';

export const layoutDocs: ComponentDoc[] = [
  {
    "name": "Layout",
    "title": "布局",
    "category": "布局",
    "description": "以 Header、Sider、Content 和 Footer 组合应用页面结构。",
    "design": [
      "有侧栏时显式设置 hasSider。",
      "侧栏宽度与内容最小宽度共同设计，避免窄屏挤压。"
    ],
    "restrictions": [
      "collapsed 只控制侧栏展示，不自动提供折叠按钮、菜单或移动导航。",
      "多个嵌套 Content 会产生多个 main，宿主需规划页面地标。"
    ],
    "accessibility": [
      "子组件分别输出 header、aside、main、footer。",
      "侧栏导航仍应使用具名 nav 并提供跳转到主内容的路径。"
    ],
    "interaction": "由宿主按钮维护 Sider.collapsed，布局自身只响应属性变化。",
    "stateNotes": "支持有无侧栏和侧栏折叠；无加载或错误业务状态。",
    "propNotes": {
      "hasSider": {
        "description": "使用含侧栏的布局方向。",
        "default": "false"
      },
      "LayoutSider.collapsed": {
        "description": "侧栏折叠样式。",
        "default": "false"
      },
      "LayoutSider.width": {
        "description": "侧栏宽度；数字单位为 px。",
        "default": "200"
      },
      "LayoutHeader.children": {
        "description": "页眉内容。"
      },
      "LayoutContent.children": {
        "description": "主内容。"
      },
      "LayoutFooter.children": {
        "description": "页脚内容。"
      }
    }
  },
  {
    "name": "Space",
    "title": "间距",
    "category": "布局",
    "description": "以固定间距排列一组控件，适合工具栏和小型操作组。",
    "design": [
      "small、middle、large 分别对应 8、16、24px。",
      "横向内容较长时启用 wrap，并选择合适的 align。"
    ],
    "restrictions": [
      "不是栅格系统；不会自动分配各子项宽度。",
      "split 作为展示分隔内容插入，不承担操作。"
    ],
    "accessibility": [
      "DOM 顺序与视觉阅读顺序保持一致。",
      "装饰性的 split 由调用方设置 aria-hidden。"
    ],
    "interaction": "调整方向、间距和换行可观察布局变化；没有内部状态或点击行为。",
    "stateNotes": "支持 horizontal/vertical、换行和四种对齐。",
    "propNotes": {
      "direction": {
        "description": "子项排列方向。",
        "default": "horizontal"
      },
      "size": {
        "description": "small、middle、large 或像素数字。",
        "default": "small"
      },
      "align": {
        "description": "start、end、center 或 baseline。"
      },
      "wrap": {
        "description": "是否允许换行。",
        "default": "false"
      },
      "split": {
        "description": "子项之间的分隔节点。"
      },
      "SpaceCompact.block": {
        "description": "Space.Compact 占满容器宽度。",
        "default": "false"
      }
    }
  },
  {
    "name": "SpaceCompact",
    "title": "紧凑组合",
    "category": "布局",
    "description": "把相邻输入与按钮组合成连续的控件组，可使用 Space.Compact 别名。",
    "design": [
      "适合输入框加操作按钮；为各控件保留可辨识边界。",
      "block 适用于整行搜索等场景。"
    ],
    "restrictions": [
      "只组合样式，不合并输入值、禁用状态或提交逻辑。",
      "任意包装层可能影响相邻控件的边框组合效果。"
    ],
    "accessibility": [
      "每个子控件仍需自己的可访问名称。",
      "若整体是相关选项组，可在宿主上补充 role=\"group\" 及名称。"
    ],
    "interaction": "Tab 依次进入子控件；事件处理仍属于各自子组件。",
    "stateNotes": "支持行内与 block 展示，没有独立的校验状态。",
    "propNotes": {
      "block": {
        "description": "组合组是否占满可用宽度。",
        "default": "false"
      },
      "children": {
        "description": "相邻控件，优先使用直接子元素。"
      }
    }
  },
  {
    "name": "Divider",
    "title": "分割线",
    "category": "布局",
    "description": "以水平或垂直分割线区分内容区块，可添加短标题。",
    "design": [
      "水平线用于区块分组，垂直线用于同行内容。",
      "orientation 仅描述标题在分割线上的位置。"
    ],
    "restrictions": [
      "不提供交互或拖拽调整区域尺寸。",
      "较长说明应放入正文，不塞入分割线标题。"
    ],
    "accessibility": [
      "输出 role=\"separator\" 和与 type 一致的 aria-orientation。",
      "分组标题不能替代页面标题层级。"
    ],
    "interaction": "静态分隔；Playground 修改方向或标题位置展示布局。",
    "stateNotes": "支持 horizontal/vertical 和 left/center/right 标题位置。",
    "propNotes": {
      "type": {
        "description": "分割方向。",
        "default": "horizontal"
      },
      "orientation": {
        "description": "标题位置。",
        "default": "center"
      },
      "children": {
        "description": "可选分割标题。"
      }
    }
  }
];
