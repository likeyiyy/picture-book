'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookPreview } from './BookPreview';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BookData {
  title?: string;
  pages?: Array<{
    pageNumber: number;
    text: string;
    imagePrompt?: string;
  }>;
  generating?: boolean;
  currentPage?: number;
}

interface ChatInterfaceProps {
  initialMessage?: string;
}

export function ChatInterface({ initialMessage }: ChatInterfaceProps = {}) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const initial = [
      {
        id: '1',
        role: 'assistant',
        content: '你好！我是 AI 绘本助手。📚\n\n告诉我你想要创作什么样的故事？比如："一个小猩猩在森林里找妈妈的故事"',
        timestamp: new Date(),
      },
    ];

    if (initialMessage) {
      initial.push({
        id: '2',
        role: 'user',
        content: initialMessage,
        timestamp: new Date(),
      });
    }

    return initial;
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookData, setBookData] = useState<BookData>({});
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 如果有初始消息，自动发送
  useEffect(() => {
    if (initialMessage && messages.length === 2) {
      // 延迟一下让用户看到消息
      setTimeout(() => {
        handleSendWithMessage(initialMessage);
      }, 500);
    }
  }, [initialMessage]);

  const handleSend = async () => {
    await handleSendWithMessage(input);
  };

  const handleSendWithMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 创建 EventSource 连接
      const es = new EventSource(`/api/chat/stream?message=${encodeURIComponent(messageText.trim())}`);
      setEventSource(es);

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'message') {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else if (data.type === 'book_update') {
          setBookData(data.data);
        } else if (data.type === 'complete') {
          es.close();
          setEventSource(null);
          setIsLoading(false);
        }
      };

      es.onerror = () => {
        es.close();
        setEventSource(null);
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopGeneration = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧聊天面板 - 20% */}
      <div className="w-1/5 flex flex-col border-r border-gray-200 bg-white min-w-[320px]">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">AI 绘本助手</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            用简单的语言描述你想要的故事
          </p>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 加载中指示器 */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在思考和创作...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的故事想法..."
              rows={2}
              className="resize-none"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <Button
                  onClick={stopGeneration}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  停止
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  size="icon"
                  className="h-10 w-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </div>

      {/* 右侧预览面板 - 80% */}
      <div className="flex-1 bg-gray-50">
        <BookPreview bookData={bookData} isLoading={isLoading} />
      </div>
    </div>
  );
}