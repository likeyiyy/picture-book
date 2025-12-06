import { NextRequest, NextResponse } from 'next/server';
import { GenerateBookRequest, ApiResponse } from '@/types';
import { generateStoryPrompt } from '@/lib/utils';
import { callLLM } from '@/lib/llm-client';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateBookRequest = await request.json();

    // 生成故事提示词
    const prompt = generateStoryPrompt({
      theme: body.theme,
      ageGroup: body.ageGroup,
      pageCount: body.pageCount,
      mainCharacter: body.mainCharacter,
      setting: body.setting,
      moral: body.moral,
    });

    // 调用 LLM 生成故事（使用 DeepSeek v3.2）
    const content = await callLLM(prompt);

    // 尝试解析 JSON 响应
    let storyData;
    try {
      // 提取 JSON 部分（如果 AI 返回了额外的文本）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        storyData = JSON.parse(jsonMatch[0]);
      } else {
        storyData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // 如果解析失败，返回一个默认的故事结构
      storyData = {
        title: `${body.theme}的故事`,
        pages: Array.from({ length: body.pageCount }, (_, i) => ({
          pageNumber: i + 1,
          text: `这是第${i + 1}页的内容，关于${body.theme}的故事`,
          imagePrompt: generateImagePrompt(
            `${body.mainCharacter}在${body.setting}中经历关于${body.theme}的故事`,
            body.artStyle,
            body.mainCharacter
          ),
        })),
      };
    }

    // 为每一页生成图片提示词
    storyData.pages = storyData.pages.map((page: any) => ({
      ...page,
      imagePrompt: page.imagePrompt || generateImagePrompt(
        page.text,
        body.artStyle,
        body.mainCharacter
      ),
    }));

    // 返回成功响应
    const apiResponse: ApiResponse<typeof storyData> = {
      success: true,
      data: storyData,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Error generating story:', error);

    const apiResponse: ApiResponse<null> = {
      success: false,
      error: '生成故事失败，请稍后重试',
    };

    return NextResponse.json(apiResponse, { status: 500 });
  }
}