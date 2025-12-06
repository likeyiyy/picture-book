import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GenerateImageRequest, ApiResponse } from '@/types';

const WANXIANG_API_KEY = process.env.WANXIANG_API_KEY;
const WANXIANG_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();

    // 调用阿里云通义万相 API 生成图片
    const response = await axios.post(
      WANXIANG_API_URL,
      {
        model: 'wanx-v1',
        input: {
          prompt: body.prompt,
        },
        parameters: {
          size: body.size === 'square' ? '1024*1024' :
                body.size === 'landscape' ? '1024*576' :
                '720*1280',
          n: 1,
          seed: Math.floor(Math.random() * 1000000),
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${WANXIANG_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable', // 启用异步模式
        },
      }
    );

    // 获取任务 ID
    const taskId = response.data.output.task_id;

    if (!taskId) {
      throw new Error('Failed to get task ID');
    }

    // 轮询获取结果
    let imageUrl = null;
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

      const taskStatus = resultResponse.data.output.task_status;

      if (taskStatus === 'SUCCEEDED') {
        imageUrl = resultResponse.data.output.results[0].url;
        break;
      } else if (taskStatus === 'FAILED') {
        throw new Error('Image generation failed');
      }

      attempts++;
    }

    if (!imageUrl) {
      throw new Error('Image generation timeout');
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