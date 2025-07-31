# 图片处理工具

一个基于 Next.js 15 和 Claude AI 的智能图片处理工具，可以自动调整图片的尺寸、分辨率和颜色模式。

## 功能特点

- 🖼️ **智能图片分析**：使用 Claude API 分析图片内容并提供最佳处理建议
- 📐 **自定义尺寸**：自由调整图片宽度和高度
- 🎨 **颜色模式转换**：支持 RGB、灰度、CMYK 模式
- 📦 **多格式输出**：支持 JPEG、PNG、WebP 格式
- 💾 **历史记录**：自动保存处理记录（需配置数据库）
- 🚀 **Vercel 部署优化**：完全适配 Vercel 平台

## 技术栈

- **前端**: Next.js 15.4.5, TypeScript 5, React 19.1.0
- **UI**: shadcn/ui, Tailwind CSS 4
- **图片处理**: Sharp
- **AI**: Claude 3.5 Sonnet API
- **数据库**: Vercel Postgres（可选）

## 本地开发

1. 克隆项目
```bash
git clone [your-repo-url]
cd color
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env.local` 文件：
```env
CLAUDE_API_KEY=your_claude_api_key_here
```

4. 运行开发服务器
```bash
npm run dev
```

5. 打开 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `CLAUDE_API_KEY`: Claude API 密钥
   - 数据库会自动配置（如需要）

## 环境变量说明

- `CLAUDE_API_KEY`: 必需，Claude API 密钥
- `POSTGRES_*`: 可选，Vercel Postgres 数据库连接（自动配置）

## 错误处理

应用已针对常见问题进行了优化：
- ✅ JSON 解析错误处理
- ✅ 图片格式自动检测
- ✅ API 错误降级处理
- ✅ 数据库连接可选

## License

MIT