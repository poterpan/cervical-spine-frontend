// src/services/api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

/**
 * 處理 NIFTI/DICOM 文件並獲取切片
 */
export const processNiftiFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('Sending request to:', `${API_URL}/process-file`);
    
    const response = await fetch(`${API_URL}/process-file`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'File processing failed');
    }

    const data = await response.json();
    console.log('Received slices data:', data);

    // 將 base64 圖片數據轉換為 Blob 物件
    return data.slices.map(slice => {
      const base64Data = slice.data.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        byteArrays.push(new Uint8Array(byteNumbers));
      }

      return new Blob(byteArrays, { type: 'image/png' });
    });
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
};

/**
 * 分析圖像並獲取結果
 */
export const analyzeImage = async (file, model) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', model);

  try {
    console.log('Sending request to:', `${API_URL}/analyze`);
    
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    const data = await response.json();
    console.log('Received analysis data:', data);

    return data;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};

/**
 * 將 Blob 轉換為 Base64 字串
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * 檢查文件類型
 */
export const isNiftiOrDicom = (file) => {
  const filename = file.name.toLowerCase();
  return filename.endsWith('.nii') || 
         filename.endsWith('.nii.gz') || 
         filename.endsWith('.dcm');
};