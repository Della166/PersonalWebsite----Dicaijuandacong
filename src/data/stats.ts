/**
 * 成就数字条数据。
 *
 * ⚠️ 占位数字 —— 以下 value 均为示例占位值，请替换为真实数据后再上线。
 */
export interface Stat {
  /** 占位数字，待替换 */
  value: number;
  /** 数字后缀，如 "+" / "%" */
  suffix?: string;
  label: string;
  label_en: string;
}

export const stats: Stat[] = [
  { value: 20, suffix: '+', label: '开源项目', label_en: 'Projects' },
  { value: 3, suffix: '+', label: '年开发经验', label_en: 'Years Coding' },
  { value: 100, suffix: '+', label: 'GitHub Stars', label_en: 'GitHub Stars' },
  { value: 30, suffix: '+', label: '技术文章', label_en: 'Articles' },
];
