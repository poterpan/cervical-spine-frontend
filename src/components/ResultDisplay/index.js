// src/components/ResultDisplay/index.js
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Maximize2, X } from "lucide-react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/services/storageService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const ResultDisplay = ({
  originalUrl,
  analyzedUrl,
  analysisResult,
  selectedFile,
  modelName,
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [displayUrl, setDisplayUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (originalUrl) {
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
    const hue = (index * 137.508) % 360;
    return `hsla(${hue}, 100%, 50%, ${
      hoveredSegment?.id === `segment_${index}` ? 0.8 : 0.5
    })`;
  };

  // 創建 SVG 路徑
  const createPathFromPoints = (points) => {
    if (!points || points.length === 0) return "";
    return `M ${points.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;
  };

  // 計算兩點之間的中點
  const getMidPoint = (p1, p2) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  });

  // 渲染角度線和標籤
  const renderAngleLines = (segment, segments) => {
    if (!segment.adjacent_angles) return null;

    return Object.entries(segment.adjacent_angles).map(
      ([adjacentLabel, angleInfo]) => {
        const { connected_segments, angle } = angleInfo;

        // 找到相連的兩個segment
        const segment1 = segments.find(
          (s) => s.id === connected_segments[0].segment_id
        );
        const segment2 = segments.find(
          (s) => s.id === connected_segments[1].segment_id
        );

        if (!segment1 || !segment2) return null;

        // 取得兩個segment的中心線
        const line1 = segment1.center_line;
        const line2 = segment2.center_line;

        // 計算角度標籤的位置 - 在兩個segment之間
        const midPoint = getMidPoint(
          getMidPoint(line1[0], line1[1]),
          getMidPoint(line2[0], line2[1])
        );

        const labelRadius = 10; // 背景圓的半徑
        const labelText = Math.abs(angle).toFixed(1) + "°";

        return (
          <g key={`${segment1.id}-${segment2.id}`}>
            {/* 第一個segment的中心線 */}
            <line
              x1={line1[0].x}
              y1={line1[0].y}
              x2={line1[1].x}
              y2={line1[1].y}
              stroke="yellow"
              strokeWidth="2"
              className="opacity-75"
            />
            {/* 第二個segment的中心線 */}
            <line
              x1={line2[0].x}
              y1={line2[0].y}
              x2={line2[1].x}
              y2={line2[1].y}
              stroke="yellow"
              strokeWidth="2"
              className="opacity-75"
            />
            {/* 角度標籤背景 */}
            <circle
              cx={midPoint.x}
              cy={midPoint.y}
              r={labelRadius}
              fill="black"
              fillOpacity="0.6"
              className="pointer-events-none"
            />
            {/* 角度標籤 */}
            <text
              x={midPoint.x}
              y={midPoint.y}
              fill="white"
              fontSize="8"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none font-medium"
              style={{
                paintOrder: "stroke",
                stroke: "rgba(0, 0, 0, 0.5)",
                strokeWidth: "1px",
              }}
            >
              {labelText}
            </text>
          </g>
        );
      }
    );
  };

  // 生成角度摘要數據
  const generateAngleSummary = (segments) => {
    const summary = [];
    // 只處理參考區域的segment
    const referenceSegments = segments.filter(
      (segment) => segment.is_reference
    );

    referenceSegments.forEach((segment) => {
      Object.entries(segment.adjacent_angles).forEach(
        ([adjacentLabel, angleInfo]) => {
          // 取得連接的segment標籤
          const segmentPair = angleInfo.connected_segments
            .map((s) => s.label)
            .sort()
            .join("-");

          // 檢查是否已經添加過這個組合
          if (!summary.some((s) => s.pair === segmentPair)) {
            summary.push({
              pair: segmentPair,
              angle: Math.abs(angleInfo.angle),
            });
          }
        }
      );
    });
    // 按照標籤順序排序
    return summary.sort((a, b) => a.pair.localeCompare(b.pair));
  };

  // 找到與給定segment相鄰的segments
  const getConnectedSegments = (segment, segments) => {
    if (!segment.adjacent_angles) return [];

    const connectedIds = new Set();
    Object.values(segment.adjacent_angles).forEach((angleInfo) => {
      angleInfo.connected_segments.forEach((conn) =>
        connectedIds.add(conn.segment_id)
      );
    });

    return segments.filter((s) => connectedIds.has(s.id));
  };

  const renderAnalysisContent = (isFullscreenMode = false) => {
    if (!analysisResult?.segments || !analysisResult?.image_metadata) {
      return (
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      );
    }

    const { width, height } = analysisResult.image_metadata;
    const { segments } = analysisResult;
    const angleSummary = generateAngleSummary(segments);

    const containerClass = isFullscreenMode
      ? "w-full h-full relative"
      : "relative aspect-square rounded-lg overflow-hidden";

    return (
      <div className={containerClass}>
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
              sizes="100vw"
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
            {segments.map((segment, index) => (
              <g
                key={segment.id}
                onMouseEnter={() => setHoveredSegment(segment)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={createPathFromPoints(segment.mask.points)}
                  fill={generateColor(index)}
                  fillOpacity={
                    hoveredSegment?.id === segment.id ? "0.7" : "0.4"
                  }
                  className="transition-all duration-200"
                />
                <text
                  x={segment.mask.centroid.x}
                  y={segment.mask.centroid.y}
                  fill="white"
                  stroke="black"
                  strokeWidth="0.5"
                  fontSize={isFullscreenMode ? "12" : "12"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                >
                  {segment.label}
                </text>
              </g>
            ))}

            {hoveredSegment && renderAngleLines(hoveredSegment, segments)}
          </g>
        </svg>

        {/* Hover 信息 */}
        {hoveredSegment && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded z-20">
            <p className="font-bold">{hoveredSegment.label}</p>
            <p>信心度: {(hoveredSegment.confidence * 100).toFixed(1)}%</p>
            {hoveredSegment.is_reference && (
              <p className="text-yellow-400">參考區域</p>
            )}
          </div>
        )}

        {/* 角度摘要 */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded z-20">
          <div className="text-sm font-medium mb-2">測量角度摘要</div>
          <div className="space-y-1">
            {angleSummary.map(({ pair, angle }) => (
              <div
                key={pair}
                className="text-sm flex items-center justify-between text-white"
              >
                <span className="mr-4">{pair}</span>
                <span>{angle.toFixed(1)}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!analysisResult || !selectedFile) {
      toast({
        title: "無法保存",
        description: "缺少必要的分析數據",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await storageService.saveAnalysis(
        selectedFile,
        analysisResult,
        modelName
      );
      toast({
        title: "保存成功",
        description: "分析結果已成功保存",
      });
    } catch (error) {
      toast({
        title: "保存失敗",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center h-[56px] pb-0 space-y-0">
            <CardTitle className="text-xl">原始影像</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
          <CardHeader className="flex flex-row items-center justify-between h-[56px] pb-0 space-y-0">
            <CardTitle className="text-xl">分割結果</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(true)}
              className="ml-auto"
              title="全螢幕檢視"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {renderAnalysisContent(false)}
          </CardContent>
        </Card>
      </div>
      {/* 添加保存按鈕 */}
      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "保存中..." : "保存結果"}</span>
        </Button>
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-6 [&>button]:hidden">
          <DialogHeader className="absolute w-full flex justify-between items-center">
            <DialogTitle className="sr-only">分割結果全螢幕視圖</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(false)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="relative w-full h-full">
            {renderAnalysisContent(true)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResultDisplay;
