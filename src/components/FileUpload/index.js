// scr/components/FileUpload/index.js

"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FilePreview from './FilePreview';
import ProgressBar from './ProgressBar';
import { validateFile } from './utils';

const FileUpload = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFile = (selectedFile) => {
    console.log('handleFile called with:', selectedFile);
    const validationError = validateFile(selectedFile);
    if (validationError) {
      console.log('Validation error:', validationError);
      setError(validationError);
      return;
    }

    console.log('File validation passed');
    setError('');
    setFile(selectedFile);
    console.log('Calling onFileSelect');
    onFileSelect(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!file ? (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept=".nii,.gz,.dcm,.jpg,.jpeg,.png"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  上傳醫學影像檔案
                </p>
                <p className="text-sm text-gray-500">
                  將檔案拖放至此處或點擊上傳
                </p>
                <p className="text-xs text-gray-400">
                  CT影像支援 .nii 和 .dcm 文件 切割影像支援 .jpg, .jpeg 和 .png 文件
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <FilePreview file={file} />
          {uploading && <ProgressBar progress={uploadProgress} />}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={removeFile}
          >
            <X className="h-4 w-4 mr-2" />
            Remove File
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
