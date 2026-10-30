import type { ComponentDoc } from '../types';

export const feedbackDocs: ComponentDoc[] = [
  {
    "name": "Alert",
    "title": "警告提示",
    "category": "反馈与浮层",
    "description": "在内容流内持续展示说明、警告、成功或错误信息。",
    "design": [
      "AlertTitle 简述结论，AlertDescription 给出原因或行动。",
      "需要永久保留的字段错误优先靠近对应控件。"
    ],
    "restrictions": [
      "不自动消失、不管理关闭状态，也不阻塞用户。"
    ],
    "accessibility": [
      "error 默认 role=alert，其余 role=status，可显式覆盖。",
      "状态图标为装饰，文字必须表达严重程度。"
    ],
    "interaction": "内容随宿主状态更新；需要操作时在正文内组合按钮。",
    "stateNotes": "支持四种 tone 和隐藏图标；无内置 loading/disabled。",
    "propNotes": {
      "tone": {
        "description": "提示语义。",
        "default": "info"
      },
      "showIcon": {
        "description": "显示状态图标。",
        "default": "true"
      },
      "role": {
        "description": "覆盖默认播报角色。"
      },
      "AlertTitle.children": {
        "description": "h5 标题；核对页面标题层级。"
      },
      "AlertDescription.children": {
        "description": "描述和可选操作内容。"
      }
    }
  },
  {
    "name": "Toast",
    "title": "轻提示",
    "category": "反馈与浮层",
    "description": "基于 Radix Toast 呈现短暂且非阻塞的反馈，需配合 Provider 和 Viewport。",
    "design": [
      "重要结果使用简短标题与可操作说明。",
      "复杂或必须确认的信息使用 Dialog/AlertDialog。"
    ],
    "restrictions": [
      "没有命令式 toast() API，宿主维护实例与 open。",
      "必须将 ToastViewport 放在 ToastProvider 中；跨页面队列由宿主管理。"
    ],
    "accessibility": [
      "Radix 管理播报、暂停与关闭；Action 必须提供 altText 说明替代动作。",
      "关闭按钮缺省提供图标和本地化名称，不能只给视觉符号。"
    ],
    "interaction": "更新 open 展示通知；关闭、超时和滑动通过 onOpenChange 通知宿主。",
    "stateNotes": "支持四种 tone、打开/关闭及 Radix duration/swipe 配置。",
    "propNotes": {
      "tone": {
        "description": "反馈视觉语义。",
        "default": "default"
      },
      "open": {
        "description": "受控显示状态。"
      },
      "defaultOpen": {
        "description": "Radix 非受控初始状态。"
      },
      "onOpenChange": {
        "description": "显示状态变化。"
      },
      "duration": {
        "description": "当前 Toast 展示时长，继承 Radix 配置。"
      },
      "ToastProvider.duration": {
        "description": "默认展示时长，继承已安装 Radix 默认值。"
      },
      "ToastProvider.swipeDirection": {
        "description": "允许滑动关闭的方向。"
      },
      "ToastViewport.hotkey": {
        "description": "聚焦通知区域的快捷键。"
      },
      "ToastTitle.children": {
        "description": "通知标题。"
      },
      "ToastDescription.children": {
        "description": "通知详情。"
      },
      "ToastAction.altText": {
        "description": "操作的可访问替代说明。"
      },
      "ToastClose.aria-label": {
        "description": "自定义关闭名称，无子内容时使用本地化默认名称。"
      }
    }
  },
  {
    "name": "Message",
    "title": "消息提示",
    "category": "反馈与浮层",
    "description": "以 ToastDescription 和关闭按钮组成一行短反馈。",
    "design": [
      "适合保存成功或复制结果等简短文字。"
    ],
    "restrictions": [
      "仍需外层 ToastProvider/ToastViewport，不是全局命令服务。",
      "重要持久错误不应仅依赖短暂消息。"
    ],
    "accessibility": [
      "继承 Radix Toast 的播报与关闭行为；消息正文说明结果。"
    ],
    "interaction": "通过 open 和 onOpenChange 控制显示，超时配置沿用 Toast。",
    "stateNotes": "支持 Toast 的 tone、时长与显示状态，没有内置请求。",
    "propNotes": {
      "children": {
        "description": "必填消息正文。"
      },
      "tone": {
        "description": "继承 Toast 的视觉语义。",
        "default": "default"
      },
      "open": {
        "description": "受控消息显示。"
      },
      "onOpenChange": {
        "description": "显示变化请求。"
      },
      "duration": {
        "description": "继承 Radix Toast 的时长设置。"
      }
    }
  },
  {
    "name": "Notification",
    "title": "通知",
    "category": "反馈与浮层",
    "description": "将标题、描述和操作组合为较完整的 Toast 通知。",
    "design": [
      "title 描述发生的事件，description 补充上下文。",
      "需要下一步动作时提供 action。"
    ],
    "restrictions": [
      "需要外层 ToastProvider/ToastViewport；不维护通知中心或持久历史。"
    ],
    "accessibility": [
      "标题与正文由 Toast 语义组织；action 如使用 ToastAction 需 altText。",
      "避免只通过通知颜色表达重要结果。"
    ],
    "interaction": "宿主设置 open 展示，操作元素负责业务行为；关闭回调更新 open。",
    "stateNotes": "支持 Toast tone 和时长；描述与操作可省略。",
    "propNotes": {
      "title": {
        "description": "必填通知标题。"
      },
      "description": {
        "description": "补充通知内容。"
      },
      "action": {
        "description": "可选操作节点。"
      },
      "tone": {
        "description": "继承 Toast 的语义色。",
        "default": "default"
      },
      "open": {
        "description": "受控显示状态。"
      },
      "onOpenChange": {
        "description": "显示变化回调。"
      },
      "duration": {
        "description": "继承 Radix 时长。"
      }
    }
  },
  {
    "name": "Dialog",
    "title": "对话框",
    "category": "反馈与浮层",
    "description": "承载需要聚焦完成的表单或详情，基于 Radix Dialog。",
    "design": [
      "使用 Header/Title/Description 给出任务上下文，Footer 放操作。"
    ],
    "restrictions": [
      "Content 已创建 Portal 与 Overlay；不要再重复包裹。",
      "不会保存表单或管理异步提交；受控 open/onOpenChange 负责关闭时机。"
    ],
    "accessibility": [
      "提供 DialogTitle 和 Description 或明确替代关联。",
      "Radix 管理模态焦点、Escape 和关闭后焦点恢复；自定义焦点回调需保留可用路径。"
    ],
    "interaction": "Trigger 打开，内置关闭按钮或 DialogClose 关闭；提交成功后宿主可关闭。",
    "stateNotes": "支持受控/非受控打开、模态设置与内容内的加载/错误组合。",
    "propNotes": {
      "open": {
        "description": "受控打开状态。"
      },
      "defaultOpen": {
        "description": "非受控初始打开。"
      },
      "onOpenChange": {
        "description": "打开变化请求。"
      },
      "modal": {
        "description": "Radix 模态配置。"
      },
      "DialogTrigger.asChild": {
        "description": "组合触发器到 Button 等单子元素。"
      },
      "DialogContent.closeLabel": {
        "description": "内置关闭按钮名称，空字符串回退。",
        "default": "locale.common.close"
      },
      "DialogContent.onOpenAutoFocus": {
        "description": "自定义打开后的焦点。"
      },
      "DialogContent.onCloseAutoFocus": {
        "description": "自定义关闭后焦点返回。"
      },
      "DialogTitle.children": {
        "description": "必备的可访问标题。"
      },
      "DialogDescription.children": {
        "description": "对话框任务说明。"
      },
      "DialogClose.asChild": {
        "description": "将关闭行为组合到操作元素。"
      },
      "DialogPortal.container": {
        "description": "单独使用 Portal 时指定宿主容器。"
      },
      "DialogHeader.children": {
        "description": "标题布局。"
      },
      "DialogFooter.children": {
        "description": "操作布局。"
      }
    }
  },
  {
    "name": "AlertDialog",
    "title": "确认对话框",
    "category": "反馈与浮层",
    "description": "要求用户明确确认或取消重要操作，基于 Radix AlertDialog。",
    "design": [
      "标题说明操作，描述说明后果；不可逆操作使用 destructive 确认按钮。"
    ],
    "restrictions": [
      "不执行删除或权限校验。",
      "异步确认需阻止默认关闭并由宿主在成功后更新 open。"
    ],
    "accessibility": [
      "必须提供 Title、Description 和 Cancel；Radix 默认优先聚焦取消操作。",
      "模态焦点和关闭后返回由 Radix 管理。"
    ],
    "interaction": "Trigger 打开；Action 或 Cancel 默认关闭，受控模式在 onOpenChange 中回写。",
    "stateNotes": "支持根受控开关与按钮禁用；请求中/失败内容由宿主组合。",
    "propNotes": {
      "open": {
        "description": "受控打开。"
      },
      "defaultOpen": {
        "description": "初始打开。"
      },
      "onOpenChange": {
        "description": "打开状态变化。"
      },
      "AlertDialogTrigger.asChild": {
        "description": "将触发行为合并到单个按钮。"
      },
      "AlertDialogContent.onOpenAutoFocus": {
        "description": "打开时焦点管理钩子。"
      },
      "AlertDialogTitle.children": {
        "description": "确认任务标题。"
      },
      "AlertDialogDescription.children": {
        "description": "后果与说明。"
      },
      "AlertDialogAction.variant": {
        "description": "确认按钮样式，可用 destructive。",
        "default": "default"
      },
      "AlertDialogAction.onClick": {
        "description": "确认逻辑；异步时可 preventDefault 后自行关闭。"
      },
      "AlertDialogCancel.children": {
        "description": "明确的取消文案，默认 secondary 样式。"
      },
      "AlertDialogPortal.container": {
        "description": "独立 Portal 容器配置。"
      },
      "AlertDialogHeader.children": {
        "description": "标题区域。"
      },
      "AlertDialogFooter.children": {
        "description": "确认/取消操作区。"
      }
    }
  },
  {
    "name": "Popover",
    "title": "气泡浮层",
    "category": "反馈与浮层",
    "description": "围绕触发器承载交互内容，比 Tooltip 适合表单与操作。",
    "design": [
      "内容与触发任务紧密相关，避免放入完整页面。"
    ],
    "restrictions": [
      "Content 已包含 Portal。",
      "没有默认标题或关闭按钮，宿主按内容添加名称和 PopoverClose。"
    ],
    "accessibility": [
      "Radix 提供焦点管理和 Escape 关闭。",
      "Trigger 提供名称，面板用 aria-label/aria-labelledby 描述用途。"
    ],
    "interaction": "点击触发器切换打开，点外部或 Escape 关闭；受控 open 需回写。",
    "stateNotes": "支持开关、定位、碰撞处理和 modal 模式。",
    "propNotes": {
      "open": {
        "description": "受控打开状态。"
      },
      "defaultOpen": {
        "description": "初始打开。"
      },
      "onOpenChange": {
        "description": "打开变化。"
      },
      "modal": {
        "description": "Radix 模态配置。"
      },
      "PopoverTrigger.asChild": {
        "description": "合并到单个触发器。"
      },
      "PopoverContent.align": {
        "description": "与锚点对齐。",
        "default": "center"
      },
      "PopoverContent.sideOffset": {
        "description": "距锚点间距。",
        "default": "8"
      },
      "PopoverContent.side": {
        "description": "面板方向。"
      },
      "PopoverContent.onOpenAutoFocus": {
        "description": "打开焦点回调。"
      },
      "PopoverContent.onCloseAutoFocus": {
        "description": "关闭焦点回调。"
      },
      "PopoverAnchor.asChild": {
        "description": "自定义定位锚点。"
      },
      "PopoverClose.asChild": {
        "description": "组合关闭按钮。"
      },
      "PopoverPortal.container": {
        "description": "独立 Portal 宿主。"
      },
      "PopoverArrow.width": {
        "description": "可选箭头宽度，继承 Radix。"
      }
    }
  },
  {
    "name": "Sheet",
    "title": "抽屉",
    "category": "反馈与浮层",
    "description": "从视口边缘展开详情、表单或移动导航，基于 Radix Dialog。",
    "design": [
      "side 对应内容来源；移动导航一般从 left 展开。",
      "保持主操作在可见操作区。"
    ],
    "restrictions": [
      "不是页面路由，不提供自动保存或宽度断点逻辑。",
      "Content 内置 Portal、Overlay 与关闭按钮。"
    ],
    "accessibility": [
      "提供 SheetTitle/Description；Radix 处理模态焦点和 Escape。",
      "closeLabel 可本地化，空值回退通用关闭名称。"
    ],
    "interaction": "Trigger 打开，关闭按钮或 SheetClose 关闭，受控状态需回写。",
    "stateNotes": "支持四边展开、受控与非受控；加载/错误由抽屉内容提供。",
    "propNotes": {
      "open": {
        "description": "受控打开状态。"
      },
      "defaultOpen": {
        "description": "初始打开。"
      },
      "onOpenChange": {
        "description": "打开变化回调。"
      },
      "SheetContent.side": {
        "description": "展开方向。",
        "default": "right"
      },
      "SheetContent.closeLabel": {
        "description": "关闭按钮名称。",
        "default": "locale.common.close"
      },
      "SheetContent.onOpenAutoFocus": {
        "description": "打开时焦点回调。"
      },
      "SheetContent.onCloseAutoFocus": {
        "description": "关闭后焦点回调。"
      },
      "SheetTrigger.asChild": {
        "description": "合并触发按钮。"
      },
      "SheetClose.asChild": {
        "description": "自定义关闭操作。"
      },
      "SheetTitle.children": {
        "description": "抽屉标题。"
      },
      "SheetDescription.children": {
        "description": "抽屉说明。"
      },
      "SheetPortal.container": {
        "description": "独立 Portal 容器。"
      },
      "SheetHeader.children": {
        "description": "标题区域。"
      },
      "SheetFooter.children": {
        "description": "操作区域。"
      }
    }
  },
  {
    "name": "Tooltip",
    "title": "文字提示",
    "category": "反馈与浮层",
    "description": "在悬停或键盘聚焦时补充简短非交互说明，基于 Radix Tooltip。",
    "design": [
      "提示作为补充，不把关键说明仅藏在悬停中。",
      "包含按钮/表单的内容应使用 Popover。"
    ],
    "restrictions": [
      "需要 TooltipProvider；没有触屏必达保证。",
      "Content 已包含 Portal，不接受必须交互的操作内容。"
    ],
    "accessibility": [
      "触发器可通过 Tab 聚焦；提示不能替代图标按钮 aria-label。",
      "Radix 建立描述关联，键盘聚焦可显示提示。"
    ],
    "interaction": "悬停/聚焦打开，离开或 Escape 关闭；可通过 open 受控。",
    "stateNotes": "支持延迟、定位和受控显示，无 loading/disabled 业务态。",
    "propNotes": {
      "open": {
        "description": "受控显示。"
      },
      "defaultOpen": {
        "description": "初始显示。"
      },
      "onOpenChange": {
        "description": "显示变化。"
      },
      "TooltipProvider.delayDuration": {
        "description": "全组悬停延迟，继承 Radix 默认。"
      },
      "TooltipProvider.skipDelayDuration": {
        "description": "连续提示跳过延迟窗口。"
      },
      "TooltipTrigger.asChild": {
        "description": "绑定到单个可聚焦触发器。"
      },
      "TooltipContent.sideOffset": {
        "description": "内容偏移。",
        "default": "6"
      },
      "TooltipContent.side": {
        "description": "提示方向。"
      },
      "TooltipContent.aria-label": {
        "description": "补充提示的辅助名称。"
      }
    }
  },
  {
    "name": "Skeleton",
    "title": "骨架屏",
    "category": "反馈与浮层",
    "description": "在内容加载时呈现结构占位，保持预计版面。",
    "design": [
      "形状和尺寸对应最终内容，避免随机装饰。"
    ],
    "restrictions": [
      "不管理加载状态或测量内容；由宿主决定何时替换。"
    ],
    "accessibility": [
      "未提供名称/角色时默认 aria-hidden。",
      "提供 aria-label/aria-labelledby 时默认 img；实际加载区域仍应设置 aria-busy 或状态说明。"
    ],
    "interaction": "宿主请求完成后用真实内容替换 Skeleton，组件自身没有操作。",
    "stateNotes": "支持 text、rectangle、circle 三种形状。",
    "propNotes": {
      "variant": {
        "description": "占位形状。",
        "default": "rectangle"
      },
      "aria-label": {
        "description": "需要读出的占位名称。"
      },
      "role": {
        "description": "显式语义角色，优先于自动 img。"
      },
      "style": {
        "description": "设置与目标内容对应的宽高。"
      }
    }
  },
  {
    "name": "Spin",
    "title": "加载中",
    "category": "反馈与浮层",
    "description": "展示等待提示，可包裹原内容表示该区域繁忙。",
    "design": [
      "tip 说明当前正在进行的任务。"
    ],
    "restrictions": [
      "不阻止内部子控件事件，也不发起或取消请求。",
      "需要禁止提交时显式禁用相关按钮。"
    ],
    "accessibility": [
      "根节点标记 aria-busy，指示器 role=status。",
      "复杂 tip 时指示器仍回退到本地化加载名称。"
    ],
    "interaction": "宿主切换 spinning 显示/隐藏指示器，children 始终保留。",
    "stateNotes": "支持 spinning 开/关，自定义 tip，不提供错误状态。",
    "propNotes": {
      "spinning": {
        "description": "显示繁忙状态。",
        "default": "true"
      },
      "tip": {
        "description": "加载提示，默认 locale.common.loading。"
      },
      "children": {
        "description": "始终保留的原内容。"
      }
    }
  },
  {
    "name": "Progress",
    "title": "进度条",
    "category": "反馈与浮层",
    "description": "展示已知百分比的任务进度与成功/异常状态。",
    "design": [
      "给进度条命名具体任务，异常时同时说明原因。"
    ],
    "restrictions": [
      "不估算进度、不驱动请求；percent 由宿主提供。",
      "不是不确定时长指示器，未知进度使用 Spin。"
    ],
    "accessibility": [
      "role=progressbar 暴露 0–100 范围和实际值。",
      "exception/success/active 提供状态文字，默认名称可被 aria-label/labelledby 覆盖。"
    ],
    "interaction": "任务进度更新 percent，完成或失败时更新 status；组件无点击操作。",
    "stateNotes": "非有限 percent 按 0、越界截断；支持四种状态与隐藏百分比文本。",
    "propNotes": {
      "percent": {
        "description": "当前百分比，限制在 0–100。",
        "default": "0"
      },
      "showInfo": {
        "description": "显示数字和状态图标。",
        "default": "true"
      },
      "status": {
        "description": "normal、active、success 或 exception。",
        "default": "normal"
      }
    }
  },
  {
    "name": "Result",
    "title": "结果页",
    "category": "反馈与浮层",
    "description": "集中展示操作结果或 403/404/500 等页面状态，并提供后续操作区域。",
    "design": [
      "标题说明发生了什么，subTitle 给出原因和下一步。",
      "extra 放回到列表、重试等明确操作。"
    ],
    "restrictions": [
      "status 不改变 HTTP 响应码、不校验权限，也不执行重试。"
    ],
    "accessibility": [
      "根为 section，标题为 h2。",
      "图标隐藏于辅助技术，结果含义写入 title/subTitle；动态出现时由宿主管理焦点或播报。"
    ],
    "interaction": "extra 中的按钮或链接负责后续行为，Result 仅展示。",
    "stateNotes": "支持 info/success/warning/error/403/404/500，无内置加载态。",
    "propNotes": {
      "title": {
        "description": "必填结果标题。"
      },
      "subTitle": {
        "description": "补充说明。"
      },
      "extra": {
        "description": "后续操作节点。"
      },
      "status": {
        "description": "结果视觉状态。",
        "default": "info"
      }
    }
  },
  {
    "name": "Accordion",
    "title": "手风琴",
    "category": "反馈与浮层",
    "description": "通过有标题的多个折叠项组织可按需查看的信息。",
    "design": [
      "标题概括隐藏内容，避免把必要步骤完全折叠。",
      "single 适合互斥详情，multiple 适合并行对照。"
    ],
    "restrictions": [
      "所有面板内容保持挂载，仅隐藏；不提供按需请求。",
      "单项键必须唯一，单选关闭回调为空字符串。"
    ],
    "accessibility": [
      "标题按钮使用 aria-expanded/controls，面板 role=region。",
      "上下键、Home/End 在可用标题中移动，Enter/Space 切换。"
    ],
    "interaction": "onValueChange 返回单键或键数组；受控 value 由宿主更新。",
    "stateNotes": "支持单/多开、根/项禁用；collapsible=false 在 single 时阻止再次点击关闭。",
    "propNotes": {
      "items": {
        "description": "key/title/children/disabled 数组。",
        "default": "[]"
      },
      "type": {
        "description": "single 或 multiple。",
        "default": "single"
      },
      "value": {
        "description": "受控键或键集合。"
      },
      "defaultValue": {
        "description": "初始打开键。"
      },
      "onValueChange": {
        "description": "单值时返回键或空字符串，多值返回数组。"
      },
      "collapsible": {
        "description": "单开模式能否收起当前项。",
        "default": "true"
      },
      "disabled": {
        "description": "禁止所有标题操作。",
        "default": "false"
      }
    }
  },
  {
    "name": "Collapsible",
    "title": "折叠面板",
    "category": "反馈与浮层",
    "description": "用一个触发器控制一块辅助内容的展开，适合局部详情。",
    "design": [
      "触发器说明展开的内容；多项标题管理使用 Accordion。"
    ],
    "restrictions": [
      "Trigger 和 Content 必须位于同一个 Collapsible 内。",
      "默认关闭时卸载内容，需保留输入草稿时设置 forceMount。"
    ],
    "accessibility": [
      "Trigger 自动关联 aria-expanded 和内容 ID。",
      "Enter/Space 切换，forceMount 的关闭内容仍设置 hidden 和 aria-hidden。"
    ],
    "interaction": "点击触发器请求相反 open；受控模式须更新 open。",
    "stateNotes": "支持打开、关闭、disabled 和保留挂载。",
    "propNotes": {
      "open": {
        "description": "受控展开状态。"
      },
      "defaultOpen": {
        "description": "初始展开。",
        "default": "false"
      },
      "onOpenChange": {
        "description": "展开变化请求。"
      },
      "disabled": {
        "description": "禁止切换。",
        "default": "false"
      },
      "CollapsibleTrigger.type": {
        "description": "原生按钮类型。",
        "default": "button"
      },
      "CollapsibleTrigger.disabled": {
        "description": "单独禁用触发器。"
      },
      "CollapsibleContent.forceMount": {
        "description": "关闭时仍保留 DOM，但隐藏。",
        "default": "false"
      }
    }
  }
];
