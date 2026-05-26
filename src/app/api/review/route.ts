import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CHARS = 4000;
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const TIMEOUT_MS = 30_000;

// Best-effort, per-instance rate limit (serverless instances are short-lived,
// so this only throttles a single warm instance — enough to blunt casual abuse
// of the owner's DeepSeek credit without a heavy dependency).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const SYSTEM_PROMPT = `你是一位专业的中文文档审核专家。请只识别文本中真正的问题，返回结构化 JSON。

允许的问题类型（type 字段必须是其一）：
- "Grammar & Spelling"：真正的错别字、语病、标点错误、语序/搭配错误。
- "Definitive Language"：在正式承诺/保证语境中使用「必须/保证/一定/完全/绝对/务必/无条件」等过度确定的绝对化表述。

必须忽略（绝对不是问题）：
- 列表序号与编号：1、2、(1)、(一)、①、a、A 等，以及孤立的数字/字母。
- 表单占位符：____年__月__日、___元、空白下划线等待填写字段。
- 正常的专有名词、机构名、法律术语。

输出要求：只输出 JSON 对象，形如
{"issues":[{"type":"Grammar & Spelling"|"Definitive Language","text":"问题原文片段","explanation":"为什么是问题","suggested_fix":"修改建议","risk":"高"|"低"}]}
其中 Definitive Language 的 risk 为「高」，Grammar & Spelling 的 risk 为「低」。若没有问题，返回 {"issues":[]}。不要输出任何额外解释。`;

interface ReviewIssue {
  type: string;
  text: string;
  explanation: string;
  suggested_fix: string;
  risk: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'unconfigured', message: 'Document review backend is not configured (missing DEEPSEEK_API_KEY).' },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many requests — please wait a minute and try again.' },
      { status: 429 },
    );
  }

  let text: string;
  try {
    const body = await req.json();
    text = typeof body?.text === 'string' ? body.text : '';
  } catch {
    return NextResponse.json({ error: 'bad_request', message: 'Invalid JSON body.' }, { status: 400 });
  }

  text = text.trim();
  if (!text) {
    return NextResponse.json({ error: 'empty', message: 'No text provided.' }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: 'too_long', message: `Text exceeds ${MAX_CHARS} characters.` },
      { status: 413 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请审核以下文本：\n\n${text}` },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      return NextResponse.json(
        { error: 'upstream', message: `DeepSeek API error (${resp.status}).`, detail: detail.slice(0, 200) },
        { status: 502 },
      );
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '{}';

    let issues: ReviewIssue[] = [];
    try {
      const parsed = JSON.parse(content);
      issues = Array.isArray(parsed?.issues) ? parsed.issues : [];
    } catch {
      return NextResponse.json(
        { error: 'parse', message: 'Model returned unparseable output.' },
        { status: 502 },
      );
    }

    // Normalize / harden the shape so the client can trust it.
    const clean = issues
      .filter((i) => i && typeof i.text === 'string' && i.text.trim())
      .slice(0, 50)
      .map((i) => ({
        type: i.type === 'Definitive Language' ? 'Definitive Language' : 'Grammar & Spelling',
        text: String(i.text).slice(0, 300),
        explanation: String(i.explanation ?? '').slice(0, 300),
        suggested_fix: String(i.suggested_fix ?? '').slice(0, 300),
        risk: i.risk === '高' ? '高' : i.type === 'Definitive Language' ? '高' : '低',
      }));

    return NextResponse.json({
      issues: clean,
      usage: data?.usage ?? null,
      model: MODEL,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json(
      { error: aborted ? 'timeout' : 'internal', message: aborted ? 'Review timed out.' : 'Internal error.' },
      { status: aborted ? 504 : 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
