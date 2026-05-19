/**
 * WeChat Official Account API client.
 *
 * Covers the minimal surface needed to push an article into the
 * draft box (草稿箱): access token, image upload, and draft/add.
 *
 * Requires WECHAT_APP_ID / WECHAT_APP_SECRET in .env.local, and the
 * caller's public IP must be in the account's IP whitelist
 * (公众号后台 → 设置与开发 → 基本配置 → IP白名单).
 */
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const API_BASE = 'https://api.weixin.qq.com/cgi-bin';
const CACHE_DIR = path.join(process.cwd(), 'scripts', '.cache');
const TOKEN_CACHE = path.join(CACHE_DIR, 'wechat-token.json');

interface TokenCache {
  access_token: string;
  expires_at: number; // epoch ms
}

interface WechatError {
  errcode?: number;
  errmsg?: string;
}

/** Human-friendly hint for the most common WeChat error codes. */
function errorHint(errcode?: number): string {
  switch (errcode) {
    case 40164:
    case 9103001:
      return ' → 当前公网 IP 不在白名单。请到 公众号后台 → 设置与开发 → 基本配置 → IP白名单 添加本机公网 IP。';
    case 48001:
      return ' → API 未授权。draft/add 需要 已认证的服务号或订阅号；未认证的个人订阅号无法用 API 发布。';
    case 41001:
    case 42001:
      return ' → access_token 失效，已自动清除缓存，请重试。';
    default:
      return '';
  }
}

function assertOk(json: WechatError, label: string): void {
  if (json.errcode && json.errcode !== 0) {
    // Drop a possibly-stale token so the next run re-fetches.
    if (json.errcode === 41001 || json.errcode === 42001) {
      try { fs.rmSync(TOKEN_CACHE, { force: true }); } catch { /* ignore */ }
    }
    throw new Error(
      `WeChat ${label} 失败: errcode=${json.errcode} ${json.errmsg ?? ''}${errorHint(json.errcode)}`
    );
  }
}

/** Get a valid access_token, using a small on-disk cache (token TTL ~7200s). */
export async function getAccessToken(): Promise<string> {
  if (fs.existsSync(TOKEN_CACHE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(TOKEN_CACHE, 'utf-8')) as TokenCache;
      if (cached.expires_at > Date.now() + 60_000) return cached.access_token;
    } catch {
      /* corrupt cache — fall through and refetch */
    }
  }

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error('缺少 WECHAT_APP_ID / WECHAT_APP_SECRET，请在 .env.local 中配置。');
  }

  const url = `${API_BASE}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const res = await fetch(url);
  const json = (await res.json()) as WechatError & { access_token?: string; expires_in?: number };

  if (!json.access_token) {
    throw new Error(
      `获取 WeChat access_token 失败: errcode=${json.errcode} ${json.errmsg ?? ''}${errorHint(json.errcode)}`
    );
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    TOKEN_CACHE,
    JSON.stringify({
      access_token: json.access_token,
      expires_at: Date.now() + (json.expires_in ?? 7200) * 1000,
    } satisfies TokenCache)
  );
  return json.access_token;
}

/** Internal: POST a multipart `media` upload to an endpoint. */
async function uploadMultipart(
  pathAndQuery: string,
  buffer: Buffer,
  filename: string
): Promise<Record<string, unknown>> {
  const token = await getAccessToken();
  const sep = pathAndQuery.includes('?') ? '&' : '?';
  const form = new FormData();
  form.append('media', new Blob([new Uint8Array(buffer)]), filename);

  const res = await fetch(`${API_BASE}/${pathAndQuery}${sep}access_token=${token}`, {
    method: 'POST',
    body: form,
  });
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Upload a permanent image material. Returns its `media_id`, which is
 * what draft/add needs for the article cover (`thumb_media_id`).
 */
export async function uploadPermanentImage(buffer: Buffer, filename: string): Promise<string> {
  const json = await uploadMultipart('material/add_material?type=image', buffer, filename);
  assertOk(json, 'add_material(封面图)');
  const mediaId = json.media_id as string | undefined;
  if (!mediaId) throw new Error(`add_material 未返回 media_id: ${JSON.stringify(json)}`);
  return mediaId;
}

/**
 * Upload an inline content image. Returns an mp.weixin URL safe to embed
 * in article HTML (external image URLs get stripped on group-send).
 */
export async function uploadContentImage(buffer: Buffer, filename: string): Promise<string> {
  const json = await uploadMultipart('media/uploadimg', buffer, filename);
  assertOk(json, 'uploadimg(正文图片)');
  const imgUrl = json.url as string | undefined;
  if (!imgUrl) throw new Error(`uploadimg 未返回 url: ${JSON.stringify(json)}`);
  return imgUrl;
}

export interface DraftArticle {
  title: string;
  author?: string;
  digest?: string;
  /** Article body as inline-styled HTML. */
  content: string;
  /** "阅读原文" target URL — used for the website permalink. */
  contentSourceUrl?: string;
  /** media_id of a permanent image material (the cover). */
  thumbMediaId: string;
}

/** Create a draft in the account's draft box. Returns the draft media_id. */
export async function addDraft(article: DraftArticle): Promise<string> {
  const token = await getAccessToken();
  const body = {
    articles: [
      {
        title: article.title.slice(0, 64),
        author: (article.author ?? '').slice(0, 8),
        digest: (article.digest ?? '').slice(0, 120),
        content: article.content,
        content_source_url: article.contentSourceUrl ?? '',
        thumb_media_id: article.thumbMediaId,
        need_open_comment: 1,
        only_fans_can_comment: 0,
      },
    ],
  };

  const res = await fetch(`${API_BASE}/draft/add?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as WechatError & { media_id?: string };
  assertOk(json, 'draft/add');
  if (!json.media_id) throw new Error(`draft/add 未返回 media_id: ${JSON.stringify(json)}`);
  return json.media_id;
}
