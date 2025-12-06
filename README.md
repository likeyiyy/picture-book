# AI 绘本生成器 📚

<div align="center">
  <h3>用 AI 创造独一无二的儿童绘本</h3>
  <p>通过简单的对话，为孩子创作专属的绘本故事</p>
  <br>
  <img src="https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/DeepSeek-v3.2-purple?style=flat-square" alt="DeepSeek v3.2">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</div>

## ✨ 特色功能

- 🎨 **自然对话创作** - 像聊天一样描述故事，AI 智能理解并创作
- 📖 **实时预览生成** - 右侧大屏实时显示绘本创作进度
- 🤖 **AI 智能解析** - 自动识别故事元素，智能设置参数
- 🔄 **流式生成体验** - 逐页显示，流畅自然
- 📱 **响应式设计** - 完美适配各种设备

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/likeyiyy/picture-book.git
   cd picture-book
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.local.example .env.local
   ```

   在 `.env.local` 中配置你的 API Keys：
   ```env
   # OpenRouter API Key (必需)
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # 阿里云通义万相 API Key (可选，用于生成图片)
   WANXIANG_API_KEY=your_wanxiang_api_key_here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**

   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🎯 使用指南

### 创作你的第一个绘本

1. **首页输入故事想法**
   - 直接输入： "一个小猩猩醒来，在森林里找妈妈要抱抱的故事"
   - 或点击灵感示例卡片

2. **进入创作界面**
   - 自动切换到 2:8 分屏布局
   - 左侧：对话交互区（20%）
   - 右侧：绘本预览区（80%）

3. **实时查看生成**
   - AI 智能解析你的输入
   - 逐页生成故事内容
   - 实时预览每页文字和插画描述

### 使用技巧

- **保持简洁** - 用自然语言简单描述即可
- **包含关键元素** - 提及主角、场景、情感等
- **支持修改** - 生成后可继续对话调整内容

## 🛠 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **动画效果**: Framer Motion
- **AI 模型**: DeepSeek v3.2 (通过 OpenRouter)
- **实时通信**: Server-Sent Events (SSE)
- **图片生成**: 阿里云通义万相

## 📁 项目结构

```
picture-book/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── chat/          # 聊天流式 API
│   │   └── generate/      # AI 生成 API
│   ├── globals.css        # 全局样式
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ChatInterface.tsx  # 聊天界面组件
│   ├── HomeChat.tsx       # 首页聊天入口
│   └── BookPreview.tsx    # 绘本预览组件
├── docs/                  # 文档
│   ├── USER_STORIES.md    # 用户故事
│   └── CHAT_INTERFACE_GUIDE.md  # 使用指南
└── lib/                   # 工具函数
    ├── llm-client.ts      # AI 调用客户端
    └── utils.ts           # 通用工具
```

## 🔧 API 配置

### OpenRouter

1. 访问 [OpenRouter](https://openrouter.ai) 注册账号
2. 获取 API Key
3. 配置到 `OPENROUTER_API_KEY` 环境变量

### 通义万相（可选）

用于生成故事插画：

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 开通通义万相服务
3. 配置到 `WANXIANG_API_KEY` 环境变量

## 🌟 功能亮点

- **智能解析**: 自动识别年龄段、角色、场景等
- **实时反馈**: 流式生成，立即看到结果
- **优雅动画**: 流畅的页面过渡和加载效果
- **对话管理**: 完整保留对话历史
- **响应式**: 适配桌面、平板、手机

## 📚 相关文档

- [用户故事文档](./docs/USER_STORIES.md) - 详细的功能需求和设计思路
- [使用指南](./docs/CHAT_INTERFACE_GUIDE.md) - 界面介绍和使用技巧
- [OpenRouter 配置指南](./OPENROUTER_SETUP.md) - API Key 获取和配置

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [DeepSeek](https://www.deepseek.com/) - 优秀的 AI 模型
- [OpenRouter](https://openrouter.ai/) - 统一的 AI 模型访问平台
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 流畅的动画库

---

<div align="center">
  <p>用 AI 为孩子编织美好的故事 ✨</p>
  <p>Made with ❤️ for little readers</p>
</div>