# AI 绘本生成器 - 使用说明

## 项目简介

这是一个基于 Next.js 构建的 AI 绘本生成应用，可以：
- 根据用户输入的主题自动生成儿童故事
- 为故事生成配套的插画
- 提供交互式的绘本阅读体验
- 支持导出和分享功能

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **表单处理**: React Hook Form + Zod
- **动画效果**: Framer Motion
- **AI 集成**: DeepSeek API (文本生成) + 阿里云通义万相 (图片生成)
- **图片处理**: Sharp.js

## 环境配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local` 文件并填入你的 API Keys：

```env
# DeepSeek API (用于生成故事文本)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 阿里云通义万相 API (用于生成图片)
WANXIANG_API_KEY=your_wanxiang_api_key_here

# 数据库配置 (可选)
DATABASE_URL="file:./dev.db"

# 阿里云 OSS 配置 (用于存储图片，可选)
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=your-bucket-name
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
```

### 3. 获取 API Keys

#### DeepSeek API
1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册账号并登录
3. 在控制台创建 API Key
4. 将 API Key 填入 `DEEPSEEK_API_KEY`

#### 阿里云通义万相
1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 开通通义万相服务
3. 创建 API Key
4. 将 API Key 填入 `WANXIANG_API_KEY`

## 运行项目

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 使用指南

### 创建绘本

1. 填写故事基本信息：
   - **故事主题**: 如"友谊"、"勇敢"、"环保"等
   - **主角名称**: 如"小兔子"、"小明"等
   - **年龄段**: 选择适合的儿童年龄范围
   - **页数**: 设置绘本的页数（3-10页）
   - **插画风格**: 选择喜欢的绘画风格
   - **故事场景**: 描述故事发生的环境
   - **故事寓意**: 说明故事想要传达的道理

2. 点击"生成绘本故事"按钮，系统会：
   - 使用 AI 生成完整的故事脚本
   - 为每一页生成图片描述

3. 生成完成后，点击"查看绘本"进入阅读模式。

### 阅读绘本

1. 使用左右箭头按钮或滑动屏幕翻页
2. 点击"生成插画"按钮为每一页生成配图
3. 使用底部页面指示器快速跳转
4. 可以分享或下载绘本（功能开发中）

## 项目结构

```
picture-book/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── generate/      # AI 生成相关 API
│   │   └── upload/        # 文件上传 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── BookGenerator.tsx # 绘本生成器
│   └── BookViewer.tsx    # 绘本查看器
├── lib/                  # 工具函数
├── types/                # TypeScript 类型定义
├── public/               # 静态资源
│   └── uploads/          # 上传的图片
└── ...                   # 其他配置文件
```

## 扩展功能建议

1. **用户系统**: 添加用户注册、登录功能
2. **绘本保存**: 将生成的绘本保存到数据库
3. **PDF 导出**: 集成 jsPDF 实现绘本导出
4. **语音合成**: 添加故事朗读功能
5. **多语言支持**: 支持英文等其他语言
6. **模板系统**: 预设故事模板，快速生成
7. **社交分享**: 分享到微信、微博等平台
8. **打印优化**: 优化打印布局，支持实体绘本打印

## 常见问题

### Q: 为什么无法生成故事？
A: 请检查 DeepSeek API Key 是否正确配置，并确保账户有足够的余额。

### Q: 为什么图片生成失败？
A: 请检查阿里云通义万相 API Key 是否正确，并确保服务已开通。

### Q: 生成的图片质量如何优化？
A: 可以在提示词中加入更多细节描述，如"高清插画"、"色彩鲜艳"等。

### Q: 如何保持角色一致性？
A: 在生成图片时，可以在提示词中固定角色特征，如"白色的小兔子，红色围巾"。

## 开发建议

1. **性能优化**: 使用 CDN 存储生成的图片
2. **错误处理**: 添加更友好的错误提示
3. **加载状态**: 优化 AI 生成过程中的用户体验
4. **缓存机制**: 缓存已生成的内容，减少重复请求

## 许可证

MIT License