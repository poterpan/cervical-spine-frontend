// scr/components/FileUpload/utils.js

export const validateFile = (file) => {
    if (!file) return 'No file selected';
  
    const allowedTypes = ['.nii', '.gz', '.dcm', '.jpg', '.jpeg', '.png'];
    const maxSize = 150 * 1024 * 1024; // 50MB
  
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }
  
    if (file.size > maxSize) {
      return 'File size too large. Maximum size is 150MB';
    }
  
    return null;
  };
  