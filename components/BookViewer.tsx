'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PictureBook, Page } from '@/types';

interface BookViewerProps {
  book: PictureBook;
  onClose?: () => void;
}

export function BookViewer({ book, onClose }: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean[]>(
    new Array(book.pages.length).fill(false)
  );

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(book.pages.length - 1, prev + 1));
  };

  const generateImage = async (page: Page, index: number) => {
    setIsGeneratingImages((prev) => {
      const newStatus = [...prev];
      newStatus[index] = true;
      return newStatus;
    });

    try {
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: page.imagePrompt,
          style: book.artStyle,
          size: 'square',
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.url) {
        // 更新页面图片 URL
        page.imageUrl = result.data.url;
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGeneratingImages((prev) => {
        const newStatus = [...prev];
        newStatus[index] = false;
        return newStatus;
      });
    }
  };

  const downloadBook = async () => {
    // 这里可以实现 PDF 下载功能
    console.log('Downloading book as PDF...');
  };

  const shareBook = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `查看我创作的绘本《${book.title}》`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  };

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < book.pages.length) {
      setPage([newPage, newDirection]);
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={shareBook}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={downloadBook}>
              <Download className="w-5 h-5" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Book Content */}
        <div className="relative h-[calc(90vh-200px)] flex items-center justify-center bg-gradient-to-br from-yellow-50 to-pink-50">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full h-full flex flex-col items-center justify-center p-8"
            >
              <div className="book-page w-full max-w-2xl aspect-square flex flex-col">
                {/* Image */}
                <div className="flex-1 relative bg-gray-100 rounded-t-lg overflow-hidden">
                  {book.pages[page].imageUrl ? (
                    <img
                      src={book.pages[page].imageUrl}
                      alt={`Page ${page + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Button
                        onClick={() => generateImage(book.pages[page], page)}
                        disabled={isGeneratingImages[page]}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {isGeneratingImages[page] ? '生成中...' : '生成插画'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="p-6 bg-white rounded-b-lg">
                  <p className="text-lg text-gray-800 text-center leading-relaxed">
                    {book.pages[page].text}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => paginate(-1)}
            disabled={page === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => paginate(1)}
            disabled={page === book.pages.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Page Indicator */}
        <div className="bg-gray-100 p-4 flex justify-center items-center gap-2">
          {book.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setPage([index, index > page ? 1 : -1]);
                setCurrentPage(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === page
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}