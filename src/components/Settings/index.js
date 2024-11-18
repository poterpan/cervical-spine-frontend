// components/Settings/index.js
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:5000");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 從 localStorage 讀取已保存的 API URL
    const savedUrl = localStorage.getItem("apiUrl");
    if (savedUrl) {
      setApiUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    // 保存到 localStorage
    localStorage.setItem("apiUrl", apiUrl);
    // 更新全局變數
    window.API_URL = apiUrl;
    setOpen(false);
  };

  const handleReset = () => {
    const defaultUrl = "http://127.0.0.1:5000";
    setApiUrl(defaultUrl);
    localStorage.setItem("apiUrl", defaultUrl);
    window.API_URL = defaultUrl;
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4"
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API 設定</DialogTitle>
          <DialogDescription>
            設定後端 API 伺服器位址。如果你不確定這是什麼，請保持預設值。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-url" className="text-right">
              API URL
            </Label>
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="col-span-3"
              placeholder="http://127.0.0.1:5000"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleReset}>
            重設
          </Button>
          <Button onClick={handleSave}>儲存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
