"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ModelSelector from "@/components/ModelSelector";
import ResultDisplay from "@/components/ResultDisplay";
import SliceSelector from "@/components/SliceSelector";
import Settings from "@/components/Settings";
import { analyzeImage, processNiftiFile } from "@/services/api";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
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
        setSlices(slicesData);
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
      console.error("Analysis failed:", error);
      alert(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedSlice, selectedModel]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Settings /> {/* 添加設定按鈕 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              椎骨影像分析系統
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">上傳檔案</TabsTrigger>
                <TabsTrigger value="select" disabled={!selectedFile}>
                  選擇切片
                </TabsTrigger>
                <TabsTrigger value="results" disabled={!analysisResult}>
                  分析結果
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <div className="space-y-6">
                  <FileUpload onFileSelect={handleFileSelect} />
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
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
