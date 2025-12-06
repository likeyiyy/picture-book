import axios from 'axios';

// OpenRouter API 配置
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';

// 使用固定的 DeepSeek v3.2 模型
const DEEPSEEK_MODEL = 'deepseek/deepseek-v3.2';

export async function callLLM(prompt: string) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env.local');
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