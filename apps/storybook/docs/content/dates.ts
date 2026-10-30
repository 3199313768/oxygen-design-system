import type { ComponentDoc } from '../types';

export const datesDocs: ComponentDoc[] = [
  {
    "name": "Calendar",
    "title": "日历",
    "category": "日期时间",
    "description": "以内联日期网格选择一个本地日历日期，基于 react-day-picker。",
    "design": [
      "直接选择日期适合 Calendar；紧凑单字段可用原生 DatePicker。"
    ],
    "restrictions": [
      "Date 使用 new Date(year, monthIndex, day)，不要将 UTC 日期字符串当本地日期。",
      "不暴露 timeZone；日期到服务端的序列化由宿主制定。"
    ],
    "accessibility": [
      "DayPicker 提供日期网格、方向键与日期名称。",
      "locale 优先于 Provider，labels 可覆盖名称并保留选中/今天提示。"
    ],
    "interaction": "点击或键盘选择调用 onChange；受控 value 包括显式 undefined 由父级管理。",
    "stateNotes": "支持禁用日期、月份导航和选中态；不具备 loading 或区间模式。",
    "propNotes": {
      "value": {
        "description": "受控本地 Date。"
      },
      "defaultValue": {
        "description": "初始本地 Date。"
      },
      "onChange": {
        "description": "选中 Date 或取消选择的 undefined。"
      },
      "selected": {
        "description": "兼容旧值参数，建议 value。"
      },
      "defaultSelected": {
        "description": "兼容旧初始参数，建议 defaultValue。"
      },
      "onSelect": {
        "description": "兼容旧回调，建议 onChange；同时传入会同时调用。"
      },
      "locale": {
        "description": "日期语言；组件参数优先，其次 Provider。",
        "default": "zhCN（未配置时）"
      },
      "labels": {
        "description": "合并覆盖 DayPicker 辅助名称。"
      },
      "disabled": {
        "description": "DayPicker 禁用匹配条件。"
      }
    }
  },
  {
    "name": "DatePicker",
    "title": "日期输入",
    "category": "日期时间",
    "description": "包装原生 input type=date，使用日期字符串表达单日值。",
    "design": [
      "需要紧凑日期字段时使用；内联月历使用 Calendar。"
    ],
    "restrictions": [
      "浏览器决定日期面板外观和显示格式。",
      "值为 YYYY-MM-DD 或空字符串，不携带时间/时区，不自动转换 Date。"
    ],
    "accessibility": [
      "提供 Label/Field 标签和错误提示。",
      "保留原生日期控件键盘行为，跨浏览器需验证。"
    ],
    "interaction": "onChange 直接返回输入的日期字符串；受控值需回写。",
    "stateNotes": "支持原生 disabled、readOnly、min、max 和 required。",
    "propNotes": {
      "value": {
        "description": "受控 YYYY-MM-DD 字符串。"
      },
      "defaultValue": {
        "description": "初始日期字符串。"
      },
      "onChange": {
        "description": "返回字符串，清空为 \"\"。"
      },
      "min": {
        "description": "原生最早日期字符串。"
      },
      "max": {
        "description": "原生最晚日期字符串。"
      }
    }
  },
  {
    "name": "DateRangePicker",
    "title": "日期范围",
    "category": "日期时间",
    "description": "以内联日历选择开始日和结束日，支持本地日期预设和清除。",
    "design": [
      "用预设缩短常见范围选择；明确最小/最大日差规则。"
    ],
    "restrictions": [
      "值为两个本地 Date，不是时间戳区间；不暴露时区转换。",
      "min/max 使用日历日差；宿主负责查询边界是否包含末日。"
    ],
    "accessibility": [
      "继承 DayPicker 网格键盘交互与 locale/labels。",
      "预设和清除为原生按钮，禁用范围预设不可激活。"
    ],
    "interaction": "首个端点只保留草稿，两个端点完整后才 onChange；完成后下一次选择开始新范围。受控清空仅请求 undefined。",
    "stateNotes": "允许同一天范围（未设置更高 min 时）；默认阻止跨禁用日，受控外部更新重置草稿。",
    "propNotes": {
      "value": {
        "description": "受控 [Date,Date] 本地日期。"
      },
      "defaultValue": {
        "description": "初始完整范围。"
      },
      "onChange": {
        "description": "仅完整范围或清除时的 undefined。"
      },
      "allowClear": {
        "description": "显示清除按钮。",
        "default": "true"
      },
      "excludeDisabled": {
        "description": "阻止跨越禁用日期。",
        "default": "true"
      },
      "min": {
        "description": "最小端点日差。"
      },
      "max": {
        "description": "最大端点日差；0 不设上限。"
      },
      "presets": {
        "description": "label/value 预设；自动规范为本地零点并检查有效性。",
        "default": "[]"
      },
      "disabled": {
        "description": "禁用匹配规则；true 同时禁用所有操作。"
      }
    }
  },
  {
    "name": "TimePicker",
    "title": "时间输入",
    "category": "日期时间",
    "description": "包装原生 input type=time，录入不含日期的本地墙钟时间。",
    "design": [
      "小时/分钟粒度与业务需求一致；秒粒度通过原生 step 配置。"
    ],
    "restrictions": [
      "原生面板受浏览器和系统影响。",
      "值不包含日期或时区；跨日与时区换算由宿主实现。"
    ],
    "accessibility": [
      "使用可见标签描述时间用途；保留原生键盘操作。"
    ],
    "interaction": "onChange 返回时间字符串，受控 value 由调用方更新。",
    "stateNotes": "支持 disabled、readOnly、required 和 min/max/step。",
    "propNotes": {
      "value": {
        "description": "受控 HH:mm 字符串，秒粒度时可含秒。"
      },
      "defaultValue": {
        "description": "初始时间字符串。"
      },
      "onChange": {
        "description": "直接返回字符串，清空为 \"\"。"
      },
      "step": {
        "description": "原生步长，单位为秒。"
      },
      "min": {
        "description": "原生最早时间。"
      },
      "max": {
        "description": "原生最晚时间。"
      }
    }
  }
];
