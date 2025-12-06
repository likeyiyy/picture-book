# 使用 OpenRouter API 配置指南

## 什么是 OpenRouter？

OpenRouter 是一个统一的 AI 模型访问平台，可以让你通过一个 API Key 访问多个主流的 AI 模型，包括：
- Claude (Anthropic)
- GPT 系列 (OpenAI)
- Gemini (Google)
- Llama 系列 (Meta)
- 以及更多其他模型

## 配置步骤

### 1. 注册 OpenRouter 账号

1. 访问 [OpenRouter 官网](https://openrouter.ai/)
2. 点击 "Sign up" 注册账号
3. 验证邮箱并完成注册

### 2. 获取 API Key

1. 登录后，点击右上角的用户名
2. 选择 "API Keys"
3. 点击 "Create new key"
4. 给 API Key 命名（例如：Picture Book App）
5. 复制生成的 API Key

### 3. 配置环境变量

在项目根目录的 `.env.local` 文件中，将 `OPENROUTER_API_KEY` 替换为你的实际 API Key：

```env
OPENROUTER_API_KEY=sk-or-v1-你的实际api-key-here
```

### 4. 选择模型

在应用中，你现在可以选择以下模型：

#### OpenRouter 模型（推荐）
- **Claude 3.5 Sonnet** - 最适合创作，语言流畅自然
- **GPT-4 Turbo** - OpenAI 最强大的模型
- **GPT-3.5 Turbo** - 速度快，成本低
- **Gemini Pro** - Google 的先进模型
- **Llama 3 70B** - Meta 的开源模型

#### DeepSeek 模型（备选）
- **DeepSeek Chat** - 专为中文优化
- **DeepSeek Coder** - 编程专用（不推荐用于绘本）

## 使用建议

1. **首次使用**：建议选择 "Claude 3.5 Sonnet"，它在创作儿童故事方面表现最佳
2. **成本考虑**：如果担心费用，可以选择 "GPT-3.5 Turbo"
3. **中文内容**：如果你的故事主要是中文，DeepSeek Chat 是不错的选择

## 费用说明

- OpenRouter 采用按量付费模式
- 不同模型价格不同，详情请查看 [OpenRouter 定价页面](https://openrouter.ai/pricing)
- 大多数模型生成一个绘本故事的成本在 $0.01 - $0.05 之间

## 注意事项

1. 不要在代码中直接写入 API Key
2. 定期检查 API 使用量，避免意外产生高额费用
3. 可以设置使用限额来控制成本

## 故障排除

### 问题：生成失败
- 检查 API Key 是否正确配置
- 确认账户有足够的余额
- 查看控制台错误信息

### 问题：模型响应慢
- 尝试切换到其他模型
- 检查网络连接

### 问题：API Key 无效
- 确认没有多余的空格
- 尝试生成新的 API Key

现在你可以在应用中选择并使用任何 OpenRouter 支持的模型了！