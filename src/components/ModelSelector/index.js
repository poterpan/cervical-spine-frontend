// src/components/ModelSelector/index.js
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const models = [
    { id: "yolov5", name: "YOLOv5", description: "快速且準確的目標檢測" },
    { id: "yolov8", name: "YOLOv8", description: "優化的即時檢測性能" },
    { id: "yolov11", name: "YOLOv11 (推薦)", description: "最新的YOLO架構" },
    { id: "mmdetection", name: "MMDetection", description: "多樣化的檢測框架" },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">選擇模型</h3>
      <Card>
      <CardContent className="pt-6">
        <RadioGroup
          value={selectedModel}
          onValueChange={onModelSelect}
          className="grid grid-cols-2 gap-4"
        >
          {models.map((model) => (
            <div key={model.id} className="flex items-center space-x-2">
              <RadioGroupItem value={model.id} id={model.id} />
              <Label htmlFor={model.id} className="flex flex-col">
                <span className="font-medium">{model.name}</span>
                <span className="text-sm text-gray-500">{model.description}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
    </div>
  );
};

export default ModelSelector;