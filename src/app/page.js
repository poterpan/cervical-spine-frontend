"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, Users, Activity, History } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import ModelSelector from "@/components/ModelSelector";
import ResultDisplay from "@/components/ResultDisplay";
import SliceSelector from "@/components/SliceSelector";
import Settings from "@/components/Settings";
import VersionInfo from "@/components/VersionInfo";
import IssueReport from "@/components/IssueReport";
import HealthCheck from "@/components/HealthCheck";
import RecordsDialog from "@/components/RecordsDialog";
import ExampleData from "@/components/ExampleData";
import { analyzeImage, processNiftiFile } from "@/services/api";

export default function Home() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState("yolov11");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [slices, setSlices] = useState([]);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [imageUrls, setImageUrls] = useState({
    original: null,
    analyzed: null,
  });

  const urlsRef = useRef({ original: null, analyzed: null });

  const cleanupUrl = useCallback((url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  useEffect(() => {
    if (!selectedFile) return;

    const newUrl = URL.createObjectURL(selectedFile);
    urlsRef.current.original = newUrl;
    setImageUrls((prev) => {
      if (prev.original) {
        cleanupUrl(prev.original);
      }
      return {
        ...prev,
        original: newUrl,
      };
    });

    return () => {
      cleanupUrl(newUrl);
    };
  }, [selectedFile, cleanupUrl]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      if (urls.original) cleanupUrl(urls.original);
      if (urls.analyzed) cleanupUrl(urls.analyzed);
    };
  }, [cleanupUrl]);

  const handleFileSelect = useCallback(async (file) => {
    console.log("handleFileSelect called with file:", file);
    console.log("File type:", file.type);
    console.log("File name:", file.name);

    setSelectedFile(file);
    setSlices([]);
    setSelectedSlice(null);

    if (!file) {
      console.log("No file provided");
      return;
    }

    // 檢查是否為 NIfTI 或 DICOM 檔案
    const isNiftiOrDicom = file.name
      .toLowerCase()
      .match(/\.(nii|nii\.gz|dcm)$/);
    console.log("Is NIfTI or DICOM:", isNiftiOrDicom);

    if (isNiftiOrDicom) {
      setIsProcessing(true);
      try {
        console.log("Starting to process NIfTI/DICOM file");
        const slicesData = await processNiftiFile(file);
        console.log("Received slices:", slicesData);
        console.log("Number of slices:", slicesData.length);
        // 為每個切片添加原始文件名
        const slicesWithName = slicesData.map((blob, index) => {
          // 創建新的 File 對象，保留原始文件名但添加切片編號
          return new File(
            [blob],
            `${file.name.split(".")[0]}_slice_${index}.png`,
            {
              type: "image/png",
            }
          );
        });
        setSlices(slicesWithName);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("處理檔案時發生錯誤");
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.log("Regular image file, creating preview URL");
    }

    console.log("Switching to select tab");
    setActiveTab("select");
  }, []);

  const handleModelSelect = useCallback((model) => {
    setSelectedModel(model);
  }, []);

  const handleSliceSelect = useCallback((slice) => {
    setSelectedSlice(slice);
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (!selectedSlice || !selectedModel) return;

    setIsAnalyzing(true);

    try {
      console.log("Starting analysis...");
      const analysisData = await analyzeImage(selectedSlice, selectedModel);
      console.log("Analysis result:", analysisData);

      setAnalysisResult(analysisData);

      // 直接傳遞 selectedSlice (它應該是一個 Blob 或 File 對象)
      setImageUrls((prev) => ({
        ...prev,
        original: selectedSlice,
        analyzed: selectedSlice, // 如果後端回傳了處理後的圖片，這裡應該用處理後的圖片
      }));

      setActiveTab("results");
    } catch (error) {
      toast({
        title: "分析失敗",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedSlice, selectedModel, toast, setActiveTab]);

  const handleRecordSelect = ({ imageFile, analysisResult, modelName }) => {
    setSelectedFile(imageFile);
    setSelectedSlice(imageFile); // 如果是處理切片的情況，可能需要調整
    setAnalysisResult(analysisResult);
    setSelectedModel(modelName);

    setImageUrls((prev) => ({
      ...prev,
      original: URL.createObjectURL(imageFile),
      analyzed: URL.createObjectURL(imageFile), // 如果有分析後的圖片，使用分析後的圖片
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航欄 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Logo 和標題區域 */}
              <div className="flex items-center">
                <div className="relative h-8 w-8 mr-2">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 hidden md:block">
                  椎骨影像分析系統
                </h1>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800">
                <div className="text-xs">逢甲通訊</div>
                <div className="h-px bg-blue-200 my-0.5"></div>
                <div className="text-xs">台中榮總</div>
              </div>
              <div className="hidden md:block">
                <HealthCheck />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <VersionInfo />
              <IssueReport
                currentImage={selectedFile}
                analysisResult={analysisResult}
              />
              <RecordsDialog
                onRecordSelect={handleRecordSelect}
                setActiveTab={setActiveTab}
              />
              <Settings />
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                影像分析介面
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="upload">上傳檔案</TabsTrigger>
                  <TabsTrigger value="select" disabled={!selectedFile}>
                    選擇切片
                  </TabsTrigger>
                  <TabsTrigger value="results" disabled={!analysisResult}>
                    分析結果
                  </TabsTrigger>
                </TabsList>

                {selectedFile && (
                  <div className="text-sm text-gray-500 flex items-center justify-center">
                    當前檔案：{selectedFile.name}
                  </div>
                )}

                <TabsContent value="upload" className="mt-6">
                  <div className="space-y-6">
                    <FileUpload onFileSelect={handleFileSelect} />
                    <ExampleData onFileSelect={handleFileSelect} />
                    {isProcessing && (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">處理中...</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="select" className="mt-6">
                  <div className="space-y-6">
                    <SliceSelector
                      file={selectedFile}
                      slices={slices}
                      onSliceSelect={handleSliceSelect}
                    />

                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelSelect={handleModelSelect}
                    />

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!selectedSlice || !selectedModel || isAnalyzing}
                      onClick={handleAnalysis}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        "開始分析"
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="results" className="mt-6">
                  <ResultDisplay
                    originalUrl={imageUrls.original}
                    analyzedUrl={imageUrls.analyzed}
                    analysisResult={analysisResult}
                    selectedFile={selectedSlice}
                    modelName={selectedModel}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
