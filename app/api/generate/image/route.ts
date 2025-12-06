import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GenerateImageRequest, ApiResponse } from '@/types';
import { downloadAndSaveImage } from '@/lib/image-storage';

const WANXIANG_API_KEY = process.env.WANXIANG_API_KEY;
// 使用通义万相2.5文生图API
const WANXIANG_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

// 构建增强的提示词，包含完整故事上下文
function buildEnhancedPrompt(body: GenerateImageRequest): string {
  // 如果没有故事上下文，使用原来的提示词
  if (!body.storyContext || !body.currentPage) {
    return `迪士尼经典手绘动画风格，${body.prompt}。
角色造型：圆润柔和的线条勾勒，五官灵动细腻，大而亮的圆眼睛，粉扑扑的腮红，肢体姿态带有自然情绪感。
色彩调性：温润低饱和色调，整体色彩柔和协调，避免刺眼的高饱和色块。
场景与光影：层次丰富的叙事性背景，林间斑驳的柔光氛围，手绘纹理细节，动画电影式的故事感。`;
  }

  // 构建故事概要
  const storySummary = `这是绘本《${body.storyContext.title}》的第${body.currentPage}/${body.totalPages}页插图。
故事概要：${body.storyContext.pages.map(p => p.text).join('。')}`;

  // 提取角色信息（从所有页面的描述中）
  const extractCharacterInfo = () => {
    const allPrompts = body.storyContext!.pages.map(p => p.imagePrompt || '').join(' ');
    // 简单的角色特征提取逻辑
    const features = [];
    if (allPrompts.includes('小猩猩')) features.push('主角是小猩猩，棕色毛发');
    if (allPrompts.includes('小明')) features.push('主角是小男孩');
    if (allPrompts.includes('小红')) features.push('主角是小女孩');
    return features.join('，');
  };

  // 获取前一页和后一页的上下文
  const getAdjacentPages = () => {
    const prevPage = body.storyContext!.pages[body.currentPage! - 2];
    const nextPage = body.storyContext!.pages[body.currentPage!];
    let context = '';
    if (prevPage) context += `前一页：${prevPage.text}。`;
    if (nextPage) context += `后一页：${nextPage.text}。`;
    return context;
  };

  const characterInfo = extractCharacterInfo();
  const adjacentContext = getAdjacentPages();

  // 构建完整的增强提示词
  return `${storySummary}
${characterInfo ? `角色特征：${characterInfo}。` : ''}
${adjacentContext}
当前页面描述：${body.prompt}

风格要求：迪士尼经典手绘动画风格，高品质儿童绘本插画。
角色造型：圆润柔和的线条勾勒，五官灵动细腻，大而亮的圆眼睛，粉扑扑的腮红，肢体姿态带有自然情绪感，避免模板化卡通形象。
色彩调性：温润低饱和色调，整体色彩柔和协调，角色与背景色彩过渡自然，避免刺眼的高饱和色块。
场景与光影：层次丰富的叙事性自然背景，林间斑驳的柔光氛围，背景元素带有手绘纹理细节，营造动画电影式的故事感。
整体质感：精致的手绘动画质感，确保角色在整个绘本中保持一致性，包括外貌、服装和颜色。`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    let imageUrl: string | null = null;

    // 构建增强的提示词，包含完整故事上下文
    const enhancedPrompt = buildEnhancedPrompt(body);

    // 调试：打印增强的提示词
    console.log('\n=== Enhanced Image Prompt ===');
    console.log(`Page ${body.currentPage}/${body.totalPages}`);
    console.log('Prompt length:', enhancedPrompt.length, 'characters');
    console.log('Prompt:', enhancedPrompt);
    console.log('=== End Enhanced Prompt ===\n');

    // 调用阿里云通义万相 API 生成图片（使用 wan2.5-t2i-preview 最强模型）
    const response = await axios.post(
      WANXIANG_API_URL,
      {
        model: 'wan2.5-t2i-preview',
        input: {
          prompt: enhancedPrompt,
        },
        parameters: {
          size: '1440*810', // 16:9 aspect ratio, max pixels for best quality
          n: 1,
          watermark: false,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${WANXIANG_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable', // wan2.2-t2i-flash也需要异步模式
        },
      }
    );

    // 检查响应
    if (response.data.output?.task_id) {
      // 异步模式，需要轮询获取结果
      const taskId = response.data.output.task_id;
      let attempts = 0;
      const maxAttempts = 30;

      while (!imageUrl && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒

        const resultResponse = await axios.get(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${WANXIANG_API_KEY}`,
            },
          }
        );

        const taskStatus = resultResponse.data.output?.task_status;

        if (taskStatus === 'SUCCEEDED') {
          const remoteImageUrl = resultResponse.data.output.results[0].url;
          // 下载图片到本地
          imageUrl = await downloadAndSaveImage(remoteImageUrl);
          break;
        } else if (taskStatus === 'FAILED') {
          console.error('Task failed:', resultResponse.data);
          throw new Error('Image generation failed');
        }

        attempts++;
      }

      if (!imageUrl) {
        throw new Error('Image generation timeout');
      }
    } else if (response.data.output?.results?.[0]?.url) {
      // 同步模式，下载图片到本地
      const remoteImageUrl = response.data.output.results[0].url;
      imageUrl = await downloadAndSaveImage(remoteImageUrl);
    } else {
      throw new Error('Unexpected response format');
    }

    // 返回成功响应
    const apiResponse: ApiResponse<{ url: string }> = {
      success: true,
      data: { url: imageUrl },
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Error generating image:', error);

    // 如果是 API 错误，返回详细信息
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Error:', error.response.data);
    }

    const apiResponse: ApiResponse<null> = {
      success: false,
      error: '生成图片失败，请稍后重试',
    };

    return NextResponse.json(apiResponse, { status: 500 });
  }
}