// components/HealthCheck/index.js
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkHealth } from "@/services/api";


const HealthCheck = () => {
  const [status, setStatus] = useState("unknown");
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleHealthCheck = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      await checkHealth();
      setStatus("healthy");
      toast({
        title: "連線正常",
        description: "後端服務運作中",
        duration: 1000,
      });
    } catch (error) {
      setStatus("error");
      toast({
        title: "連線異常",
        description: "無法連接到後端伺服器",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, toast]);

  useEffect(() => {
    handleHealthCheck();
  }, [handleHealthCheck]);

  // 狀態樣式
  const getStatusStyles = () => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative flex items-center space-x-2 hover:bg-transparent"
      onClick={handleHealthCheck}
      disabled={isChecking}
    >
      {isChecking ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <div className={`h-3 w-3 rounded-full ${getStatusStyles()}`} />
      )}
      <span className="text-xs text-gray-600">
        {isChecking ? "檢查中" : "伺服器狀態"}
      </span>
    </Button>
  );
};

export default HealthCheck;
