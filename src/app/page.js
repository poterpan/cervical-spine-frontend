"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ModelSelector from "@/components/ModelSelector";
import ResultDisplay from "@/components/ResultDisplay";
import { analyzeImage } from "@/services/api";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
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

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleModelSelect = useCallback((model) => {
    setSelectedModel(model);
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (!selectedFile || !selectedModel) return;

    setIsAnalyzing(true);

    try {
      console.log("Starting analysis...");
      const analysisData = await analyzeImage(selectedFile, selectedModel);
      console.log("Analysis result:", analysisData);

      // 設置分析結果
      setAnalysisResult(analysisData);

      // 更新圖像 URL
      urlsRef.current.analyzed = URL.createObjectURL(selectedFile); // 臨時使用原圖
      setImageUrls((prev) => ({
        ...prev,
        analyzed: urlsRef.current.analyzed,
      }));

      setActiveTab("results");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile, selectedModel]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">上傳檔案</TabsTrigger>
                <TabsTrigger value="results" disabled={!analysisResult}>
                  分析結果
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <div className="space-y-6">
                  <FileUpload onFileSelect={handleFileSelect} />

                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelSelect={handleModelSelect}
                  />

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!selectedFile || !selectedModel || isAnalyzing}
                    onClick={handleAnalysis}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
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
                  analysisResult={analysisResult} // 確保這個值存在
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
