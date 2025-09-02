"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import dynamic from 'next/dynamic';
import logger from '@/lib/logger';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Dynamic import of HTMLFlipBook for client-side only
const HTMLFlipBook = dynamic(() => import('react-pageflip'), {
  ssr: false,
});

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

// Add CORS options for PDF loading
const pdfOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  httpHeaders: {
    'Access-Control-Allow-Origin': '*',
  },
  withCredentials: false,
};

interface EbookViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

const EbookViewer: React.FC<EbookViewerProps> = ({ pdfUrl, title, onClose }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState<number>(1.0);
  const flipBookRef = useRef<HTMLElement | null>(null);

  // Development debugging - remove in production
  // console.log('EbookViewer props:', { pdfUrl, title });

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    logger.info('PDF loaded successfully', { numPages, pdfUrl });
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: Error): void {
    logger.error('PDF Load Error', { error: error.message, pdfUrl });
    setError(`ไม่สามารถโหลดไฟล์ PDF ได้: ${error.message}`);
    setIsLoading(false);
  }

  const nextPage = useCallback(() => {
    if (flipBookRef.current && pageNumber < numPages && typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (flipBookRef.current as any).pageFlip().flipNext();
    }
  }, [pageNumber, numPages]);

  const prevPage = useCallback(() => {
    if (flipBookRef.current && pageNumber > 1 && typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (flipBookRef.current as any).pageFlip().flipPrev();
    }
  }, [pageNumber]);

  const onFlip = useCallback((e: { data: number }) => {
    setPageNumber(e.data + 1);
  }, []);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, onClose]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <h3 className="text-xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            ปิด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Loading State - Full Screen */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-6"></div>
            <p className="text-xl font-semibold">กำลังโหลด PDF...</p>
            <p className="text-gray-400 mt-2">กรุณารอสักครู่</p>
          </div>
          {/* Close button during loading */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-500 text-white p-3 rounded-full text-lg font-bold"
            title="ปิด"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!isLoading && !error && (
        <>
          {/* Header Controls - Floating */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-black bg-opacity-75 backdrop-blur-sm rounded-lg p-4 text-white z-10">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-bold truncate max-w-md">{title}</h2>
              <span className="text-sm text-gray-300 hidden sm:block">
                หน้า {pageNumber} จาก {numPages}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <button
                onClick={zoomOut}
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm"
                title="ย่อขนาด"
              >
                -
              </button>
              <span className="text-sm hidden sm:block">{Math.round(scale * 100)}%</span>
              <button
                onClick={zoomIn}
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm"
                title="ขยายขนาด"
              >
                +
              </button>
              
              {/* Navigation Controls */}
              <button
                onClick={prevPage}
                disabled={pageNumber <= 1}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 p-2 rounded text-sm"
                title="หน้าก่อนหน้า"
              >
                ←
              </button>
              <button
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 p-2 rounded text-sm"
                title="หน้าถัดไป"
              >
                →
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-500 p-2 rounded text-lg font-bold ml-2"
                title="ปิด (ESC)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* PDF Content - Full Screen */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>กำลังโหลด PDF...</p>
                </div>
              }
              options={pdfOptions}
            >
              {numPages > 0 && typeof window !== 'undefined' ? (
                <HTMLFlipBook
                  ref={flipBookRef}
                  width={Math.min(800 * scale, window.innerWidth * 0.95)}
                  height={Math.min(1000 * scale, window.innerHeight * 0.95)}
                  size="stretch"
                  minWidth={300}
                  maxWidth={1400}
                  minHeight={400}
                  maxHeight={1600}
                  maxShadowOpacity={0.5}
                  showCover={true}
                  mobileScrollSupport={true}
                  onFlip={onFlip}
                  className="ebook-flipbook"
                  style={{}}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={600}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize={true}
                  clickEventForward={true}
                  useMouseEvents={true}
                  swipeDistance={30}
                  showPageCorners={true}
                  disableFlipByClick={false}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} className="ebook-page bg-white">
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        className="pdf-page"
                        width={Math.min(400 * scale, window.innerWidth * 0.4)}
                      />
                    </div>
                  ))}
                </HTMLFlipBook>
              ) : (
                // Fallback: Simple page view without flipbook
                numPages > 0 && (
                  <div className="flex flex-col items-center space-y-4 max-h-full overflow-auto">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      className="pdf-page border border-gray-300"
                      width={Math.min(600 * scale, window.innerWidth * 0.9)}
                    />
                  </div>
                )
              )}
            </Document>
          </div>

          {/* Footer Instructions - Floating */}
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 backdrop-blur-sm text-white text-center py-3 rounded-lg text-sm z-10">
            <p className="hidden sm:block">ใช้ลูกศรซ้าย/ขวา หรือคลิกขอบหน้าเพื่อพลิกหน้า • กด ESC เพื่อปิด</p>
            <p className="sm:hidden">แตะขอบหน้าเพื่อพลิก • หน้า {pageNumber}/{numPages}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default EbookViewer;