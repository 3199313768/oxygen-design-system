import type { ComponentDoc } from '../types';

export const otherDocs: ComponentDoc[] = [
  {
    "name": "QRCode",
    "title": "二维码",
    "category": "其他",
    "description": "将非空字符串编码成 SVG 二维码，底层使用 qrcode.react。",
    "design": [
      "确保前景背景对比度和扫描留白，尺寸适合实际扫描距离。"
    ],
    "restrictions": [
      "不请求短链接、不校验目标地址，不跟踪扫码。",
      "复杂长内容或低对比度需实际设备扫描验证。"
    ],
    "accessibility": [
      "非空二维码 role=img，label 提供用途名称。",
      "同时提供可点击链接或文本替代，避免只能通过扫码获取内容。"
    ],
    "interaction": "随 value 变化重新编码；二维码本身没有点击行为。",
    "stateNotes": "空白 value 显示 error 或本地化空态，使用 alert。",
    "propNotes": {
      "value": {
        "description": "编码内容；空白字符串进入错误占位。"
      },
      "size": {
        "description": "SVG 尺寸，继承 qrcode.react 默认。"
      },
      "fgColor": {
        "description": "前景色，继承底层默认。"
      },
      "bgColor": {
        "description": "背景色，继承底层默认。"
      },
      "includeMargin": {
        "description": "是否保留静区，继承底层默认。"
      },
      "label": {
        "description": "二维码用途名称，可由 aria-label 覆盖。"
      },
      "error": {
        "description": "空值时显示的内容。"
      }
    }
  }
];
