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
  const [apiUrl, setApiUrl] = useState("https://api.panspace.me:8001");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem("apiUrl");
    if (savedUrl) {
      setApiUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("apiUrl", apiUrl);
    window.API_URL = apiUrl;
    setOpen(false);
  };

  const handleReset = () => {
    const defaultUrl = "https://api.panspace.me:8001";
    setApiUrl(defaultUrl);
    localStorage.setItem("apiUrl", defaultUrl);
    window.API_URL = defaultUrl;
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="flex items-center">
          <SettingsIcon className="h-5 w-5" />
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
              placeholder="https://api.panspace.me:8001"
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