// services/storageService.js
export const storageService = {
  async saveAnalysis(imageFile, analysisResult, modelName) {
    try {
      // 轉換圖片為 Base64
      const imageData = await this.fileToBase64(imageFile);

      const record = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        imageName: imageFile.name,
        imageData,
        model: modelName,
        analysisResult,
      };

      // 獲取現有記錄
      const records = await this.getAllRecords();
      records.push(record);

      // 儲存到 localStorage
      localStorage.setItem("analysisRecords", JSON.stringify(records));

      return record;
    } catch (error) {
      console.error("Error saving analysis:", error);
      throw error;
    }
  },

  async getAllRecords() {
    try {
      const records = localStorage.getItem("analysisRecords");
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error("Error getting records:", error);
      return [];
    }
  },

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  },

  async base64ToFile(base64Data, filename) {
    try {
      const response = await fetch(base64Data);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      throw error;
    }
  },

  async exportRecords() {
    try {
      const records = await this.getAllRecords();
      const exportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        records,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spine-analysis-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting records:", error);
      throw error;
    }
  },

  async importRecords(file) {
    try {
      const content = await this.readFileContent(file);
      const importData = JSON.parse(content);

      // 驗證導入數據的格式
      if (!this.validateImportData(importData)) {
        throw new Error("Invalid import data format");
      }

      // 合併或覆蓋現有記錄（這裡選擇合併）
      const existingRecords = await this.getAllRecords();
      const mergedRecords = this.mergeRecords(
        existingRecords,
        importData.records
      );

      // 儲存合併後的記錄
      localStorage.setItem("analysisRecords", JSON.stringify(mergedRecords));

      return mergedRecords;
    } catch (error) {
      console.error("Error importing records:", error);
      throw error;
    }
  },

  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  },

  validateImportData(data) {
    return (
      data.version &&
      data.exportDate &&
      Array.isArray(data.records) &&
      data.records.every(
        (record) =>
          record.id &&
          record.timestamp &&
          record.imageName &&
          record.imageData &&
          record.model &&
          record.analysisResult
      )
    );
  },

  mergeRecords(existing, imported) {
    // 使用 Map 來實現基於 ID 的去重合併
    const recordMap = new Map(existing.map((record) => [record.id, record]));

    imported.forEach((record) => {
      recordMap.set(record.id, record);
    });

    return Array.from(recordMap.values());
  },

  async deleteRecord(recordId) {
    try {
      const records = await this.getAllRecords();
      const newRecords = records.filter((record) => record.id !== recordId);
      localStorage.setItem("analysisRecords", JSON.stringify(newRecords));
      return newRecords;
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  },

  async clearAllRecords() {
    try {
      localStorage.removeItem("analysisRecords");
      return [];
    } catch (error) {
      console.error("Error clearing records:", error);
      throw error;
    }
  },
};
