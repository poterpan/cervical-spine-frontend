// components/IssueReport/index.js
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reportIssue } from "@/services/api";

const IssueReport = ({ currentImage, analysisResult }) => {
  const [description, setDescription] = useState("");
  const [identity, setIdentity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  // 驗證表單
  useEffect(() => {
    setIsValid(description.trim().length > 0);
  }, [description]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "請填寫問題描述",
        description: "問題描述為必填欄位",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 由於後端API尚未建立，直接拋出錯誤
      // throw new Error('API not implemented');

      // 當後端API建立後，可以取消註釋下面的代碼
      await reportIssue(description, identity, currentImage, analysisResult);
      toast({
        title: "回報成功",
        description: "我們已收到您的回報，感謝您的協助。",
      });
      setDescription("");
      setIdentity("");
      setOpen(false);
    } catch (error) {
      console.error("Report submission error:", error);
      toast({
        title: "回報失敗",
        description: `請稍後再試或聯繫系統管理員。\n錯誤訊息：${
          error.message || "未知錯誤"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          問題回報
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">問題回報</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 身份欄位 */}
          <div className="grid w-full gap-1.5">
            <Label
              htmlFor="identity"
              className="text-sm font-medium flex items-center"
            >
              聯絡資訊
              <span className="text-xs text-gray-500 ml-2">(選填)</span>
            </Label>
            <Input
              id="identity"
              placeholder="請輸入您的姓名或 Email"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className="max-w-[400px]"
            />
            <span className="text-xs text-gray-500">
              填寫聯絡資訊可以讓我們在需要時與您聯繫，以更好地解決問題
            </span>
          </div>

          {/* 問題描述欄位 */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              問題描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="請詳細描述您遇到的問題"
              className="min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            {!isValid && description.length > 0 && (
              <span className="text-xs text-red-500">請輸入有效的問題描述</span>
            )}
          </div>

          {/* 附加檔案提示 */}
          {(currentImage || analysisResult) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">將自動附加：</Label>
              <ul className="text-sm text-gray-500 list-disc list-inside">
                {currentImage && <li>當前分析影像</li>}
                {analysisResult && <li>分析結果數據</li>}
              </ul>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>系統將自動記錄回報時間，以協助我們更好地追蹤和解決問題。</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                回報中...
              </>
            ) : (
              "送出回報"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IssueReport;
