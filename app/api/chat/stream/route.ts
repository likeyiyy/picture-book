import { NextRequest } from 'next/server';
import { generateStoryStructured } from '@/lib/llm-client';
import { generateStoryPrompt } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');

  if (!message) {
    return new Response('Message is required', { status: 400 });
  }

  // 创建一个可读流
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 发送初始响应
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'message',
          content: '收到你的想法，让我为你创作一个精彩的绘本故事...\n'
        })}\n\n`));

        // 判断是否是新故事
        const isCreatingNewStory = !message.includes('修改') && !message.includes('调整') && !message.includes('更改');

        if (isCreatingNewStory) {
          // 解析用户输入
          const bookParams = parseUserInput(message);

          // 发送确认信息
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'message',
            content: `📝 正在创作"${bookParams.theme || '原创'}"绘本故事...\n`
          })}\n\n`));

          // 开始生成绘本
          await generateBookStream(controller, encoder, bookParams);
        } else {
          // 处理修改请求
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'message',
            content: '💡 我理解你想要修改内容。请告诉我具体需要调整的部分。\n'
          })}\n\n`));

          // 发送完成信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete'
          })}\n\n`));
        }
      } catch (error) {
        console.error('Error in stream:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: '生成失败，请稍后重试'
        })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function parseUserInput(message: string): any {
  // 简单解析用户输入
  const params: any = {
    theme: message,
    ageGroup: '4-6', // 默认值
    artStyle: 'cartoon', // 默认值
    mainCharacter: '主角',
    setting: '森林',
    moral: '温馨的故事'
  };

  // 尝试提取年龄段
  if (message.includes('岁')) {
    const ageMatch = message.match(/(\d+)岁/);
    if (ageMatch) {
      const age = parseInt(ageMatch[1]);
      if (age <= 4) params.ageGroup = '2-4';
      else if (age <= 6) params.ageGroup = '4-6';
      else params.ageGroup = '6-8';
    }
  }

  // 尝试提取角色
  if (message.includes('小猩猩')) {
    params.mainCharacter = '小猩猩';
    params.setting = '森林';
  } else if (message.includes('小兔子')) {
    params.mainCharacter = '小兔子';
  } else if (message.includes('小明')) {
    params.mainCharacter = '小明';
    params.setting = '学校';
  }

  return params;
}

async function generateBookStream(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  params: any
) {
  // 生成提示词
  const prompt = generateStoryPrompt(params);

  // 更新生成状态
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: 'book_update',
    data: {
      generating: true,
      currentPage: 0
    }
  })}\n\n`));

  // 调用 LLM 生成故事
  try {
    // 直接使用 structured output 获取结构化数据
    const storyData = await generateStoryStructured(prompt);

    // 逐页发送更新
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'book_update',
      data: {
        title: storyData.title,
        generating: true
      }
    })}\n\n`));

    // 模拟逐页生成效果
    for (let i = 0; i < storyData.pages.length; i++) {
      const page = storyData.pages[i];

      // 更新当前页
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'book_update',
        data: {
          currentPage: i + 1,
          pages: storyData.pages.slice(0, i + 1)
        }
      })}\n\n`));

      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 发送完成消息
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'message',
      content: `\n✅ 绘本《${storyData.title}》已完成！共 ${storyData.pages.length} 页。\n\n你可以继续对话来修改故事，或开始创作新的绘本。\n`
    })}\n\n`));

    // 最终更新
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'book_update',
      data: {
        title: storyData.title,
        pages: storyData.pages,
        generating: false
      }
    })}\n\n`));
  } catch (error) {
    throw error;
  }

  // 发送完成信号
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: 'complete'
  })}\n\n`));
}