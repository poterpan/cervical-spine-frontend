import React from 'react';
import { FileIcon } from 'lucide-react';

const FilePreview = ({ file }) => {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <FileIcon className="h-8 w-8 text-gray-400 mr-3" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-sm text-gray-500">
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
};

export default FilePreview;