'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Page {
  pageNumber: number;
  text: string;
  imagePrompt?: string;
}

interface BookData {
  title?: string;
  pages?: Page[];
  generating?: boolean;
  currentPage?: number;
}

interface BookPreviewProps {
  bookData: BookData;
  isLoading: boolean;
}

export function BookPreview({ bookData, isLoading }: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = bookData.pages || [];
  const hasContent = bookData.title || pages.length > 0;

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  };

  if (!hasContent && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">绘本预览</p>
          <p className="text-gray-400 text-sm mt-2">
            开始对话后，你的绘本会在这里实时显示
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">绘本预览</h2>
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">生成中...</span>
            </div>
          )}
        </div>

        {bookData.title && (
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-gray-900 mt-2"
          >
            《{bookData.title}》
          </motion.h3>
        )}
      </div>

      {/* 预览区域 */}
      <div className="flex-1 p-8 overflow-auto">
        {pages.length > 0 ? (
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* 页码 */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-center">
                  第 {currentPage + 1} 页 / 共 {pages.length} 页
                </div>

                {/* 内容区 */}
                <div className="p-6">
                  {/* 文本内容 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                  >
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {pages[currentPage].text}
                    </p>
                  </motion.div>

                  {/* 插画提示 */}
                  {pages[currentPage].imagePrompt && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>插画描述</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {pages[currentPage].imagePrompt}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 导航按钮 */}
            {pages.length > 1 && (
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </Button>

                {/* 页面指示器 */}
                <div className="flex gap-2">
                  {pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentPage
                          ? 'bg-blue-600 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === pages.length - 1}
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">正在创作绘本...</p>
              {bookData.currentPage && (
                <p className="text-sm text-gray-500 mt-2">
                  正在生成第 {bookData.currentPage} 页
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部状态 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              总页数: {pages.length}
            </span>
            {isLoading && (
              <div className="flex items-center gap-1 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>正在生成</span>
              </div>
            )}
          </div>
          {pages.length > 0 && !isLoading && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>已完成</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}