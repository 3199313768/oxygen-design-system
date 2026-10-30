import type { ComponentDoc } from '../types';

export const navigationDocs: ComponentDoc[] = [
  {
    "name": "Breadcrumb",
    "title": "面包屑",
    "category": "导航",
    "description": "展示当前位置与上级页面路径，最后一项始终为当前页文字。",
    "design": [
      "路径按由上到下的层级组织。",
      "标签简短并与目标页面标题一致。"
    ],
    "restrictions": [
      "不解析路由或加载路径；href 只在非末项输出链接。"
    ],
    "accessibility": [
      "使用 nav 与有序列表，末项自动标记 aria-current=\"page\"。",
      "分隔符自动隐藏于辅助技术，导航名称可用 aria-label 覆盖。"
    ],
    "interaction": "点击上级链接按 href 导航，当前页不触发跳转。",
    "stateNotes": "无数据时渲染空导航；不提供 loading、disabled。",
    "propNotes": {
      "items": {
        "description": "包含 label 与可选 href 的路径数组。"
      },
      "separator": {
        "description": "项目间装饰性分隔。",
        "default": "/"
      }
    }
  },
  {
    "name": "Tabs",
    "title": "标签页",
    "category": "导航",
    "description": "以一组标签切换同一区域的不同面板，基于 Radix Tabs。",
    "design": [
      "标签命名描述内容类型；同组使用一致长度。",
      "纵向标签同时设置 orientation=\"vertical\"。"
    ],
    "restrictions": [
      "value 必须与 Trigger 和 Content 的 value 对应。",
      "受控模式需在 onValueChange 中更新 value；数据请求与缓存由宿主管理。"
    ],
    "accessibility": [
      "TabsList 提供 aria-label；Radix 维护 tab 与 tabpanel 关系。",
      "按方向键移动到可用标签，避免在触发器内嵌套按钮。"
    ],
    "interaction": "点击或键盘选择标签切换面板；可通过 activationMode 选择自动或手动激活。",
    "stateNotes": "单个 TabsTrigger 支持 disabled；未选面板的挂载由 Radix forceMount 规则控制。",
    "propNotes": {
      "value": {
        "description": "当前标签键。"
      },
      "defaultValue": {
        "description": "非受控初始标签键。"
      },
      "onValueChange": {
        "description": "标签变化请求。"
      },
      "orientation": {
        "description": "Radix 排列方向。"
      },
      "activationMode": {
        "description": "Radix 标签激活方式。"
      },
      "TabsList.loop": {
        "description": "键盘导航是否循环。"
      },
      "TabsTrigger.value": {
        "description": "对应面板的唯一键。"
      },
      "TabsTrigger.disabled": {
        "description": "禁止该标签激活。"
      },
      "TabsContent.value": {
        "description": "关联标签键。"
      },
      "TabsContent.forceMount": {
        "description": "由宿主控制保留面板挂载。"
      }
    }
  },
  {
    "name": "DropdownMenu",
    "title": "下拉菜单",
    "category": "导航",
    "description": "收纳一组命令，支持勾选、单选、分组和子菜单。",
    "design": [
      "常用动作直接展示，次要命令收纳菜单。",
      "Shortcut 只呈现快捷键说明。"
    ],
    "restrictions": [
      "快捷键监听、权限与业务动作由宿主实现。",
      "Content 已包含 Portal，不要重复包裹同一个内容。"
    ],
    "accessibility": [
      "Radix 提供方向键、Enter、Escape 和焦点返回。",
      "Trigger 必须有名称；禁用项使用 disabled，不能只降低透明度。"
    ],
    "interaction": "打开菜单后用 onSelect 处理命令；CheckboxItem、RadioGroup 通过各自受控回调更新。",
    "stateNotes": "支持关闭、打开、禁用项、勾选和单选，不提供异步加载容器。",
    "propNotes": {
      "open": {
        "description": "受控展开状态。"
      },
      "onOpenChange": {
        "description": "展开变化回调。"
      },
      "DropdownMenuContent.sideOffset": {
        "description": "内容与触发器间距。",
        "default": "4"
      },
      "DropdownMenuItem.inset": {
        "description": "为图标或勾选区域预留缩进。"
      },
      "DropdownMenuItem.onSelect": {
        "description": "菜单项激活回调。"
      },
      "DropdownMenuCheckboxItem.checked": {
        "description": "勾选状态。"
      },
      "DropdownMenuCheckboxItem.onCheckedChange": {
        "description": "勾选变化请求。"
      },
      "DropdownMenuRadioGroup.value": {
        "description": "单选值。"
      },
      "DropdownMenuRadioGroup.onValueChange": {
        "description": "单选变化请求。"
      },
      "DropdownMenuRadioItem.value": {
        "description": "单选项值。"
      },
      "DropdownMenuSub.open": {
        "description": "子菜单展开状态。"
      },
      "DropdownMenuSubTrigger.inset": {
        "description": "子菜单触发器缩进。"
      },
      "DropdownMenuLabel.inset": {
        "description": "组标题缩进。"
      },
      "DropdownMenuShortcut.children": {
        "description": "仅展示快捷键文本。"
      }
    }
  },
  {
    "name": "NavigationMenu",
    "title": "导航菜单",
    "category": "导航",
    "description": "组织站点级链接和可展开导航面板，基于 Radix NavigationMenu。",
    "design": [
      "页面跳转用 Link，展开分组用 Trigger。",
      "Viewport 与 List 放在同一个根节点中组织共享面板。"
    ],
    "restrictions": [
      "菜单值控制面板展开，active 表达路由选中，两者分别由宿主维护。",
      "不自动匹配路由或管理权限。"
    ],
    "accessibility": [
      "Link.active 输出 aria-current=\"page\"。",
      "横向关闭的 Trigger 支持 ArrowDown 打开；Radix 管理内部键盘导航。"
    ],
    "interaction": "点击导航链接进入页面；指针或键盘打开内容，受控时回写 onValueChange。",
    "stateNotes": "支持 active 链接、打开面板与子导航；无内置请求状态。",
    "propNotes": {
      "value": {
        "description": "当前打开面板的键。"
      },
      "defaultValue": {
        "description": "初始展开面板键。"
      },
      "onValueChange": {
        "description": "展开面板变化。"
      },
      "orientation": {
        "description": "Radix 菜单方向。"
      },
      "NavigationMenuItem.value": {
        "description": "导航面板键。"
      },
      "NavigationMenuLink.active": {
        "description": "当前页面标记。"
      },
      "NavigationMenuLink.asChild": {
        "description": "将链接行为组合到路由链接。"
      },
      "NavigationMenuTrigger.children": {
        "description": "分组按钮文字。"
      },
      "NavigationMenuContent.children": {
        "description": "导航面板链接内容。"
      },
      "NavigationMenuViewport.forceMount": {
        "description": "保留共享面板容器。"
      },
      "NavigationMenuIndicator.forceMount": {
        "description": "保留位置指示器。"
      },
      "NavigationMenuSub.value": {
        "description": "子导航当前值。"
      }
    }
  },
  {
    "name": "Pagination",
    "title": "分页",
    "category": "导航",
    "description": "按总条数、页大小和当前页生成分页导航。",
    "design": [
      "大页数自动显示省略号；窄空间可选 simple。",
      "条数摘要与列表实际查询范围保持一致。"
    ],
    "restrictions": [
      "不切片数据或发送请求；onChange 后由宿主更新列表。",
      "受控 current、pageSize 都要回写，切换页大小会请求第 1 页。"
    ],
    "accessibility": [
      "nav 使用本地化名称，当前页有 aria-current。",
      "前后翻页在边界禁用，页大小选择器提供名称。"
    ],
    "interaction": "点击页码通知页码和页大小；切换每页条数将页码重置为 1。",
    "stateNotes": "支持 disabled、simple、总数摘要、单页隐藏；无内置加载态。",
    "propNotes": {
      "total": {
        "description": "总记录数，负数或非有限值按 0 处理。"
      },
      "current": {
        "description": "受控页码，从 1 开始。"
      },
      "defaultCurrent": {
        "description": "非受控初始页。",
        "default": "1"
      },
      "pageSize": {
        "description": "每页条数，未传时内部从 10 开始。",
        "default": "10"
      },
      "pageSizeOptions": {
        "description": "选择器候选条数，自动补入当前值。",
        "default": "[10, 20, 50]"
      },
      "showSizeChanger": {
        "description": "显示页大小选择器。",
        "default": "false"
      },
      "showTotal": {
        "description": "显示总数或自定义范围摘要。",
        "default": "false"
      },
      "hideOnSinglePage": {
        "description": "单页时不渲染。",
        "default": "false"
      },
      "simple": {
        "description": "只显示当前页/总页数。",
        "default": "false"
      },
      "disabled": {
        "description": "禁用分页操作。",
        "default": "false"
      },
      "onChange": {
        "description": "返回 page 与 pageSize，由宿主查询并回写。"
      }
    }
  }
];
