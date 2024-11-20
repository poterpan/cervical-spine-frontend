// components/ExampleData/index.js
import { Button } from "@/components/ui/button";
import { Download, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ExampleData = ({ onFileSelect }) => {
  const { toast } = useToast();
  const EXAMPLE_FILENAME = 'sub-verse076_ct.nii.gz';

  // 下載範例資料
  const handleDownload = async () => {
    try {
      const response = await fetch(`/examples/${EXAMPLE_FILENAME}`);
      const blob = await response.blob();
      
      // 創建下載連結
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = EXAMPLE_FILENAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "下載成功",
        description: "範例 NIfTI 檔案已成功下載",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "下載失敗",
        description: "無法下載範例檔案，請稍後再試",
        variant: "destructive",
      });
    }
  };

  // 直接載入範例資料
  const handleLoadExample = async () => {
    try {
      const response = await fetch(`/examples/${EXAMPLE_FILENAME}`);
      const blob = await response.blob();
      // 注意：要保持 .nii.gz 的 MIME type
      const file = new File([blob], EXAMPLE_FILENAME, { 
        type: 'application/x-gz' 
      });
      
      onFileSelect(file);
      
      toast({
        title: "載入成功",
        description: "範例資料已成功載入，正在處理 NIfTI 檔案...",
      });
    } catch (error) {
      console.error('Load error:', error);
      toast({
        title: "載入失敗",
        description: "無法載入範例檔案，請稍後再試",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="mb-3">
        <h3 className="text-sm font-medium">使用範例資料</h3>
        <p className="text-sm text-gray-500 mt-1">
          提供 NIfTI 格式的椎骨 CT 掃描資料，可直接下載或載入使用
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          onClick={handleDownload}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>下載範例檔案</span>
        </Button>
        <Button
          variant="outline"  // 使用不同的變體來突出此操作
          onClick={handleLoadExample}
          className="flex items-center space-x-2"
        >
          <FileImage className="h-4 w-4" />
          <span>直接使用範例</span>
        </Button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        檔案名稱: {EXAMPLE_FILENAME}
      </div>
    </div>
  );
};

export default ExampleData;