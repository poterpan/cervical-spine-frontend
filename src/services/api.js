// services/api.js

const getApiUrl = () => {
  // 優先使用全局變數
  if (window.API_URL) {
    return window.API_URL;
  }
  // 其次使用 localStorage
  const savedUrl = localStorage.getItem('apiUrl');
  if (savedUrl) {
    return savedUrl;
  }
  // 最後使用環境變數或預設值
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.panspace.me:8001';
};

export const processNiftiFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${getApiUrl()}/process-file`, {
      method: 'POST',
      body: formData,
      mode: 'cors',  // 明確指定CORS模式
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Processing failed');
    }

    const data = await response.json();
    console.log('Received slices data:', data);

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

export const analyzeImage = async (file, model) => {
  const formData = new FormData();
  formData.append('file', file);
  if (model) {
    formData.append('model', model);
  }

  try {
    console.log('Sending request to:', `${getApiUrl()}/analyze/spine`);  // 更新端點路徑
    
    const response = await fetch(`${getApiUrl()}/analyze/spine`, {  // 更新端點路徑
      method: 'POST',
      body: formData,
      mode: 'cors',  // 明確指定CORS模式
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.error || 'Analysis failed');
    }

    const data = await response.json();
    console.log('Received data:', data);

    return data;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};

export const reportIssue = async (description, identity, image, analysisResult) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('timestamp', new Date().toISOString());
  
  if (identity) {
    formData.append('identity', identity);
  }
  
  if (image) {
    formData.append('image', image);
  }
  
  if (analysisResult) {
    formData.append('analysisResult', JSON.stringify(analysisResult));
  }

  try {
    const response = await fetch(`${getApiUrl()}/report-issue`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Report submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Issue report error:', error);
    throw error;
  }
};