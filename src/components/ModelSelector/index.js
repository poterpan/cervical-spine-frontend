// src/components/ModelSelector/index.js
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const models = [
    { id: 'yolov11', name: 'YOLOv11' },
    { id: 'mmdetection', name: 'MMDetection' }
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">選擇模型</h3>
      <div className="grid grid-cols-2 gap-4">
        {models.map(model => (
          <Button
            key={model.id}
            variant={selectedModel === model.id ? 'default' : 'outline'}
            className="p-8 h-auto flex flex-col items-center space-y-2"
            onClick={() => onModelSelect(model.id)}
          >
            <ImageIcon className="h-8 w-8" />
            <span>{model.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;