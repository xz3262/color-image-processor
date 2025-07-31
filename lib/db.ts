import { sql } from "@vercel/postgres";

export interface ImageRecord {
  id: string;
  originalName: string;
  processedUrl: string;
  settings: {
    width: number;
    height: number;
    quality: number;
    format: string;
    colorMode: string;
  };
  createdAt: Date;
}

export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        processed_url TEXT NOT NULL,
        settings JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("数据库表初始化成功");
  } catch (error) {
    console.error("数据库初始化错误:", error);
    // 在开发环境中，如果没有配置数据库，不要抛出错误
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export async function saveImageRecord(
  originalName: string,
  processedUrl: string,
  settings: ImageRecord['settings']
) {
  try {
    const result = await sql`
      INSERT INTO images (original_name, processed_url, settings)
      VALUES (${originalName}, ${processedUrl}, ${JSON.stringify(settings)})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("保存图片记录错误:", error);
    // 在开发环境中，如果数据库未配置，返回模拟数据
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: Date.now(),
        original_name: originalName,
        processed_url: processedUrl,
        settings: settings,
        created_at: new Date()
      };
    }
    throw error;
  }
}

export async function getRecentImages(limit = 10) {
  try {
    const result = await sql`
      SELECT * FROM images
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error("获取图片记录错误:", error);
    // 在开发环境中，如果数据库未配置，返回空数组
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    throw error;
  }
}