'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const hasContent = bookData.title || pages.length > 0;
  const pdfContentRef = useRef<HTMLDivElement>(null);

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

  // 导出 PDF 功能
  const exportToPDF = async () => {
    if (!pdfContentRef.current || pages.length === 0) return;

    setIsExportingPDF(true);

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 添加标题页
      if (bookData.title) {
        pdf.setFontSize(24);
        pdf.text(bookData.title, pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });

        pdf.setFontSize(12);
        pdf.text(`共 ${pages.length} 页`, pdf.internal.pageSize.getWidth() / 2, 70, { align: 'center' });

        // 添加一页空白
        pdf.addPage();
      }

      // 为每一页生成 PDF
      for (let i = 0; i < pages.length; i++) {
        const pageElement = document.getElementById(`pdf-page-${i}`);

        if (pageElement) {
          // 使用 html2canvas 捕获页面
          const canvas = await html2canvas(pageElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');

          // 计算图片在 PDF 中的尺寸
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 200;

          const imgX = (pdfWidth - imgWidth * ratio / 200) / 2;
          const imgY = 20;

          if (i > 0) {
            pdf.addPage();
          }

          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio / 200, imgHeight * ratio / 200);

          // 添加页码
          pdf.setFontSize(10);
          pdf.text(`第 ${i + 1} 页`, pdfWidth - 20, pdfHeight - 10, { align: 'right' });
        }
      }

      // 下载 PDF
      const fileName = `${bookData.title || '绘本'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('导出 PDF 失败:', error);
    } finally {
      setIsExportingPDF(false);
    }
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
            {pages.length > 0 && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={isExportingPDF}
                className="flex items-center gap-2"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>导出中...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>导出 PDF</span>
                  </>
                )}
              </Button>
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
          {pages.length > 0 && !isLoading && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>已完成</span>
            </div>
          )}
        </div>
      </div>

      {/* 隐藏的 PDF 导出容器 */}
      <div ref={pdfContentRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {pages.map((page, index) => (
          <div
            key={index}
            id={`pdf-page-${index}`}
            style={{
              width: '910px',
              minHeight: '512px',
              padding: '20px',
              backgroundColor: 'white',
              marginBottom: '20px'
            }}
          >
            {/* 页码标题 */}
            <div style={{
              textAlign: 'center',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              第 {page.pageNumber} 页
            </div>

            {/* 图像 */}
            {page.imageUrl && (
              <div style={{ marginBottom: '10px' }}>
                <img
                  src={page.imageUrl}
                  alt={`第 ${page.pageNumber} 页插画`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            {/* 文本 */}
            <div style={{
              fontSize: '16px',
              lineHeight: '1.5',
              textAlign: 'center',
              color: '#333'
            }}>
              {page.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}