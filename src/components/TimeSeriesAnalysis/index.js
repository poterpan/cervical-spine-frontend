import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TimeSeriesAnalysis = ({ records, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(1);

  // 模擬的多角度時序數據
  const angleData = [
    {
      timestamp: "2024-01",
      "C1-C2": 22.6,
      "C2-C3": 18.6,
      "C3-C4": 19.4,
      "C4-C5": 2.6,
      "C5-C6": 0.0,
      "C6-C7": 6.0,
      "C7-T1": 1.2,
      type: "historical",
    },
    {
      timestamp: "2024-02",
      "C1-C2": 23.1,
      "C2-C3": 19.2,
      "C3-C4": 20.1,
      "C4-C5": 2.8,
      "C5-C6": 0.2,
      "C6-C7": 6.4,
      "C7-T1": 1.4,
      type: "historical",
    },
    {
      timestamp: "2024-03",
      "C1-C2": 23.8,
      "C2-C3": 19.8,
      "C3-C4": 20.8,
      "C4-C5": 3.1,
      "C5-C6": 0.5,
      "C6-C7": 6.8,
      "C7-T1": 1.6,
      type: "historical",
    },
    {
      timestamp: "2024-04",
      "C1-C2": 24.2,
      "C2-C3": 20.4,
      "C3-C4": 21.5,
      "C4-C5": 3.4,
      "C5-C6": 0.8,
      "C6-C7": 7.2,
      "C7-T1": 1.8,
      type: "historical",
    },
    // 預測數據
    {
      timestamp: "2024-05",
      "C1-C2": 24.8,
      "C2-C3": 21.0,
      "C3-C4": 22.2,
      "C4-C5": 3.7,
      "C5-C6": 1.1,
      "C6-C7": 7.6,
      "C7-T1": 2.0,
      type: "predicted",
    },
    {
      timestamp: "2024-06",
      "C1-C2": 25.4,
      "C2-C3": 21.6,
      "C3-C4": 22.9,
      "C4-C5": 4.0,
      "C5-C6": 1.4,
      "C6-C7": 8.0,
      "C7-T1": 2.2,
      type: "predicted",
    },
    {
      timestamp: "2024-07",
      "C1-C2": 26.0,
      "C2-C3": 22.2,
      "C3-C4": 23.6,
      "C4-C5": 4.3,
      "C5-C6": 1.7,
      "C6-C7": 8.4,
      "C7-T1": 2.4,
      type: "predicted",
    },
  ];

  // 為每個椎骨對生成不同的顏色
  const colors = {
    "C1-C2": "#FF6B6B",
    "C2-C3": "#4ECDC4",
    "C3-C4": "#45B7D1",
    "C4-C5": "#96CEB4",
    "C5-C6": "#FFEEAD",
    "C6-C7": "#D4A5A5",
    "C7-T1": "#9B59B6",
  };

  // 計算角度變化率
  const calculateChangeRate = (segment) => {
    const currentValue = angleData[3][segment]; // 當前值
    const predictedValue = angleData[6][segment]; // 3個月後的預測值
    const changeRate = ((predictedValue - currentValue) / currentValue) * 100;
    return changeRate.toFixed(1);
  };

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}°
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <Card className="w-[90vw] h-[90vh] relative">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>椎骨角度時序分析與預測</CardTitle>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
              BETA
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-4rem)]">
          {/* 左側圖片堆疊區域 */}
          <div className="w-1/2 h-full relative bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {/* 指示器移到左上角 */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
              {selectedIndex + 1} / {records.length}
            </div>

            <div className="relative h-[70%] aspect-[3/4]">
              {/* 使用固定尺寸 */}
              <AnimatePresence mode="popLayout">
                {records.map((record, index) => {
                  const offset = index - selectedIndex;
                  const isVisible = Math.abs(offset) <= 2;

                  return (
                    isVisible && (
                      <motion.div
                        key={record.id}
                        className="absolute origin-center w-full h-full"
                        style={{
                          zIndex: records.length - Math.abs(offset),
                        }}
                        animate={{
                          scale: 1 - Math.abs(offset) * 0.05,
                          x: offset * 40, // 從 20 增加到 40，增加水平間距
                          y: Math.abs(offset) * 30, // 從 10 增加到 20，增加垂直間距
                          rotateY: offset * -15,
                          z: -Math.abs(offset) * 100, // 從 50 增加到 100，增加深度距離
                          opacity: 1 - Math.abs(offset) * 0.3,
                        }}
                        initial={{
                          scale: 0.9,
                          opacity: 0,
                          rotateY: -30,
                          x: 100,
                        }}
                        exit={{
                          scale: 0.9,
                          opacity: 0,
                          rotateY: 30,
                          x: -100,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <div
                          className="relative w-full h-full rounded-lg overflow-hidden shadow-lg cursor-pointer bg-black"
                          style={{
                            transform: "perspective(1000px)",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <Image
                            src={record.imageData}
                            alt={`Time series ${index + 1}`}
                            fill
                            priority={Math.abs(offset) <= 1}
                            className="object-contain"
                            sizes="400px"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white p-2 text-center text-sm">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    )
                  );
                })}
              </AnimatePresence>
            </div>

            {/* 按鈕樣式調整 */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => prev - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {selectedIndex < records.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => prev + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* 右側數據分析區域 */}
          <div className="w-1/2 h-full pl-4">
            {/* 趨勢圖 */}
            <div className="h-1/2 mb-4">
              <h3 className="text-lg font-semibold mb-2">角度變化趨勢</h3>
              <div className="h-[calc(100%-2rem)] bg-white rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={angleData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.keys(colors).map((segment) => (
                      <Line
                        key={segment}
                        type="monotone"
                        dataKey={segment}
                        name={segment}
                        stroke={colors[segment]}
                        strokeWidth={2}
                        dot={{ fill: colors[segment] }}
                        strokeDasharray={(d) =>
                          d.type === "predicted" ? "5 5" : "0"
                        }
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 預測分析 */}
            <div className="h-1/2">
              <h3 className="text-lg font-semibold mb-2">預測分析</h3>
              <div className="bg-white rounded-lg p-4 h-[calc(100%-2.5rem)] overflow-auto">
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(colors).map((segment) => (
                    <div
                      key={segment}
                      className="p-3 rounded-lg border"
                      style={{ borderColor: colors[segment] }}
                    >
                      <h4
                        className="font-medium"
                        style={{ color: colors[segment] }}
                      >
                        {segment}
                      </h4>
                      <p className="text-xl font-bold">
                        {angleData[3][segment].toFixed(1)}°
                      </p>
                      <p
                        className={`text-sm ${
                          Number(calculateChangeRate(segment)) > 10
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        預測變化率: {calculateChangeRate(segment)}%
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">分析建議</h4>
                  <div className="text-sm text-gray-600">
                    根據預測趨勢，C1-C2和C3-C4的角度變化較為明顯。
                  </div>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                    <li>密切監控這些區域的變化</li>
                    <li>考慮進行針對性的物理治療</li>
                    <li>建議3個月內進行複查</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSeriesAnalysis;
