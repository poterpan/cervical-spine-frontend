// types/storage.ts
export interface AnalysisRecord {
    id: string;                    // 唯一識別符
    timestamp: string;             // 分析時間
    imageName: string;             // 原始圖片名稱
    imageData: string;             // Base64 編碼的圖片數據
    model: string;                 // 使用的模型
    analysisResult: any;           // 分析結果
    notes?: string;               // 可選的註記
  }
  
  export interface ExportData {
    version: string;              // 導出數據的版本號
    exportDate: string;          // 導出時間
    records: AnalysisRecord[];   // 分析記錄數組
  }