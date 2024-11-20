// components/VersionInfo/index.js
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

const VersionInfo = () => {
  const versionDetails = {
    systemVersion: "1.0.0",
    modelVersions: {
      "YOLO v5": "mAP 87.2%",
      "YOLO v8": "mAP 89.2%",
      "YOLO v11": "mAP 90.5%",
      "Mask R-CNN": "mAP 70.4%",
    },
    lastUpdated: "2024-11-20",
    features: [
      "支援多種醫學影像格式",
      "整合多種深度學習模型",
      "自動化椎體角度測量",
      "即時分析結果展示",
    ],
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          版本資訊
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">
            系統版本資訊
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-500">系統版本</h3>
            <p className="text-sm">v{versionDetails.systemVersion}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-500">模型資訊</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(versionDetails.modelVersions).map(
                ([model, version]) => (
                  <div key={model} className="text-sm">
                    <span className="font-medium">{model}: </span>
                    <span>{version}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-500">最後更新</h3>
            <p className="text-sm">{versionDetails.lastUpdated}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-500">系統功能</h3>
            <ul className="list-disc list-inside text-sm">
              {versionDetails.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-gray-500">
              Powered by{" "}
              <span className="font-medium">
                F<span className="text-gray-400">eng</span>{" "}
                C<span className="text-gray-400">hia</span>{" "}
                U<span className="text-gray-400">niversity</span>
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionInfo;
