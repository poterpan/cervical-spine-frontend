// components/RecordsDialog/index.js
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  History,
  Save,
  Upload,
  Download,
  Trash2,
  Database,
} from "lucide-react";
import { storageService } from "@/services/storageService";

const RecordsDialog = ({ onRecordSelect, setActiveTab }) => {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // 當對話框開啟時載入記錄
  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const loadedRecords = await storageService.getAllRecords();
      setRecords(loadedRecords);
    } catch (error) {
      toast({
        title: "載入失敗",
        description: "無法載入分析記錄",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除單條記錄
  const handleDelete = async (recordId) => {
    try {
      await storageService.deleteRecord(recordId);
      toast({
        title: "刪除成功",
        description: "記錄已成功刪除",
      });
      await loadRecords(); // 重新載入記錄
    } catch (error) {
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await storageService.clearAllRecords();
      toast({
        title: "清空成功",
        description: "所有記錄已被清空",
      });
      await loadRecords(); // 重新載入記錄
    } catch (error) {
      toast({
        title: "清空失敗",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      await storageService.exportRecords();
      toast({
        title: "導出成功",
        description: "分析記錄已成功導出",
      });
    } catch (error) {
      toast({
        title: "導出失敗",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      await storageService.importRecords(file);
      toast({
        title: "導入成功",
        description: "分析記錄已成功導入",
      });
      // 重新載入記錄
      loadRecords();
    } catch (error) {
      toast({
        title: "導入失敗",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
    }
  };

  // 當對話框開啟時載入記錄
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen) {
      loadRecords();
    }
  };

  const handleRecordClick = async (record) => {
    try {
      // 將 base64 圖片數據轉換回 File 對象
      const imageFile = await storageService.base64ToFile(
        record.imageData,
        record.imageName
      );

      // 調用傳入的回調函數，更新主頁面的狀態
      onRecordSelect({
        imageFile,
        analysisResult: record.analysisResult,
        modelName: record.model,
      });

      // 關閉對話框
      setOpen(false);

      // 切換到結果頁面
      setActiveTab("results");

      toast({
        title: "載入成功",
        description: "已恢復先前的分析結果",
      });
    } catch (error) {
      toast({
        title: "載入失敗",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>分析記錄</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>分析記錄管理</DialogTitle>
          <DialogDescription>查看、導出或導入您的分析記錄</DialogDescription>
        </DialogHeader>

        {/* 工具列 - 調整布局 */}
        <div className="flex justify-between items-center py-4 border-b">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>導出記錄</span>
            </Button>

            <div className="relative group">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Button
                variant="outline"
                className="flex items-center space-x-2 pointer-events-none group-hover:bg-accent group-hover:text-accent-foreground"
                // 添加 pointer-events-none 和 group hover 效果
              >
                <Upload className="h-4 w-4" />
                <span>導入記錄</span>
              </Button>
            </div>
          </div>

          {/* 清空資料庫按鈕 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>清空記錄</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>確認清空所有記錄？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作將永久删除所有分析記錄，無法恢復。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  確認清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* 記錄列表 */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <span>載入中...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              尚無分析記錄
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 flex items-start space-x-4 cursor-pointer"
                  onClick={() => handleRecordClick(record)}
                >
                  {/* 縮圖 */}
                  <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={record.imageData}
                      alt="Analysis thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 記錄信息 */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{record.imageName}</h3>
                        <p className="text-sm text-gray-500">
                          分析時間:{" "}
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          使用模型: {record.model}
                        </p>
                      </div>
                      {/* 删除按鈕 */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()} // 阻止冒泡
                          >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              確認刪除此記錄？
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              此操作將永久刪除該分析記錄，無法恢復。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(record.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              確認刪除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordsDialog;
