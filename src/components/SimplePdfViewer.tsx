"use client";
import React, { useState, useEffect } from 'react';

interface SimplePdfViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

const SimplePdfViewer: React.FC<SimplePdfViewerProps> = ({ pdfUrl, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('ไม่สามารถโหลดไฟล์ PDF ได้');
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <h3 className="text-xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              ปิด
            </button>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              เปิดในแท็บใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-6"></div>
            <p className="text-xl font-semibold">กำลังโหลด PDF...</p>
            <p className="text-gray-400 mt-2">กรุณารอสักครู่</p>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold truncate max-w-md">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(pdfUrl, '_blank')}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm"
            title="เปิดในแท็บใหม่"
          >
            <i className="fas fa-external-link-alt me-2"></i>
            แท็บใหม่
          </button>
          
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-lg font-bold"
            title="ปิด (ESC)"
          >
            ✕ ปิด
          </button>
        </div>
      </div>

      {/* PDF Object/Embed */}
      <div className="flex-1 relative">
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        >
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
          />
          <div className="flex flex-col items-center justify-center h-full text-white">
            <p className="mb-4">ไม่สามารถแสดง PDF ในเบราว์เซอร์ได้</p>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              <i className="fas fa-external-link-alt me-2"></i>
              เปิดในแท็บใหม่
            </button>
          </div>
        </object>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white text-center py-2 text-sm">
        <p>กด ESC เพื่อปิด • คลิก &quot;แท็บใหม่&quot; เพื่อเปิดในหน้าต่างใหม่</p>
      </div>
    </div>
  );
};

export default SimplePdfViewer;