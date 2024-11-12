// src/components/ResultDisplay/index.js
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';

const ResultDisplay = ({ originalUrl, analysisResult }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [displayUrl, setDisplayUrl] = useState(null);

  useEffect(() => {
    if (originalUrl) {
      // 檢查 URL 類型並進行轉換
      if (originalUrl instanceof Blob) {
        const newUrl = URL.createObjectURL(originalUrl);
        setDisplayUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
      } else {
        setDisplayUrl(originalUrl);
      }
    }
  }, [originalUrl]);

  // 生成隨機顏色
  const generateColor = (index) => {
    const hue = (index * 137.508) % 360;  // 使用黃金角來分散顏色
    return `hsla(${hue}, 100%, 50%, ${hoveredSegment?.id === `segment_${index}` ? 0.8 : 0.5})`;
  };

  // 創建 SVG 路徑
  const createPathFromPoints = (points) => {
    if (!points || points.length === 0) return '';
    return `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
  };

  const renderSegments = () => {
    if (!analysisResult?.segments || !analysisResult?.metadata?.image_size) {
      return (
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      );
    }

    const { width, height } = analysisResult.metadata.image_size;

    return (
      <div className="relative aspect-square rounded-lg overflow-hidden">
        {/* 原始圖片 */}
        <div className="absolute inset-0">
          {displayUrl && (
            <Image
              src={displayUrl}
              alt="Original"
              fill
              className="object-contain"
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>

        {/* SVG 遮罩層 */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g>
            {analysisResult.segments.map((segment, index) => (
              <g
                key={segment.id}
                onMouseEnter={() => setHoveredSegment(segment)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={createPathFromPoints(segment.points)}
                  fill={generateColor(index)}
                  fillOpacity={hoveredSegment?.id === segment.id ? "0.7" : "0.4"}
                  className="transition-all duration-200"
                />
                <text
                  x={segment.bbox.x1}
                  y={segment.bbox.y1 - 5}
                  fill="white"
                  stroke="black"
                  strokeWidth="0.5"
                  fontSize="12"
                  className="pointer-events-none select-none"
                >
                  {segment.class_name}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Hover 信息 */}
        {hoveredSegment && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded z-20">
            <p className="font-bold">{hoveredSegment.class_name}</p>
            <p>信心度: {(hoveredSegment.confidence * 100).toFixed(1)}%</p>
          </div>
        )}

        {/* 角度信息 */}
        {analysisResult.angles && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded z-20">
            {analysisResult.angles.pairs.map((pair, index) => (
              <div key={pair} className="text-sm">
                {pair}: {analysisResult.angles.values[index].toFixed(1)}°
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>原始影像</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square rounded-lg overflow-hidden">
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt="Original"
                fill
                className="object-contain"
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>分割結果</CardTitle>
        </CardHeader>
        <CardContent>
          {renderSegments()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultDisplay;