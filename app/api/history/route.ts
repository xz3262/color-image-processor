import { NextResponse } from "next/server";
import { getRecentImages, initDatabase } from "@/lib/db";

export async function GET() {
  try {
    // 确保数据库已初始化
    await initDatabase();
    
    const images = await getRecentImages(20);
    return NextResponse.json({ images });
  } catch (error) {
    console.error("获取历史记录失败:", error);
    return NextResponse.json(
      { error: "获取历史记录失败", images: [] },
      { status: 200 } // 返回200状态码，避免前端报错
    );
  }
}