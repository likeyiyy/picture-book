'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, BookOpen, Palette, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ExamplePrompt {
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
}

export function HomeChat({ onStartChat }: { onStartChat: (message: string) => void }) {
  const [input, setInput] = useState('');

  const examplePrompts: ExamplePrompt[] = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "动物童话",
      description: "小猩猩找妈妈的故事",
      prompt: "一个小猩猩醒来，在森林里找妈妈要抱抱的故事"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "冒险故事",
      description: "太空探险奇幻之旅",
      prompt: "关于太空冒险的故事，主角是勇敢的小宇航员"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "成长教育",
      description: "学会分享和友谊",
      prompt: "关于友谊和分享的温馨故事，适合3岁孩子"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "日常生活",
      description: "幼儿园的快乐时光",
      prompt: "小明在幼儿园第一天上学的故事"
    }
  ];

  const handleSend = () => {
    if (input.trim()) {
      onStartChat(input.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI 绘本助手</h1>
          </div>
          <div className="text-sm text-gray-600">
            用 AI 创造独一无二的儿童绘本
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            创作属于孩子的
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              精彩故事
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            只需要一句话，AI 就能为你创作出精美的绘本故事。
            支持自然对话，实时预览，让创意瞬间变为现实。
          </p>
        </motion.div>

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="告诉我你想要创作什么故事？例如：一个小猩猩在森林里找妈妈的故事..."
              className="resize-none text-base border-0 focus:ring-0 text-gray-800 placeholder-gray-400"
              rows={4}
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                按 Enter 发送，Shift + Enter 换行
              </p>
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                开始创作
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Example Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            灵感示例
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {examplePrompts.map((example, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInput(example.prompt)}
                className="bg-white rounded-xl p-5 text-left hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-center gap-2 text-purple-600 mb-3">
                  {example.icon}
                  <span className="font-medium">{example.title}</span>
                </div>
                <p className="text-sm text-gray-600">{example.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8 mt-16">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>由 DeepSeek v3.2 驱动 · 专为儿童故事创作优化</p>
        </div>
      </footer>
    </div>
  );
}