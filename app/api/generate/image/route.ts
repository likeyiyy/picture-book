import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GenerateImageRequest, ApiResponse } from '@/types';

const WANXIANG_API_KEY = process.env.WANXIANG_API_KEY;
// 使用通义万相2.5文生图API
const WANXIANG_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    let imageUrl: string | null = null;

    // 调用阿里云通义万相 API 生成图片（使用 wan2.2-t2i-flash 模型）
    const response = await axios.post(
      WANXIANG_API_URL,
      {
        model: 'wan2.2-t2i-flash',
        input: {
          prompt: body.prompt,
        },
        parameters: {
          size: '910*512', // 16:9 aspect ratio (910/512 ≈ 16:9), height = 512 (minimum)
          n: 1,
          watermark: false,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${WANXIANG_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
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
          imageUrl = resultResponse.data.output.results[0].url;
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
      // 同步模式，直接返回结果
      let imageUrl = response.data.output.results[0].url;
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