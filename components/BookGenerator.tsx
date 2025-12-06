'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { GenerateBookRequest, PictureBook } from '@/types';
import { BookViewer } from '@/components/BookViewer';

const bookSchema = z.object({
  theme: z.string().min(1, '请输入故事主题'),
  ageGroup: z.enum(['2-4', '4-6', '6-8']),
  pageCount: z.number().min(3).max(10),
  artStyle: z.enum(['cartoon', 'watercolor', 'flat', 'realistic', 'chinese']),
  mainCharacter: z.string().min(1, '请输入主角名称'),
  setting: z.string().min(1, '请输入故事场景'),
  moral: z.string().min(1, '请输入故事寓意'),
});

type BookFormData = z.infer<typeof bookSchema>;

export function BookGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBook, setGeneratedBook] = useState<PictureBook | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      pageCount: 5,
      artStyle: 'cartoon',
      ageGroup: '4-6',
    },
  });

  const onSubmit = async (data: BookFormData) => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        const bookData: PictureBook = {
          id: Date.now().toString(),
          title: result.data.title,
          theme: data.theme,
          ageGroup: data.ageGroup,
          pageCount: data.pageCount,
          artStyle: data.artStyle,
          pages: result.data.pages,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setGeneratedBook(bookData);
      } else {
        console.error('生成失败:', result.error);
      }
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const artStyleOptions = [
    { value: 'cartoon', label: '卡通风格' },
    { value: 'watercolor', label: '水彩风格' },
    { value: 'flat', label: '扁平插画' },
    { value: 'realistic', label: '写实风格' },
    { value: 'chinese', label: '中国风' },
  ];

  const ageGroupOptions = [
    { value: '2-4', label: '2-4岁' },
    { value: '4-6', label: '4-6岁' },
    { value: '6-8', label: '6-8岁' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">创建绘本故事</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                故事主题
              </label>
              <Input
                placeholder="例如：友谊、勇敢、环保"
                {...register('theme')}
              />
              {errors.theme && (
                <p className="text-red-500 text-xs mt-1">{errors.theme.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                主角名称
              </label>
              <Input
                placeholder="例如：小兔子、小明"
                {...register('mainCharacter')}
              />
              {errors.mainCharacter && (
                <p className="text-red-500 text-xs mt-1">{errors.mainCharacter.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年龄段
              </label>
              <Select {...register('ageGroup')}>
                {ageGroupOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                页数
              </label>
              <Select {...register('pageCount', { valueAsNumber: true })}>
                {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>
                    {num}页
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                插画风格
              </label>
              <Select {...register('artStyle')}>
                {artStyleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                故事场景
              </label>
              <Input
                placeholder="例如：森林、海洋、学校"
                {...register('setting')}
              />
              {errors.setting && (
                <p className="text-red-500 text-xs mt-1">{errors.setting.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              故事寓意
            </label>
            <Textarea
              placeholder="简单描述这个故事想要传达的道理"
              rows={2}
              {...register('moral')}
            />
            {errors.moral && (
              <p className="text-red-500 text-xs mt-1">{errors.moral.message}</p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 使用 DeepSeek v3.2 模型生成故事，这是 DeepSeek 最新的 AI 模型
            </p>
          </div>

          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full h-11 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                正在生成绘本...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                生成绘本故事
              </>
            )}
          </Button>
        </form>
      </motion.div>

      {generatedBook && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-xl font-bold mb-4">绘本已生成！</h2>
          <p className="text-gray-600 mb-4">
            《{generatedBook.title}》已成功创建，共 {generatedBook.pageCount} 页。
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowViewer(true)}
              className="flex-1"
            >
              查看绘本
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setGeneratedBook(null);
                setShowViewer(false);
              }}
            >
              创建新绘本
            </Button>
          </div>
        </motion.div>
      )}

      {showViewer && generatedBook && (
        <BookViewer
          book={generatedBook}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
}