import axios from 'axios';

// OpenRouter API 配置
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';

// 使用固定的 DeepSeek v3.2 模型
const DEEPSEEK_MODEL = 'deepseek/deepseek-v3.2';

export async function callLLM(prompt: string) {
  // 如果没有配置 API Key，返回模拟数据用于测试
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    console.log('No API key configured, returning mock data for testing');
    return getMockResponse(prompt);
  }

  try {
    const response = await axios.post(
      `${OPENROUTER_API_URL}/chat/completions`,
      {
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的儿童绘本作家，擅长创作适合不同年龄段儿童的有趣故事。请严格按照要求的JSON格式返回内容。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Picture Book Generator',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    if (axios.isAxiosError(error)) {
      const errorDetail = error.response?.data?.error || error.message;
      throw new Error(`Failed to generate story: ${errorDetail}`);
    }
    throw new Error('Failed to generate story. Please try again.');
  }
}

// 模拟响应函数，用于测试
function getMockResponse(prompt: string): string {
  // 根据提示词生成不同的模拟故事
  if (prompt.includes('小猩猩')) {
    return JSON.stringify({
      title: '小猩猩找抱抱',
      pages: [
        {
          pageNumber: 1,
          text: '清晨的阳光透过树叶洒进森林，小猩猩宝宝揉了揉眼睛醒来。',
          imagePrompt: '晨光中的森林，小猩猩在树洞里醒来，阳光斑驳'
        },
        {
          pageNumber: 2,
          text: '他发现妈妈不在身边，有点害怕地叫了起来："妈妈！妈妈！"',
          imagePrompt: '小猩猩焦急地四处张望，森林里安静祥和'
        },
        {
          pageNumber: 3,
          text: '小猴子跑过来问："怎么了？"小猩猩说："我找不到妈妈了。"',
          imagePrompt: '小猴子关切地看着小猩猩，两个小动物在交流'
        },
        {
          pageNumber: 4,
          text: '小猴子带着小猩猩找到了正在采果子的猩猩妈妈。',
          imagePrompt: '猩猩妈妈微笑着张开双臂，小猩猩高兴地跑向妈妈'
        },
        {
          pageNumber: 5,
          text: '"妈妈！"小猩猩扑进妈妈怀里，得到了一个温暖的拥抱。',
          imagePrompt: '猩猩妈妈紧紧抱着小猩猩，充满爱意和温暖'
        }
      ]
    });
  } else if (prompt.includes('友谊') || prompt.includes('分享')) {
    return JSON.stringify({
      title: '分享的快乐',
      pages: [
        {
          pageNumber: 1,
          text: '小明有很多好吃的饼干，他一个人开心地吃着。',
          imagePrompt: '小明坐在草地上，面前有一大包饼干'
        },
        {
          pageNumber: 2,
          text: '小红走过来说："我也想吃饼干。"小明摇了摇头。',
          imagePrompt: '小红羡慕地看着小明，小明护着饼干'
        },
        {
          pageNumber: 3,
          text: '妈妈说："好孩子要学会分享，分享会让快乐加倍。"',
          imagePrompt: '妈妈温柔地对小明说话，小明认真听着'
        },
        {
          pageNumber: 4,
          text: '小明把饼干分给小红，两个人一起吃，笑得很开心。',
          imagePrompt: '小明和小红一起分享饼干，两人都在微笑'
        },
        {
          pageNumber: 5,
          text: '从此，小明学会了分享，交到了更多好朋友。',
          imagePrompt: '小明和一群小朋友一起玩耍，快乐地分享'
        }
      ]
    });
  } else {
    // 默认故事
    return JSON.stringify({
      title: '神奇的冒险',
      pages: [
        {
          pageNumber: 1,
          text: '在一个阳光明媚的早晨，小兔子开始了他的冒险之旅。',
          imagePrompt: '小兔子站在山顶，眺望远方的冒险'
        },
        {
          pageNumber: 2,
          text: '路上，他遇到了需要帮助的小松鼠。',
          imagePrompt: '小松鼠在树下发愁，小兔子友好地询问'
        },
        {
          pageNumber: 3,
          text: '小兔子帮助小松鼠找到了丢失的坚果。',
          imagePrompt: '小兔子和小松鼠一起在草丛里寻找'
        },
        {
          pageNumber: 4,
          text: '为了感谢，小松鼠带小兔子看到了美丽的彩虹。',
          imagePrompt: '天空中出现彩虹，小兔子和小松鼠惊喜地看着'
        },
        {
          pageNumber: 5,
          text: '他们成为了最好的朋友，一起回家的路上笑声不断。',
          imagePrompt: '小兔子和小松鼠手拉手走在夕阳下'
        }
      ]
    });
  }
}