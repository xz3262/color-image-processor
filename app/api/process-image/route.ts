import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const settingsStr = formData.get("settings") as string;
    const settings = JSON.parse(settingsStr);

    if (!file) {
      return NextResponse.json({ error: "未找到图片文件" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 先使用 Claude API 分析图片内容
    const base64Image = buffer.toString("base64");
    const fileType = file.type || 'image/jpeg';
    
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: `你是一个专业的图像分析助手。请分析用户上传的图片，并根据图片内容提供最佳的处理建议。
请务必按照以下JSON格式回复，不要包含其他内容：
{
  "contentType": "图片的主要内容类型（如：人物、风景、产品、文档等）",
  "suggestedSettings": {
    "width": 建议的宽度,
    "height": 建议的高度,
    "quality": 建议的质量（1-100）,
    "format": "建议的格式（jpeg/png/webp）",
    "colorMode": "建议的颜色模式（rgb/grayscale/cmyk）"
  },
  "reason": "为什么这些设置适合这张图片"
}`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: normalizeMediaType(fileType),
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: "请分析这张图片并提供最佳的处理建议。只返回JSON格式，不要包含其他内容。"
              }
            ],
          },
        ],
      });

      // 提取JSON响应
      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log("Claude 分析结果:", analysis);
        
        // 如果用户没有自定义设置，使用 Claude 的建议
        if (settings.width === 800 && settings.height === 600) {
          settings.width = analysis.suggestedSettings.width;
          settings.height = analysis.suggestedSettings.height;
        }
      }
    } catch (claudeError) {
      console.error("Claude API 错误:", claudeError);
      // 继续处理，即使 Claude API 失败
    }

    // 使用 sharp 处理图片
    let sharpInstance = sharp(buffer);

    // 调整尺寸
    sharpInstance = sharpInstance.resize(settings.width, settings.height, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // 颜色模式转换
    if (settings.colorMode === "grayscale") {
      sharpInstance = sharpInstance.grayscale();
    }

    // 设置输出格式和质量
    let outputBuffer: Buffer;
    
    switch (settings.format) {
      case "png":
        outputBuffer = await sharpInstance.png({ quality: settings.quality }).toBuffer();
        break;
      case "webp":
        outputBuffer = await sharpInstance.webp({ quality: settings.quality }).toBuffer();
        break;
      case "jpeg":
      default:
        outputBuffer = await sharpInstance.jpeg({ quality: settings.quality }).toBuffer();
        break;
    }

    // 转换为 base64
    const base64Output = outputBuffer.toString("base64");
    const dataUrl = `data:image/${settings.format};base64,${base64Output}`;

    // 尝试保存到数据库（如果配置了）
    try {
      const { saveImageRecord } = await import("@/lib/db");
      await saveImageRecord(file.name, dataUrl, settings);
    } catch (dbError) {
      console.log("数据库保存跳过:", dbError);
    }

    return NextResponse.json({
      url: dataUrl,
      settings: settings,
    });

  } catch (error) {
    console.error("处理图片时出错:", error);
    return NextResponse.json(
      { error: "处理图片失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}

function normalizeMediaType(mimeType: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  const normalizedType = mimeType.toLowerCase();
  
  if (normalizedType.includes('jpeg') || normalizedType.includes('jpg')) {
    return 'image/jpeg';
  } else if (normalizedType.includes('png')) {
    return 'image/png';
  } else if (normalizedType.includes('gif')) {
    return 'image/gif';
  } else if (normalizedType.includes('webp')) {
    return 'image/webp';
  }
  
  return 'image/jpeg'; // 默认值
}