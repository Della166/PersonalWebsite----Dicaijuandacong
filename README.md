# Personal Website

科技感暖绿色调双语个人网站，基于 Next.js 15 + TypeScript + Tailwind CSS。支持 MDX 本地写作与 Notion CMS，一键发布到网站并导出到微信公众号 / 小红书 / 抖音等平台。

## 技术栈

- **框架**: Next.js 15 (App Router) + TypeScript
- **样式**: Tailwind CSS 4 + CSS 变量（暖绿色主题）
- **动画**: Framer Motion
- **国际化**: next-intl（中/英）
- **博客**: MDX + Notion API
- **媒体**: Cloudflare R2（图床）
- **部署**: Vercel

## 开发

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 内容与发布

- `npm run content:new` — 交互式创建新内容（MDX）
- `npm run content:list` — 列出所有内容及发布状态
- `npm run media:upload` — 上传 `_media/` 到 R2，并替换 MDX 中的本地路径
- `npm run content:export [slug] --platform wechat|xiaohongshu|douyin|all` — 导出为各平台格式
- `npm run content:publish [slug]` — 上传媒体 + 导出全平台（可选 git push）

复制 `.env.example` 为 `.env.local` 并填写 R2 / Notion / 微信等变量。
