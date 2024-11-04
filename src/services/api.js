// src/services/api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    console.log('Received data:', data);  // 添加日誌

    return data;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};