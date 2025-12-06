import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateStoryPrompt(params: {
  theme: string;
  ageGroup: string;
  mainCharacter: string;
  setting: string;
  moral: string;
  pageCount?: number;  // 添加可选的 pageCount
}): string {
  const { theme, ageGroup, mainCharacter, setting, moral, pageCount } = params;

  return `请生成一个适合${ageGroup}岁儿童的绘本故事，主题是"${theme}"。

要求：
1. 主角：${mainCharacter}
2. 故事背景：${setting}
3. 页数：${pageCount ? `固定${pageCount}页` : '根据故事内容自然决定，建议3-10页之间'}，确保故事完整且节奏合适
4. 寓意：${moral}
5. 语言：简单易懂，符合儿童认知水平
6. 结构：每页一段文字，不超过50字
7. 画面描述：生动具体，适合生成插图

请生成一个包含标题和页面数组的故事。每个页面需要包含页码（从1开始）、文字内容和画面描述。`;
}

