'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, CheckCircle, Download, Printer, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Page {
  pageNumber: number;
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
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
  const [pages, setPages] = useState<Page[]>([]);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const hasContent = bookData.title || pages.length > 0;

  // 检查是否所有图片都已生成
  const allImagesGenerated = pages.length > 0 &&
    pages.every(page => page.imageUrl || !page.imagePrompt);

  // 当 bookData.pages 更新时，更新本地的 pages 状态
  useEffect(() => {
    setPages(bookData.pages || []);
  }, [bookData.pages]);

  // 构建完整的故事上下文
  const buildStoryContext = () => {
    const storyTitle = bookData.title || '绘本故事';
    const storyPages = pages.map((page, index) => ({
      pageNumber: index + 1,
      text: page.text,
      imagePrompt: page.imagePrompt
    }));

    return {
      title: storyTitle,
      pages: storyPages
    };
  };

  // 生成图像（带重试逻辑）
  const generateImage = async (prompt: string, pageIndex: number, retryCount = 0) => {
    const maxRetries = 3;

    // 更新页面状态为正在生成图像
    setPages(prev => prev.map((page, index) =>
      index === pageIndex
        ? { ...page, isGeneratingImage: true, imageError: undefined }
        : page
    ));

    try {
      // 构建完整的故事上下文
      const storyContext = buildStoryContext();

      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          storyContext: storyContext,
          currentPage: pageIndex + 1,
          totalPages: pages.length,
          style: '<auto>',
          size: 'landscape'
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.url) {
        // 更新页面图像URL
        setPages(prev => {
          const updated = prev.map((page, index) =>
            index === pageIndex
              ? { ...page, imageUrl: result.data.url, isGeneratingImage: false, imageError: undefined }
              : page
          );
          // 检查是否所有图片都已生成
          const allGenerated = updated.every(page => !page.imagePrompt || page.imageUrl);
          if (allGenerated) {
            setHasStartedGeneration(false);
          }
          return updated;
        });
      } else {
        console.error('Failed to generate image:', result.error);

        // 如果是速率限制错误且还有重试次数，则延迟后重试
        if (result.error?.includes('429') || result.error?.includes('rate limit')) {
          if (retryCount < maxRetries) {
            // 指数退避延迟
            const delay = Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s
            setTimeout(() => {
              generateImage(prompt, pageIndex, retryCount + 1);
            }, delay);
            return;
          } else {
            // 超过重试次数，显示错误信息
            setPages(prev => prev.map((page, index) =>
              index === pageIndex
                ? {
                    ...page,
                    isGeneratingImage: false,
                    imageError: '图像生成失败：API频率限制，请稍后重试'
                  }
                : page
            ));
          }
        } else {
          // 其他错误
          setPages(prev => prev.map((page, index) =>
            index === pageIndex
              ? {
                  ...page,
                  isGeneratingImage: false,
                  imageError: result.error || '图像生成失败'
                }
              : page
          ));
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setPages(prev => prev.map((page, index) =>
        index === pageIndex
          ? {
              ...page,
              isGeneratingImage: false,
              imageError: '网络错误，请检查连接'
            }
          : page
      ));
    }
  };

  // 当页面有 imagePrompt 但没有 imageUrl 时，自动生成图像
  useEffect(() => {
    if (isLoading || hasStartedGeneration) return;

    // 检查是否有需要生成的图片
    const hasPendingImages = pages.some(page => page.imagePrompt && !page.imageUrl);
    if (!hasPendingImages) return;

    setHasStartedGeneration(true);

    // 添加延迟以避免速率限制
    const generateImagesWithDelay = async () => {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.imagePrompt && !page.imageUrl && !page.isGeneratingImage) {
          // 为每一页添加延迟，避免请求过于频繁
          await new Promise(resolve => setTimeout(resolve, 5000 * i)); // 增加延迟到5秒
          generateImage(page.imagePrompt, i);
        }
      }
    };

    generateImagesWithDelay();
  }, [pages, isLoading, hasStartedGeneration]);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  };

  // 构建打印页面内容
  const buildPrintContent = () => {
    let content = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${bookData.title || '绘本'} - 打印预览</title>
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          body {
            font-family: 'Microsoft YaHei', 'PingFang SC', 'SimHei', sans-serif;
            background: white;
            margin: 0;
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          .print-actions {
            margin-bottom: 20px;
            text-align: center;
          }
          .print-page {
            width: 100%;
            min-height: calc(100vh - 200px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            page-break-after: always;
            margin-bottom: 40px;
          }
          .title-page {
            text-align: center;
          }
          .title-page h1 {
            font-size: 48px;
            margin-bottom: 20px;
            color: #333;
          }
          .title-page p {
            font-size: 20px;
            color: #666;
          }
          .content-page {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            box-sizing: border-box;
          }
          .page-image {
            width: 100%;
            height: auto;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .page-text {
            font-size: 24px;
            text-align: center;
            line-height: 1.6;
            color: #333;
          }
          .page-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="print-header no-print">
          <h1>${bookData.title || '绘本故事'} - 打印预览</h1>
          <p>共 ${pages.length} 页</p>
        </div>
        <div class="print-actions no-print">
          <button onclick="window.print()" style="
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
          ">
            打印
          </button>
          <button onclick="window.close()" style="
            padding: 10px 20px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          ">
            关闭
          </button>
        </div>
        <div class="title-page print-page">
          <h1>${bookData.title || '绘本故事'}</h1>
          <p>共 ${pages.length} 页</p>
        </div>
    `;

    // 添加每一页的内容
    content += pages.map((page, index) => `
      <div class="content-page print-page" style="position: relative;">
        ${page.imageUrl ? `<img src="${page.imageUrl}" alt="第 ${index + 1} 页" class="page-image" />` : ''}
        <div class="page-text">${page.text}</div>
        <div class="page-number">第 ${index + 1} 页</div>
      </div>
    `).join('');

    content += `
      </body>
      </html>
    `;

    return content;
  };

  // 预览功能
  const handlePreview = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = buildPrintContent();

    // 写入内容
    printWindow.document.write(content);
    printWindow.document.close();
  };

  // 打印功能
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = buildPrintContent();

    // 写入内容
    printWindow.document.write(content);
    printWindow.document.close();

    // 等待内容加载完成后打印
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
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
          <div className="flex items-center gap-2">
            {pages.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>预览</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>打印/导出 PDF</span>
                </Button>
              </>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">生成中...</span>
              </div>
            )}
          </div>
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
                  {/* 图像显示 */}
                  {pages[currentPage].imageUrl && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-4"
                    >
                      <img
                        src={pages[currentPage].imageUrl}
                        alt={`第 ${currentPage + 1} 页插画`}
                        className="w-full rounded-lg shadow-md"
                      />
                    </motion.div>
                  )}

                  {/* 图像生成中 */}
                  {pages[currentPage].isGeneratingImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-4 bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center"
                    >
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-600">正在生成插画...</p>
                    </motion.div>
                  )}

                  {/* 图像生成失败 */}
                  {pages[currentPage].imageError && !pages[currentPage].imageUrl && !pages[currentPage].isGeneratingImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-4 bg-red-50 rounded-lg p-6"
                    >
                      <div className="flex flex-col items-center text-center">
                        <ImageIcon className="w-12 h-12 text-red-400 mb-3" />
                        <p className="text-red-600 mb-3">{pages[currentPage].imageError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (pages[currentPage].imagePrompt) {
                              generateImage(pages[currentPage].imagePrompt!, currentPage);
                            }
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                          重试生成
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* 文本内容 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                  >
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {pages[currentPage].text}
                    </p>
                  </motion.div>

                  {/* 插画提示（仅在未生成图像时显示） */}
                  {!pages[currentPage].imageUrl && !pages[currentPage].isGeneratingImage && pages[currentPage].imagePrompt && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
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
          {allImagesGenerated && pages.length > 0 && !isLoading && (
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