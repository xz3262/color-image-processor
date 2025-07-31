"use client";

import { useState } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImageSettings {
  width: number;
  height: number;
  quality: number;
  format: string;
  colorMode: string;
  maintainAspectRatio: boolean;
}

interface ProcessedImage {
  url: string;
  settings: ImageSettings;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [settings, setSettings] = useState<ImageSettings>({
    width: 800,
    height: 600,
    quality: 85,
    format: "jpeg",
    colorMode: "rgb",
    maintainAspectRatio: false
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("settings", JSON.stringify(settings));

    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("图片处理失败");
      }

      const data = await response.json();
      setProcessedImage(data);
    } catch (error) {
      console.error("处理错误:", error);
      alert("图片处理失败，请重试");
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement("a");
    link.href = processedImage.url;
    link.download = `processed-image.${settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">图片处理工具</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>上传图片</CardTitle>
              <CardDescription>选择一张图片进行处理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-600">
                      点击或拖拽上传图片
                    </span>
                  </label>
                </div>

                {preview && (
                  <div className="mt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="预览"
                      className="w-full h-64 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>调整设置</CardTitle>
              <CardDescription>自定义图片参数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">宽度 (px)</Label>
                    <input
                      id="width"
                      type="number"
                      value={settings.width}
                      onChange={(e) => setSettings({...settings, width: parseInt(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">高度 (px)</Label>
                    <input
                      id="height"
                      type="number"
                      value={settings.height}
                      onChange={(e) => setSettings({...settings, height: parseInt(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="quality">质量 (%)</Label>
                  <input
                    id="quality"
                    type="range"
                    min="1"
                    max="100"
                    value={settings.quality}
                    onChange={(e) => setSettings({...settings, quality: parseInt(e.target.value)})}
                    className="w-full mt-1"
                  />
                  <span className="text-sm text-gray-600">{settings.quality}%</span>
                </div>

                <div>
                  <Label htmlFor="format">输出格式</Label>
                  <Select
                    value={settings.format}
                    onValueChange={(value) => setSettings({...settings, format: value})}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="colorMode">颜色模式</Label>
                  <Select
                    value={settings.colorMode}
                    onValueChange={(value) => setSettings({...settings, colorMode: value})}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rgb">RGB</SelectItem>
                      <SelectItem value="grayscale">灰度</SelectItem>
                      <SelectItem value="cmyk">CMYK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aspectRatio"
                    checked={settings.maintainAspectRatio}
                    onChange={(e) => setSettings({...settings, maintainAspectRatio: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="aspectRatio">保持原始宽高比</Label>
                </div>

                <Button
                  onClick={processImage}
                  disabled={!selectedFile || processing}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    "处理图片"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {processedImage && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>处理结果</CardTitle>
              <CardDescription>
                尺寸: {processedImage.settings.width} x {processedImage.settings.height} | 
                格式: {processedImage.settings.format.toUpperCase()} | 
                颜色模式: {processedImage.settings.colorMode.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={processedImage.url}
                  alt="处理后的图片"
                  className="w-full h-auto rounded-lg"
                />
                <Button onClick={downloadImage} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  下载图片
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}