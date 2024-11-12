// components/SliceSelector/index.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SliceSelector = ({ file, slices, onSliceSelect }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sliceUrls, setSliceUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!file) return;

    // 如果是一般圖片檔案
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onSliceSelect(file);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, onSliceSelect]);

  // 當接收到切片數據時，創建 URL 並設置初始切片
  useEffect(() => {
    if (!slices || slices.length === 0) return;

    console.log('Setting up slices, total:', slices.length);
    const urls = slices.map(slice => URL.createObjectURL(slice));
    setSliceUrls(urls);
    
    // 設置預設顯示中間層
    const middleIndex = Math.floor(slices.length / 2);
    setCurrentIndex(middleIndex);
    onSliceSelect(slices[middleIndex]);
    setIsLoading(false);

    // Cleanup function
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [slices, onSliceSelect]);

  const handleSliderChange = (value) => {
    const newIndex = value[0];
    setCurrentIndex(newIndex);
    onSliceSelect(slices[newIndex]);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => {
        const newIndex = prev - 1;
        onSliceSelect(slices[newIndex]);
        return newIndex;
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < slices.length - 1) {
      setCurrentIndex(prev => {
        const newIndex = prev + 1;
        onSliceSelect(slices[newIndex]);
        return newIndex;
      });
    }
  };

  // 一般圖片檔案的預覽
  if (file && file.type.startsWith('image/')) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">預覽圖片</h3>
        <div className="relative aspect-video w-full h-[400px] overflow-hidden rounded-lg">
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
      </div>
    );
  }

  // NIFTI/DICOM 切片的預覽
  if (sliceUrls.length > 0) {
    return (
      <div className="space-y-6 w-full max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold">
          選擇切片 ({currentIndex + 1} / {sliceUrls.length})
        </h3>
        
        {/* 主要切片預覽 */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={sliceUrls[currentIndex]}
            alt={`Slice ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* 控制區域 */}
        <div className="space-y-4">
          {/* 滑動拉桿 */}
          <div className="px-4">
            <Slider
              value={[currentIndex]}
              max={sliceUrls.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="py-4"
            />
          </div>

          {/* 前後切換按鈕 */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === sliceUrls.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 切片信息 */}
          <div className="text-center text-sm text-gray-500">
            使用滑桿或按鈕切換切片
          </div>
        </div>
      </div>
    );
  }

  // 如果沒有內容可顯示
  return (
    <div className="text-center py-8 text-gray-500">
      {isLoading ? '正在載入切片...' : '尚未選擇檔案'}
    </div>
  );
};

export default SliceSelector;