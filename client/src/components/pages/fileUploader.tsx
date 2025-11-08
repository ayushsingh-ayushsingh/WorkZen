import { useState } from "react";
import { hc } from "hono/client";
import type { AppType } from "../../../../server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader, Upload } from "lucide-react";

const client = hc<AppType>("/");

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload() {
    if (!file) return toast.error("Please select a file first!");

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum allowed size is 30 MB.");
      setFile(null);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let fakeProgress = 0;
      const progressInterval = setInterval(() => {
        fakeProgress += 10;
        setProgress(Math.min(fakeProgress, 90));
      }, 150);

      const response = await client.api.upload.$post({
        json: {
          filename: file.name,
          mimetype: file.type,
          data: base64,
        },
      });

      clearInterval(progressInterval);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setProgress(100);
      toast.success("File uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Upload className="w-6 h-6" /> Upload Any File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept="*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                if (selectedFile.size > MAX_FILE_SIZE) {
                  toast.error("File too large. Maximum allowed size is 30 MB.");
                  e.target.value = ""; // Reset input
                  setFile(null);
                  return;
                }
                setFile(selectedFile);
              } else {
                setFile(null);
              }
            }}
          />

          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: <strong>{file.name}</strong> (
              {(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}

          {progress > 0 && (
            <div className="space-y-1">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                {progress < 100
                  ? `Uploading... ${progress}%`
                  : "Upload complete!"}
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={!file || isUploading}
          >
            {isUploading ? <Loader className="animate-spin" /> : "Upload File"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
