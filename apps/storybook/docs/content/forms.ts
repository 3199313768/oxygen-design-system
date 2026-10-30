import type { ComponentDoc } from '../types';

export const formsDocs: ComponentDoc[] = [
  {
    "name": "Field",
    "title": "字段容器",
    "category": "表单与录入",
    "description": "关联标签、控件、帮助和错误，提供一致的字段语义。",
    "design": [
      "一个 Field 对应一个主控件。",
      "错误说明具体修复方式，帮助说明输入格式。"
    ],
    "restrictions": [
      "不执行校验，不收集值。",
      "FieldControl 使用 Slot，需单个能转发属性的子控件；自定义包装组件里的描述关系需显式关联。"
    ],
    "accessibility": [
      "自动生成 id、aria-describedby 和错误状态。",
      "显式 aria-describedby 优先于自动值；覆盖时需自行包含仍需朗读的帮助和错误 ID。"
    ],
    "interaction": "宿主根据校验结果设置 invalid/error，容器将消息与控件关联。",
    "stateNotes": "支持 required、invalid、帮助和错误；空消息不生成无效引用。",
    "propNotes": {
      "id": {
        "description": "主控件 id，省略时生成。"
      },
      "invalid": {
        "description": "字段无效标记。",
        "default": "false"
      },
      "required": {
        "description": "字段必填语义。",
        "default": "false"
      },
      "description": {
        "description": "控件帮助文本。"
      },
      "error": {
        "description": "错误内容。"
      },
      "FieldLabel.htmlFor": {
        "description": "默认关联上下文 controlId。"
      },
      "FieldControl.children": {
        "description": "接收关联属性的单个控件。"
      },
      "FieldControl.aria-describedby": {
        "description": "显式值覆盖自动描述引用。"
      },
      "FieldDescription.id": {
        "description": "描述 ID，可用于自定义关联。"
      },
      "FieldError.id": {
        "description": "错误 ID；非空错误使用 alert 播报。"
      }
    }
  },
  {
    "name": "Label",
    "title": "标签",
    "category": "表单与录入",
    "description": "为一个可标记的输入控件提供可见名称，基于 Radix Label。",
    "design": [
      "标签始终可见；占位符用于示例而不替代标签。"
    ],
    "restrictions": [
      "不会自动生成控件 id；独立使用时显式设置 htmlFor。"
    ],
    "accessibility": [
      "htmlFor 与输入 id 一致；点击标签聚焦关联控件。",
      "复合分组用 aria-labelledby 或 fieldset/legend 建立名称。"
    ],
    "interaction": "点击关联标签把焦点交给对应输入，值仍属于输入控件。",
    "stateNotes": "没有独立校验、禁用或加载状态。",
    "propNotes": {
      "htmlFor": {
        "description": "关联控件 id。"
      },
      "asChild": {
        "description": "Radix Slot 组合标签元素；保留标记语义。"
      },
      "children": {
        "description": "可见名称。"
      }
    }
  },
  {
    "name": "Form",
    "title": "表单",
    "category": "表单与录入",
    "description": "提供原生 form 和布局约定，使用 Form.Item 组合字段。",
    "design": [
      "vertical 适合常规录入，horizontal 适合对齐字段，inline 适合短筛选。"
    ],
    "restrictions": [
      "不包含字段注册、数据模型或校验引擎。",
      "提交逻辑、preventDefault、服务端错误与请求幂等由宿主负责。"
    ],
    "accessibility": [
      "保留原生表单、提交和键盘语义。",
      "通过 Form.Item 或 Field 关联每个输入的标签和错误。"
    ],
    "interaction": "在 onSubmit 中读取和校验数据，提交期间为按钮设置 loading。",
    "stateNotes": "根表单只提供三种布局；字段错误与提交中需组合下级组件表达。",
    "propNotes": {
      "layout": {
        "description": "字段布局。",
        "default": "vertical"
      },
      "onSubmit": {
        "description": "原生表单提交事件。"
      },
      "FormItem.children": {
        "description": "单个控件，亦可用 Form.Item。"
      },
      "FormItem.validateStatus": {
        "description": "error、warning、success 展示状态。"
      },
      "FormItem.help": {
        "description": "字段帮助或错误内容。"
      }
    }
  },
  {
    "name": "FormItem",
    "title": "表单项",
    "category": "表单与录入",
    "description": "将一个控件与标签、必填提示、帮助和校验状态组合，可使用 Form.Item。",
    "design": [
      "label 描述字段，help 给出操作性提示。",
      "仅 error 将 help 作为错误，其余状态作为帮助。"
    ],
    "restrictions": [
      "children 必须为单个 ReactElement。",
      "name 用作生成控件 id 的候选，不自动注入原生 name，也不注册表单字段。"
    ],
    "accessibility": [
      "优先使用子控件 id，其次 name，再生成 ID。",
      "为控件设置 aria-labelledby、aria-required 和 error 描述；必填星号为装饰。"
    ],
    "interaction": "宿主校验后切换 validateStatus/help，受控值在子控件回调中更新。",
    "stateNotes": "支持 error、success、warning 和 required；required 不等同业务验证。",
    "propNotes": {
      "children": {
        "description": "单个能接收关联属性的控件。"
      },
      "label": {
        "description": "可见标签。"
      },
      "help": {
        "description": "帮助文字，error 状态下作为错误。"
      },
      "name": {
        "description": "控件 ID 的回退值，不是数据绑定。"
      },
      "required": {
        "description": "必填星号和 ARIA 提示。",
        "default": "false"
      },
      "validateStatus": {
        "description": "字段展示状态，不执行规则。"
      }
    }
  },
  {
    "name": "Input",
    "title": "输入框",
    "category": "表单与录入",
    "description": "带 Oxygen 样式的原生 input，适合单行文本与原生输入类型。",
    "design": [
      "配合 Label/Field 显示标签与提示。",
      "按数据含义设置 type、autoComplete 和 inputMode。"
    ],
    "restrictions": [
      "不内置清空、密码显隐、请求或业务校验。",
      "受控 value 需在原生 onChange 中读取 event.currentTarget.value。"
    ],
    "accessibility": [
      "保持原生键盘、name、required 和 ref 行为。",
      "aria-invalid 应与可访问的错误说明共同使用。"
    ],
    "interaction": "输入通过原生 onChange 通知；value/defaultValue 分别用于受控/非受控。",
    "stateNotes": "支持原生 disabled、readOnly、required、aria-invalid。",
    "propNotes": {
      "type": {
        "description": "原生输入类型。",
        "default": "text"
      },
      "value": {
        "description": "受控原生值。"
      },
      "defaultValue": {
        "description": "非受控初始值。"
      },
      "onChange": {
        "description": "原生 ChangeEvent；不是直接返回字符串。"
      }
    }
  },
  {
    "name": "Textarea",
    "title": "多行输入",
    "category": "表单与录入",
    "description": "保留原生 textarea API 的多行文本输入。",
    "design": [
      "通过 rows 与容器宽度控制初始空间。",
      "长文本说明放在字段描述中。"
    ],
    "restrictions": [
      "不内置字数统计、自动增高或富文本编辑。"
    ],
    "accessibility": [
      "设置可见 Label，保留多行输入与换行键盘语义。",
      "maxLength 限制需配合可理解的提示。"
    ],
    "interaction": "原生 onChange 返回事件，由宿主更新受控文本。",
    "stateNotes": "支持 disabled、readOnly、required 与错误标记。",
    "propNotes": {
      "rows": {
        "description": "原生可见行数，未覆盖浏览器默认值。"
      },
      "value": {
        "description": "受控文本。"
      },
      "defaultValue": {
        "description": "初始文本。"
      },
      "onChange": {
        "description": "原生 textarea 变化事件。"
      },
      "maxLength": {
        "description": "原生最大文本长度。"
      }
    }
  },
  {
    "name": "InputNumber",
    "title": "数字输入",
    "category": "表单与录入",
    "description": "提供数值输入、步进按钮、范围约束及格式化/解析钩子。",
    "design": [
      "数值后缀应有明确单位；财务显示配对 formatter/parser。"
    ],
    "restrictions": [
      "使用 JavaScript number，精确金额计算仍由宿主处理。",
      "不完整的负号、小数或指数暂存为草稿，失焦/Enter 时提交规范值。"
    ],
    "accessibility": [
      "输入使用 spinbutton 及真实范围值；加减按钮使用本地化名称。",
      "仍需提供字段名称与单位说明。"
    ],
    "interaction": "键入可解析数值时回调；ArrowUp/Down 或按钮步进，Escape 恢复已提交值。",
    "stateNotes": "空值返回 undefined；disabled/readOnly 均禁止步进。",
    "propNotes": {
      "value": {
        "description": "受控数值，允许 undefined 表示空。"
      },
      "defaultValue": {
        "description": "非受控初值。"
      },
      "onChange": {
        "description": "规范化后的 number 或 undefined。"
      },
      "min": {
        "description": "下界。"
      },
      "max": {
        "description": "上界。"
      },
      "step": {
        "description": "正数步长。",
        "default": "1"
      },
      "precision": {
        "description": "小数精度，规范为 0–100。"
      },
      "formatter": {
        "description": "从数值生成显示字符串。"
      },
      "parser": {
        "description": "从字符串解析数值，与 formatter 配对。"
      }
    }
  },
  {
    "name": "Select",
    "title": "选择器",
    "category": "表单与录入",
    "description": "基于 Radix 的单选下拉，适合候选项固定且不需要搜索的字段。",
    "design": [
      "显示 SelectValue 占位符并提供可见标签。",
      "使用 Group/Label 对较多选项分组。"
    ],
    "restrictions": [
      "不提供多选、远程加载或内置搜索；可搜索选择使用 Combobox。",
      "SelectItem.value 不使用空字符串；空值由根值/占位符表达。"
    ],
    "accessibility": [
      "Trigger 在 Field 内继承标签与错误关系。",
      "Radix 管理键盘导航、选中项与焦点恢复，纯图标触发器仍需名称。"
    ],
    "interaction": "Trigger 打开选项；onValueChange 返回字符串，受控模式需回写。",
    "stateNotes": "Root/Item 支持禁用，Value 支持占位符。",
    "propNotes": {
      "value": {
        "description": "当前字符串值。"
      },
      "defaultValue": {
        "description": "初始字符串值。"
      },
      "onValueChange": {
        "description": "选项变化回调。"
      },
      "disabled": {
        "description": "禁止选择。"
      },
      "SelectTrigger.aria-label": {
        "description": "无可见标签时的名称。"
      },
      "SelectContent.position": {
        "description": "内容定位方式。",
        "default": "popper"
      },
      "SelectValue.placeholder": {
        "description": "未选择时显示内容。"
      },
      "SelectItem.value": {
        "description": "必填的非空选项值。"
      },
      "SelectItem.disabled": {
        "description": "禁用选项。"
      },
      "SelectGroup.children": {
        "description": "分组选项。"
      },
      "SelectLabel.children": {
        "description": "分组说明。"
      },
      "SelectSeparator.className": {
        "description": "组间分隔样式。"
      },
      "SelectScrollUpButton.children": {
        "description": "向上滚动按钮内容。"
      },
      "SelectScrollDownButton.children": {
        "description": "向下滚动按钮内容。"
      }
    }
  },
  {
    "name": "Combobox",
    "title": "可搜索选择",
    "category": "表单与录入",
    "description": "在输入框中搜索并选择 Option，适合有文字索引的候选集合。",
    "design": [
      "选项 label 优先使用可转为文字的内容。",
      "loading 与空选项要明确区分。"
    ],
    "restrictions": [
      "默认过滤只读取字符串/数字标签；复杂标签需 filterOption。",
      "onSearch 只通知查询文字，不发送请求；宿主管理远程请求和竞态。"
    ],
    "accessibility": [
      "输入保持焦点并通过 aria-activedescendant 指示活动选项。",
      "为输入提供名称，禁用项不能通过键盘或点击选中。"
    ],
    "interaction": "上下键浏览、Enter 选择、Escape 或离开恢复选择文本；清空回调 undefined。",
    "stateNotes": "支持 disabled、readOnly、loading、空项与清空。",
    "propNotes": {
      "options": {
        "description": "带 value、label、disabled 的候选数组。"
      },
      "value": {
        "description": "受控选项值，显式 undefined 表示受控空值。"
      },
      "defaultValue": {
        "description": "初始选择。"
      },
      "allowClear": {
        "description": "显示清空操作。",
        "default": "true"
      },
      "loading": {
        "description": "显示加载并阻止选择。",
        "default": "false"
      },
      "filterOption": {
        "description": "替换默认文字包含过滤。"
      },
      "emptyContent": {
        "description": "无匹配项提示。"
      },
      "onChange": {
        "description": "选项值和 Option，清空为 undefined。"
      },
      "onSearch": {
        "description": "输入查询变化。"
      }
    }
  },
  {
    "name": "Cascader",
    "title": "级联选择",
    "category": "表单与录入",
    "description": "按层级逐列选择完整节点路径，适合地域或分类路径。",
    "design": [
      "每层节点标签保持短且易区分。",
      "需要完整路径时保留 changeOnSelect=false。"
    ],
    "restrictions": [
      "options 使用全局唯一键和无环树；不内置懒加载或虚拟化。",
      "受控路径必须与 options 实际父子链匹配。"
    ],
    "accessibility": [
      "触发器暴露展开状态，列内使用原生按钮。",
      "当前实现通过 Tab/按钮激活浏览列，不宣称完整树形方向键操作。"
    ],
    "interaction": "点击父节点展开下一列，点击叶子提交并关闭；清空提交 []。",
    "stateNotes": "支持禁用节点、空数据、清空和中间层提交。",
    "propNotes": {
      "options": {
        "description": "TreeNode 层级数据。"
      },
      "value": {
        "description": "受控完整路径键数组。"
      },
      "defaultValue": {
        "description": "初始路径。",
        "default": "[]"
      },
      "onChange": {
        "description": "返回路径键及节点。"
      },
      "allowClear": {
        "description": "显示清空操作。",
        "default": "true"
      },
      "changeOnSelect": {
        "description": "允许选择中间节点。",
        "default": "false"
      },
      "displayRender": {
        "description": "自定义已选路径展示。"
      },
      "emptyContent": {
        "description": "空选项提示。"
      },
      "placeholder": {
        "description": "无选择时提示。"
      }
    }
  },
  {
    "name": "Checkbox",
    "title": "复选框",
    "category": "表单与录入",
    "description": "表达独立的布尔选择或多选集合的一项，基于 Radix Checkbox。",
    "design": [
      "多项选择通过外部分组说明整体含义。",
      "部分全选使用 indeterminate 横线状态。"
    ],
    "restrictions": [
      "不管理业务选项集合；全选和父子联动由宿主维护。"
    ],
    "accessibility": [
      "使用 Label/htmlFor 或 aria-label 命名。",
      "支持 Space 切换并以 aria-checked=\"mixed\" 表达半选。"
    ],
    "interaction": "onCheckedChange 返回 true、false 或 indeterminate；受控 checked 由宿主回写。",
    "stateNotes": "支持未选、选中、半选和 disabled。",
    "propNotes": {
      "checked": {
        "description": "受控状态，可为 indeterminate。"
      },
      "defaultChecked": {
        "description": "初始状态，未传时内部为 false。",
        "default": "false"
      },
      "onCheckedChange": {
        "description": "Radix 选择变化回调。"
      },
      "disabled": {
        "description": "禁止选择。"
      },
      "name": {
        "description": "原生表单提交名称。"
      }
    }
  },
  {
    "name": "RadioGroup",
    "title": "单选组",
    "category": "表单与录入",
    "description": "在一组选项中选择一个值，基于 Radix RadioGroup。",
    "design": [
      "互斥选项使用同组，标签应清楚表达差别。"
    ],
    "restrictions": [
      "根组件不根据数据自动生成选项；显式组合 RadioGroupItem。"
    ],
    "accessibility": [
      "为组提供 aria-label 或 aria-labelledby，每个 Item 都需标签。",
      "方向键切换选项，禁用项由 Radix 跳过。"
    ],
    "interaction": "onValueChange 返回选项字符串；受控 value 需要更新。",
    "stateNotes": "支持选中、未选、根禁用和项禁用。",
    "propNotes": {
      "value": {
        "description": "组当前字符串值。"
      },
      "defaultValue": {
        "description": "非受控初始值。"
      },
      "onValueChange": {
        "description": "值变化请求。"
      },
      "orientation": {
        "description": "键盘和布局方向提示。"
      },
      "RadioGroupItem.value": {
        "description": "项的必填值。"
      },
      "RadioGroupItem.disabled": {
        "description": "单项禁用。"
      },
      "RadioGroupIndicator.forceMount": {
        "description": "公开 Radix 指示器的挂载选项；Item 已内置指示器。"
      }
    }
  },
  {
    "name": "Switch",
    "title": "开关",
    "category": "表单与录入",
    "description": "表达一个设置的开/关状态，适合立即生效的选项。",
    "design": [
      "标签描述设置名称，避免随开关状态反复改名。"
    ],
    "restrictions": [
      "不执行保存请求；保存失败时回滚或错误提示由宿主处理。"
    ],
    "accessibility": [
      "关联可见标签并保留 switch 角色。",
      "使用 Space 激活，checked 由辅助技术读为开启或关闭。"
    ],
    "interaction": "onCheckedChange 返回布尔值；受控 checked 必须由调用方更新。",
    "stateNotes": "支持开启、关闭和 disabled，不支持半选。",
    "propNotes": {
      "checked": {
        "description": "受控开关状态。"
      },
      "defaultChecked": {
        "description": "非受控初始状态。"
      },
      "onCheckedChange": {
        "description": "开关变化请求。"
      },
      "disabled": {
        "description": "禁止操作。"
      },
      "name": {
        "description": "表单提交字段名。"
      }
    }
  },
  {
    "name": "Slider",
    "title": "滑动输入",
    "category": "表单与录入",
    "description": "通过单滑块或双滑块在有限区间内选择数值。",
    "design": [
      "连续数值适合滑块；要求精确输入时配合 InputNumber。",
      "明确单位、范围及步长。"
    ],
    "restrictions": [
      "仅支持单数值或二元区间，不支持任意多个滑块。",
      "onValueCommit 继承 Radix 数组签名，与 onChange 的标量/元组签名不同。"
    ],
    "accessibility": [
      "为滑块提供名称；区间两端自动区分最小值与最大值。",
      "ARIA 显示真实单位，键盘支持方向键和 Home/End。"
    ],
    "interaction": "拖动或键盘触发 onChange/onValueChange；受控 value 回写后展示新值。",
    "stateNotes": "支持范围、disabled、loading；加载期间禁止操作。",
    "propNotes": {
      "value": {
        "description": "number 或 [number, number]。"
      },
      "defaultValue": {
        "description": "初始值；未传时单值为 min、区间为 [min,max]。"
      },
      "range": {
        "description": "启用双滑块；未传时从 value/defaultValue 数组推导。"
      },
      "min": {
        "description": "最小值。",
        "default": "0"
      },
      "max": {
        "description": "最大值。",
        "default": "100"
      },
      "step": {
        "description": "正数步长。",
        "default": "1"
      },
      "disabled": {
        "description": "禁止操作。",
        "default": "false"
      },
      "loading": {
        "description": "加载并禁止操作。",
        "default": "false"
      },
      "onChange": {
        "description": "返回实际数值或二元区间。"
      },
      "onValueChange": {
        "description": "与 onChange 相同的值签名。"
      },
      "onValueCommit": {
        "description": "完成交互时返回实际单位的 number[]。"
      },
      "name": {
        "description": "输出隐藏表单值，区间使用 name[]。"
      }
    }
  },
  {
    "name": "ColorPicker",
    "title": "颜色选择",
    "category": "表单与录入",
    "description": "在浮层中编辑六位十六进制颜色，明确区分草稿和已确认值。",
    "design": [
      "色块旁保留颜色文本，避免只凭色觉识别。",
      "使用确定/取消形成可预测的提交边界。"
    ],
    "restrictions": [
      "仅接受 #RRGGBB，不支持 alpha、渐变或命名颜色。",
      "无效已提交初值规范为 #000000；默认草稿参数仅用于验证示例。"
    ],
    "accessibility": [
      "文本错误使用 aria-invalid、描述关联与 alert。",
      "触发按钮通过描述文本表达必填和错误；编辑输入承担 aria-required/aria-invalid，Field 的标签和帮助信息会关联到控件。",
      "原生 type=color 的键盘和读屏体验取决于浏览器，仍需真实读屏验收；未提供二维色板的键盘交互。"
    ],
    "interaction": "输入和原生取色只更新草稿；确定才调用 onChange，取消/关闭丢弃草稿。受控 value 和 open 各自由父级回写。",
    "stateNotes": "支持加载、禁用、打开和非法草稿；非法或空草稿不能确定。",
    "propNotes": {
      "value": {
        "description": "受控六位颜色字符串。"
      },
      "defaultValue": {
        "description": "初始颜色；缺省或无效时归一化。",
        "default": "#000000"
      },
      "defaultDraftValue": {
        "description": "初始草稿，可用于展示非法输入。"
      },
      "open": {
        "description": "受控浮层状态。"
      },
      "defaultOpen": {
        "description": "初始打开状态。",
        "default": "false"
      },
      "disabled": {
        "description": "禁止打开和操作。",
        "default": "false"
      },
      "loading": {
        "description": "忙碌期间禁止操作。",
        "default": "false"
      },
      "onChange": {
        "description": "仅确定后返回大写颜色。"
      },
      "onOpenChange": {
        "description": "展开/关闭请求。"
      }
    }
  },
  {
    "name": "TagInput",
    "title": "标签输入",
    "category": "表单与录入",
    "description": "将用户提交的文本词条组织成可移除标签集合。",
    "design": [
      "提示用 Enter 添加；每个词条应简短可读。"
    ],
    "restrictions": [
      "不是原生多值表单字段，不提供 name/required 绑定。",
      "宿主从 onChange 收集值并执行词条校验；不支持逗号分词或自由下拉选项。"
    ],
    "accessibility": [
      "为文本输入提供标签，关闭按钮包含词条名称。",
      "移除标签时焦点回到输入；输入法组合期间不提交。"
    ],
    "interaction": "Enter 去除首尾空白后添加；空白和默认禁止的重复项不添加，关闭按钮移除词条。",
    "stateNotes": "支持 disabled、readOnly、最大数量与重复项选项；达上限仍可删除。",
    "propNotes": {
      "value": {
        "description": "受控标签数组。"
      },
      "defaultValue": {
        "description": "初始词条。",
        "default": "[]"
      },
      "allowDuplicates": {
        "description": "允许重复词条。",
        "default": "false"
      },
      "max": {
        "description": "词条数量上限。"
      },
      "onChange": {
        "description": "返回完整新词条数组。"
      }
    }
  },
  {
    "name": "Transfer",
    "title": "穿梭框",
    "category": "表单与录入",
    "description": "在源列表和目标列表之间批量移动选项，区分勾选与移动结果。",
    "design": [
      "两栏标题描述待选与已选集合。",
      "数据较多时显示搜索，并保留可理解的空匹配提示。"
    ],
    "restrictions": [
      "全量渲染，不提供虚拟滚动或请求。",
      "选项身份按原始值比较，复杂值保持稳定引用，选项 value 应唯一，复杂值的 React 键可通过 itemKey 指定。"
    ],
    "accessibility": [
      "两栏使用具名 group，复选框与方向按钮有名称。",
      "全选按钮能表达半选，操作不只依赖箭头图标。"
    ],
    "interaction": "先勾选再点击方向按钮移动；onChange 返回目标键、方向及本次移动键。搜索不会直接移动项目。",
    "stateNotes": "支持 loading、disabled、禁用项、空集合和搜索。",
    "propNotes": {
      "dataSource": {
        "description": "Option 数据源。"
      },
      "sourceItems": {
        "description": "数据源别名，存在时优先于 dataSource。"
      },
      "targetKeys": {
        "description": "受控目标值集合。"
      },
      "defaultTargetKeys": {
        "description": "初始目标集合。",
        "default": "[]"
      },
      "showSearch": {
        "description": "两栏显示搜索。",
        "default": "false"
      },
      "filterOption": {
        "description": "自定义搜索过滤。"
      },
      "itemKey": {
        "description": "自定义 React 渲染键。"
      },
      "disabled": {
        "description": "禁止选择/移动。",
        "default": "false"
      },
      "loading": {
        "description": "显示加载状态。",
        "default": "false"
      },
      "onChange": {
        "description": "目标键、left/right 方向、本次移动键。"
      },
      "onSearch": {
        "description": "查询文字和方向。"
      },
      "onSelectChange": {
        "description": "两侧临时勾选值变化。"
      },
      "titles": {
        "description": "左右标题，优先于 sourceTitle/targetTitle。"
      },
      "sourceTitle": {
        "description": "源列表标题。"
      },
      "targetTitle": {
        "description": "目标列表标题。"
      },
      "renderEmpty": {
        "description": "空集合内容。"
      }
    }
  },
  {
    "name": "Upload",
    "title": "文件上传",
    "category": "表单与录入",
    "description": "管理文件选择、校验、传输状态与移除，以注入的 customRequest 接入实际上传。",
    "design": [
      "说明文件类型、字节大小和数量限制。",
      "大投放区域使用 drag，普通附件用按钮。"
    ],
    "restrictions": [
      "没有默认网络请求；缺省 customRequest 时文件停留 pending。",
      "accept 是浏览器选择提示，拖放和服务端仍需校验类型；maxSize 单位为字节。",
      "服务端鉴权、存储地址及内容安全由接入方负责。",
      "maxSize 先于 beforeUpload 检查：超大文件被静默跳过，不调用 beforeUpload、onError，也不生成错误列表项；beforeUpload 返回 false 同样静默跳过。全部跳过时不触发 onChange。",
      "需要可见大小校验反馈时，可不设置内置 maxSize，改在 beforeUpload 中检查大小、显示提示并返回 false；服务端仍需校验。",
      "maxCount 在 beforeUpload 完成后截取列表，保留最新 N 项；超出数量的项不会开始传输，也不触发专门的超限错误回调。"
    ],
    "accessibility": [
      "按钮支持键盘选择文件；拖放是补充入口。",
      "自定义 children 在按钮内，避免嵌套交互元素并提供清楚名称。"
    ],
    "interaction": "先检查 maxSize，再为未被跳过的文件执行 beforeUpload；数量限制随后裁剪列表。customRequest 通过 handlers 报告进度/成功/失败，并响应 signal 取消。移除可由 onRemove=false 阻止。",
    "stateNotes": "支持 pending/uploading/done/error、禁用、拖放、多选；受控列表由 onChange 回写。",
    "propNotes": {
      "accept": {
        "description": "原生文件选择类型提示。"
      },
      "beforeUpload": {
        "description": "在 maxSize 检查通过后执行；false/Promise<false> 静默跳过，抛出或拒绝才触发 onError。"
      },
      "customRequest": {
        "description": "注入传输；resolve 不等于成功，需调用 onSuccess。"
      },
      "fileList": {
        "description": "受控文件列表。"
      },
      "defaultFileList": {
        "description": "初始文件列表。",
        "default": "[]"
      },
      "maxCount": {
        "description": "校验后保留最新 N 项，0 不保留；被裁掉的项不开始传输，无专门超限错误。"
      },
      "maxSize": {
        "description": "单文件最大字节数；超限先于 beforeUpload 静默跳过，不触发 onError。"
      },
      "multiple": {
        "description": "启用多选并追加列表。",
        "default": "false"
      },
      "drag": {
        "description": "启用拖放。",
        "default": "false"
      },
      "disabled": {
        "description": "禁止选择、拖放和移除。",
        "default": "false"
      },
      "showUploadList": {
        "description": "显示文件列表。",
        "default": "true"
      },
      "onChange": {
        "description": "列表变化，受控时需回写。"
      },
      "onError": {
        "description": "传输失败，或 beforeUpload/onRemove 抛出、拒绝的异常；不包含 maxSize 超限或 beforeUpload=false。"
      },
      "onProgress": {
        "description": "文件和归一化进度。"
      },
      "onSuccess": {
        "description": "传输成功的文件。"
      },
      "onPreview": {
        "description": "提供后文件名成为预览按钮。"
      },
      "onRemove": {
        "description": "异步移除确认，返回 false 阻止移除。"
      }
    }
  }
];
