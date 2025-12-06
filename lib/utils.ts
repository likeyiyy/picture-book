import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateStoryPrompt(params: {
  theme: string;
  ageGroup: string;
  pageCount: number;
  mainCharacter: string;
  setting: string;
  moral: string;
}): string {
  const { theme, ageGroup, pageCount, mainCharacter, setting, moral } = params;

  return `请生成一个适合${ageGroup}岁儿童的绘本故事，主题是"${theme}"。

要求：
1. 主角：${mainCharacter}
2. 故事背景：${setting}
3. 页数：${pageCount}页
4. 寓意：${moral}
5. 语言：简单易懂，符合儿童认知水平
6. 结构：每页一段文字，不超过50字

请按照以下JSON格式返回：
{
  "title": "故事标题",
  "pages": [
    {
      "pageNumber": 1,
      "text": "第一页的文字内容",
      "imagePrompt": "用于生成插图的提示词，描述这一页的画面"
    },
    ...
  ]
}`;
}

export function generateImagePrompt(pageText: string, artStyle: string, character: string): string {
  const styleMap = {
    cartoon: '卡通风格，色彩鲜艳，线条简单',
    watercolor: '水彩画风格，柔和色彩，艺术感强',
    flat: '扁平化插画风格，简洁现代',
    realistic: '写实风格，细节丰富',
    chinese: '中国风插画，传统元素'
  };

  return `儿童绘本插画，${styleMap[artStyle as keyof typeof styleMap]}，
主题：${pageText}，
主角：${character}，
画面要求：温馨可爱，适合儿童，色彩明亮，构图简洁，
角色居中，背景简洁，无文字，高质量插画`;
}