# PersonalWebsite — 项目协作说明

Next.js 16 个人网站 + 内容发布流水线（官网 + 微信公众号，中英双语）。

## 发布流水线：Obsidian → 双语 → 官网 + 公众号

### 源头
用户在 Obsidian vault 的 **`E:\obsidian\dicaijuandacong\_发布\`** 文件夹里写文章。
只有这个文件夹里的 `.md` 会进入发布流程，其它笔记不碰。

### 当用户说「发布《文章标题》」时，按以下步骤执行

1. **读取**：从 `E:\obsidian\dicaijuandacong\_发布\` 找到对应文章。
2. **翻译**：把正文译成中英双语（翻译由 Claude 在对话内完成，不调外部 API）。
3. **生成 mdx**：写入 `src/content/<category>/<slug>.mdx`，frontmatter 需完整：
   - `title` / `title_en`、`excerpt` / `excerpt_en`、`date`、`slug`、`lang: both`
   - `cover`（公众号必需）、`tags`、`category`、`platforms`、`published: true`
   - 参考 `templates/blog.mdx` 与 `src/content/blog/hello-world.mdx`
4. **发布**：运行 `cd e:/project/PersonalWebsite; npm run content:publish <slug>`
   - 上传媒体到 R2 → git push（触发官网部署）→ 导出各平台
   - 若 `platforms` 含 `wechat`，自动推送到公众号**草稿箱**
5. **存档**：把原文从 `_发布\` 移到 `_发布\已发布\`。
6. **回报**：给出官网链接 + 提示用户去公众号后台草稿箱审核群发。

### 关键脚本

| 命令 | 作用 |
|------|------|
| `npm run content:publish <slug>` | 全流程：媒体上传 + 部署官网 + 导出 + 公众号草稿 |
| `npm run publish:wechat <slug>` | 只推送公众号草稿箱 |
| `npm run content:export <slug>` | 只生成各平台导出文件到 `dist/` |
| `npm run content:list` | 列出所有内容及状态 |

新增/改动的脚本：
- `scripts/utils/wechat-api.ts` — 公众号 API 客户端（token / 图片上传 / draft/add）
- `scripts/wechat-publish.ts` — 推送草稿箱 CLI
- `scripts/exporters/wechat.ts` — 导出 `buildWechatHtml()`，文件导出与 API 推送共用

### 环境变量（`.env.local`，已 gitignore）

`WECHAT_APP_ID` / `WECHAT_APP_SECRET`、`R2_*`、`SITE_URL`。

### 公众号 API 限制（务必注意）

- `draft/add` 需要**已认证的服务号 / 订阅号**；未认证个人订阅号无 API 权限
  （errcode 48001）。那种情况退回到 HTML 复制粘贴流程（`dist/wechat/*.html`）。
- 跑脚本的电脑**公网 IP 必须在公众号后台 IP 白名单**里（errcode 40164）。
- 草稿不会自动群发 —— 用户在公众号后台审核后手动群发。
