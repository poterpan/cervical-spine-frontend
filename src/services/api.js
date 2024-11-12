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
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
};

export const processNiftiFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${getApiUrl()}/process-file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Processing failed');
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
  formData.append('model', model);

  try {
    console.log('Sending request to:', `${getApiUrl()}/analyze`);
    
    const response = await fetch(`${getApiUrl()}/analyze`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    const data = await response.json();
    console.log('Received data:', data);

    return data;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};
