import type { ComponentDoc } from '../types';

export const displayDocs: ComponentDoc[] = [
  {
    "name": "Card",
    "title": "卡片",
    "category": "数据展示",
    "description": "为一组相关内容提供边界与标题、正文和操作分区。",
    "design": [
      "按 Header/Content/Footer 组合，避免过度套卡片。",
      "标题、说明与操作保持清晰层级。"
    ],
    "restrictions": [
      "根是静态 div，不内置整卡可点击、加载或折叠。"
    ],
    "accessibility": [
      "CardTitle 输出 h3，嵌入页面时核对标题层级。",
      "卡片里的链接/按钮各自命名，不把静态 div 当按钮。"
    ],
    "interaction": "交互通过 Footer 或正文内的 Button/Link 完成，Card 不管理状态。",
    "stateNotes": "空内容、加载或失败需要宿主组合对应组件。",
    "propNotes": {
      "children": {
        "description": "组合各分区。"
      },
      "CardHeader.children": {
        "description": "标题和说明区域。"
      },
      "CardTitle.children": {
        "description": "h3 标题。"
      },
      "CardDescription.children": {
        "description": "p 说明。"
      },
      "CardContent.children": {
        "description": "主体内容。"
      },
      "CardFooter.children": {
        "description": "操作区域。"
      }
    }
  },
  {
    "name": "Badge",
    "title": "徽标",
    "category": "数据展示",
    "description": "用紧凑的文字标识状态或分类。",
    "design": [
      "文案保持简短；语义色与状态含义一致。"
    ],
    "restrictions": [
      "静态 span，不支持数字计数逻辑、关闭或点击按钮语义。"
    ],
    "accessibility": [
      "文字需直接表达状态，不能只用背景颜色。",
      "动态业务反馈如需即时播报，在宿主区域设置合适的 live region。"
    ],
    "interaction": "更新 children 或 variant 改变展示；没有内部交互。",
    "stateNotes": "支持 default、secondary、outline、success、warning、error。",
    "propNotes": {
      "variant": {
        "description": "徽标视觉语义。",
        "default": "default"
      },
      "children": {
        "description": "徽标文字。"
      }
    }
  },
  {
    "name": "Table",
    "title": "表格",
    "category": "数据展示",
    "description": "以原生表格呈现结构化数据，支持列渲染和行勾选。",
    "design": [
      "数值列可右对齐；宽列用 width/ellipsis 控制。",
      "行键选择稳定业务 ID。"
    ],
    "restrictions": [
      "不内置排序、过滤、分页、固定列或虚拟化。",
      "未指定 rowKey 时回退 record.key，再回退索引；重排数据不应依赖索引键。",
      "表头全选以当前 dataSource 的全部键替换整个选择集合；取消全选发出 []，也会清除其他页的键。单行切换则保留其他键。",
      "需要保留跨页选择时，受控管理 selectedRowKeys 并结合当前页键合并/移除回调结果，或设置 showSelectAll=false 隐藏表头全选。回调的 selectedRows 只包含当前 dataSource 中的记录。"
    ],
    "accessibility": [
      "列头含 scope=\"col\"，loading 使用 aria-busy。",
      "行选中通过具名 Checkbox，已选数量以 status 播报；宿主为表格提供名称。"
    ],
    "interaction": "单行勾选在原键集合上增删；表头全选用当前数据全部键替换集合，取消全选清空整个集合。回调记录仅来自当前 dataSource；受控 selectedRowKeys 回写后展示。",
    "stateNotes": "支持加载替换行、空内容、选中和半选；请求失败由宿主单独展示。",
    "propNotes": {
      "columns": {
        "description": "TableColumn<T>[]：key/title、dataIndex、render、align、width、ellipsis。"
      },
      "dataSource": {
        "description": "当前渲染记录。",
        "default": "[]"
      },
      "rowKey": {
        "description": "稳定记录键字段或函数。"
      },
      "loading": {
        "description": "替换表体为加载提示。",
        "default": "false"
      },
      "emptyText": {
        "description": "空记录内容。"
      },
      "rowSelection": {
        "description": "开启选择并配置受控/初始键及回调。"
      },
      "rowSelection.selectedRowKeys": {
        "description": "受控键集合。"
      },
      "rowSelection.defaultSelectedRowKeys": {
        "description": "初始选择。",
        "default": "[]"
      },
      "rowSelection.showSelectAll": {
        "description": "显示表头全选；跨页选择需自行合并结果，或设为 false 避免整集合替换。",
        "default": "true"
      },
      "rowSelection.onChange": {
        "description": "新键集合及当前数据中的选中记录；表头全选返回当前页全部键，取消全选返回 []，不保留其他页的键。"
      }
    }
  },
  {
    "name": "Descriptions",
    "title": "描述列表",
    "category": "数据展示",
    "description": "以标签和值展示详情数据，使用 dl/dt/dd 语义。",
    "design": [
      "column 定义宽容器列数，窄容器回到单列。",
      "长值可通过 item.span 分配更多列。"
    ],
    "restrictions": [
      "静态详情组件，不处理编辑、请求或字段格式化。",
      "span 被限制在 1 到 column。"
    ],
    "accessibility": [
      "标签和值保持语义配对；title 关联列表。",
      "加载使用 status，错误使用 alert。"
    ],
    "interaction": "更新 items 改变详情；点击行为仅来自调用方插入的链接或按钮。",
    "stateNotes": "状态优先级为 loading、error、空、正常内容。",
    "propNotes": {
      "items": {
        "description": "key/label/children/span 详情项。",
        "default": "[]"
      },
      "column": {
        "description": "宽容器列数 1–4。",
        "default": "3"
      },
      "bordered": {
        "description": "显示边框。",
        "default": "false"
      },
      "title": {
        "description": "详情标题。"
      },
      "loading": {
        "description": "加载替换正常内容。",
        "default": "false"
      },
      "loadingText": {
        "description": "自定义加载说明。"
      },
      "emptyText": {
        "description": "空详情提示。"
      },
      "error": {
        "description": "错误内容，非 null 时显示。"
      }
    }
  },
  {
    "name": "Statistic",
    "title": "统计值",
    "category": "数据展示",
    "description": "突出展示一个指标、单位和趋势说明。",
    "design": [
      "通过 prefix/suffix 明确货币或单位。",
      "趋势文字说明方向与比较周期。"
    ],
    "restrictions": [
      "precision 只对 number 使用 toFixed，不进行本地化千分位或财务计算。",
      "空字符串不是空状态；只有 null/undefined 视为空。"
    ],
    "accessibility": [
      "趋势箭头是装饰，trend.label 必须包含方向含义。",
      "加载和错误分别使用 status/alert。"
    ],
    "interaction": "宿主查询后更新 value 和 trend；组件不启动统计请求。",
    "stateNotes": "loading、error、空值替换指标及趋势；0 是有效值。",
    "propNotes": {
      "title": {
        "description": "指标名称。"
      },
      "value": {
        "description": "字符串或数字指标，null/undefined 表示空。"
      },
      "precision": {
        "description": "数字小数位数，限制 0–100。"
      },
      "prefix": {
        "description": "数值前缀。"
      },
      "suffix": {
        "description": "数值后缀。"
      },
      "trend": {
        "description": "direction 和包含趋势含义的 label。"
      },
      "loading": {
        "description": "隐藏指标并显示加载。",
        "default": "false"
      },
      "loadingText": {
        "description": "加载文字。"
      },
      "emptyText": {
        "description": "空值说明。"
      },
      "error": {
        "description": "错误内容。"
      }
    }
  },
  {
    "name": "Steps",
    "title": "步骤条",
    "category": "数据展示",
    "description": "展示有序流程进度，以当前索引推导各步骤状态。",
    "design": [
      "标题描述阶段；description 补充完成条件。",
      "长流程或窄区域优先 vertical。"
    ],
    "restrictions": [
      "不是导航组件，没有步骤点击回调或表单校验。",
      "current 从 0 开始，-1 表示全部等待。"
    ],
    "accessibility": [
      "使用 ol，当前项标记 aria-current=\"step\"。",
      "状态提供隐藏文本，图标仅作装饰。"
    ],
    "interaction": "外部下一步/上一步按钮校验后更新 current；条目自身不执行跳转。",
    "stateNotes": "状态 wait/process/finish/error，可由单项 status 覆盖推导。",
    "propNotes": {
      "items": {
        "description": "key/title/description/icon/status 项数组。",
        "default": "[]"
      },
      "current": {
        "description": "当前零基索引，-1 全等待。",
        "default": "0"
      },
      "status": {
        "description": "当前步骤状态。",
        "default": "process"
      },
      "direction": {
        "description": "排列方向。",
        "default": "horizontal"
      },
      "emptyText": {
        "description": "无步骤提示。"
      }
    }
  },
  {
    "name": "Timeline",
    "title": "时间线",
    "category": "数据展示",
    "description": "按传入顺序呈现事件、时间标签和结果状态。",
    "design": [
      "label 用于时间或阶段，children 描述事件。",
      "按业务顺序提供数组，明确时间区时可直接写在标签中。"
    ],
    "restrictions": [
      "不排序、不转换时区、不轮询；pending 是展示状态。"
    ],
    "accessibility": [
      "使用有序列表，每项附加可朗读状态。",
      "自定义 dot 放在 aria-hidden 区域，重要信息必须同时写入内容。"
    ],
    "interaction": "宿主更新 items 追加事件；列表无内置展开或分页。",
    "stateNotes": "支持 loading、空列表和 default/success/warning/error/pending 项状态。",
    "propNotes": {
      "items": {
        "description": "key/children/label/dot/status 事件数组。",
        "default": "[]"
      },
      "loading": {
        "description": "加载时替换事件列表。",
        "default": "false"
      },
      "loadingText": {
        "description": "加载文字。"
      },
      "emptyText": {
        "description": "空列表说明。"
      }
    }
  },
  {
    "name": "Tree",
    "title": "树",
    "category": "数据展示",
    "description": "展示层级节点，并分别管理展开、选择和父子联动勾选。",
    "design": [
      "节点名称清晰，展开与选中表达不同含义。",
      "复杂 label 提供 textValue 作为搜索和命名依据。"
    ],
    "restrictions": [
      "使用全局唯一键的无环树；不支持懒加载、拖拽排序或虚拟化。",
      "禁用祖先同时禁止后代操作，勾选联动不包含禁用分支。"
    ],
    "accessibility": [
      "treeitem 使用 roving tabIndex；方向键、Home/End 导航。",
      "Enter 选择，Space 在 checkable 时勾选，根需提供可访问名称。"
    ],
    "interaction": "展开、选择、勾选分别触发 onExpand/onSelect/onCheck；受控各键集合需独立更新。",
    "stateNotes": "支持半选、单/多选、整树/节点禁用、空树。",
    "propNotes": {
      "treeData": {
        "description": "TreeNode<T>[]，键类型保持一致且全局唯一。"
      },
      "checkable": {
        "description": "显示联动复选框。",
        "default": "false"
      },
      "multiple": {
        "description": "允许多节点选择。",
        "default": "false"
      },
      "defaultExpandAll": {
        "description": "初始展开全部。",
        "default": "false"
      },
      "expandedKeys": {
        "description": "受控展开键。"
      },
      "defaultExpandedKeys": {
        "description": "初始展开键。",
        "default": "[]"
      },
      "selectedKeys": {
        "description": "受控选择键。"
      },
      "defaultSelectedKeys": {
        "description": "初始选择键。",
        "default": "[]"
      },
      "checkedKeys": {
        "description": "受控勾选键。"
      },
      "defaultCheckedKeys": {
        "description": "初始勾选键。",
        "default": "[]"
      },
      "disabled": {
        "description": "整树禁用。",
        "default": "false"
      },
      "emptyContent": {
        "description": "空树提示。"
      },
      "onExpand": {
        "description": "展开键和本次节点。"
      },
      "onSelect": {
        "description": "选择键和本次节点。"
      },
      "onCheck": {
        "description": "规范化的勾选键与节点。"
      }
    }
  },
  {
    "name": "TreeSelect",
    "title": "树选择",
    "category": "数据展示",
    "description": "在浮层内搜索并单选树节点，适合组织、分类等层级字段。",
    "design": [
      "需要保存完整路径时用 Cascader；只保存节点键时用 TreeSelect。"
    ],
    "restrictions": [
      "只支持单值选择；无远程懒加载或多选。",
      "treeData 为唯一键无环树，自定义组件标签需 textValue。"
    ],
    "accessibility": [
      "Trigger 暴露树型选择与展开状态，内部 Tree 保留键盘操作。",
      "为 Trigger 提供字段名，搜索输入有本地化名称。"
    ],
    "interaction": "搜索保留匹配节点与祖先并自动展开，仍可手动收展；选择后关闭并清空查询。",
    "stateNotes": "支持 disabled、空匹配、清空和默认展开。",
    "propNotes": {
      "treeData": {
        "description": "层级数据。"
      },
      "value": {
        "description": "受控节点值，显式 undefined 为受控空值。"
      },
      "defaultValue": {
        "description": "初始节点值。"
      },
      "onChange": {
        "description": "节点键及节点，清空为 undefined。"
      },
      "onSearch": {
        "description": "查询文本变化。"
      },
      "searchable": {
        "description": "显示搜索输入。",
        "default": "true"
      },
      "allowClear": {
        "description": "允许清空。",
        "default": "true"
      },
      "defaultExpandAll": {
        "description": "初始展开全部节点。"
      },
      "emptyContent": {
        "description": "无匹配内容。"
      },
      "placeholder": {
        "description": "未选择时提示。"
      }
    }
  },
  {
    "name": "Image",
    "title": "图片",
    "category": "数据展示",
    "description": "原生图片展示，并在加载失败时切换为可定制占位内容。",
    "design": [
      "设置合理 width/height 减少布局跳动。",
      "功能性图片用具体 alt，装饰图使用空 alt。"
    ],
    "restrictions": [
      "无自动重试、下载、裁剪或预览；换 src 才重置失败状态。",
      "失败占位是 span，不透传全部 img 属性和 ref。"
    ],
    "accessibility": [
      "alt 默认空字符串；失败时非空 alt 保留 img 角色和名称。",
      "空 alt 的占位自动隐藏于辅助技术。"
    ],
    "interaction": "onError 先切换失败占位再通知宿主，可更新 src 重试。",
    "stateNotes": "支持正常和失败，占位内容可通过 fallback 定制。",
    "propNotes": {
      "alt": {
        "description": "图片替代文本；装饰图片保留空值。",
        "default": "空字符串"
      },
      "src": {
        "description": "图片地址。"
      },
      "fallback": {
        "description": "失败占位 ReactNode，默认使用本地化失败文字。"
      },
      "onError": {
        "description": "原生图片错误事件。"
      }
    }
  },
  {
    "name": "ImagePreview",
    "title": "图片预览",
    "category": "数据展示",
    "description": "用具名按钮展示缩略图，并通过 Dialog 打开大图。",
    "design": [
      "缩略图与预览保持相同语义；长标题通过 previewTitle 提供。"
    ],
    "restrictions": [
      "只提供单图弹窗，无缩放、旋转、相册或下载。",
      "disabled 禁用触发按钮，不会自动覆盖受控 open。"
    ],
    "accessibility": [
      "沿用 Dialog 焦点约束、Escape 关闭与返回触发器。",
      "alt 命名触发器和预览，空 alt 使用本地化预览名称。"
    ],
    "interaction": "点击缩略图打开；onOpenChange 通知展开变化，受控 open 由宿主更新。",
    "stateNotes": "支持默认打开、受控打开、禁用触发器和 Image 失败占位。",
    "propNotes": {
      "open": {
        "description": "受控预览状态。"
      },
      "defaultOpen": {
        "description": "初始展开状态。",
        "default": "false"
      },
      "onOpenChange": {
        "description": "展开变化请求。"
      },
      "disabled": {
        "description": "禁用缩略图按钮。",
        "default": "false"
      },
      "closeLabel": {
        "description": "关闭按钮名称。"
      },
      "previewTitle": {
        "description": "DialogTitle 内容。"
      },
      "previewClassName": {
        "description": "大图对话框 className。"
      },
      "className": {
        "description": "缩略图触发按钮 className。"
      },
      "fallback": {
        "description": "传给缩略图和预览图的失败占位。"
      }
    }
  },
  {
    "name": "Tag",
    "title": "标签",
    "category": "数据展示",
    "description": "展示分类或选中词条，可提供显式移除操作。",
    "design": [
      "语义色与标签含义一致，长内容应可读。"
    ],
    "restrictions": [
      "closable 只显示关闭按钮；onClose 不会自动把标签从 DOM 删除。"
    ],
    "accessibility": [
      "关闭按钮名称关联标签文本；纯图标标签用 closeLabel。",
      "状态不能仅依赖 tone 区分。"
    ],
    "interaction": "关闭触发 onClose，宿主更新标签集合以真正移除。",
    "stateNotes": "支持五种 tone、可关闭和禁用关闭操作。",
    "propNotes": {
      "tone": {
        "description": "标签语义色。",
        "default": "default"
      },
      "closable": {
        "description": "显示关闭按钮。"
      },
      "closeLabel": {
        "description": "覆盖关闭按钮名称。"
      },
      "disabled": {
        "description": "禁止关闭操作。"
      },
      "onClose": {
        "description": "请求移除标签，由调用方决定渲染。"
      }
    }
  }
];
