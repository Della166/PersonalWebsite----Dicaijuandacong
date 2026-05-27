import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'fulingchen — AI Engineer & Creator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background:
            'linear-gradient(135deg, #0e1a14 0%, #142220 50%, #1a2a22 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#7fbc8c',
            fontSize: 28,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#7fbc8c',
            }}
          />
          fulingchen.me
        </div>

        {/* Main title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#f0e8d9',
              letterSpacing: -1,
            }}
          >
            AI Engineer
            <br />
            & Creator
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#c6d2cb',
              lineHeight: 1.4,
              maxWidth: 920,
            }}
          >
            10 个含真实代码细节的工业级 AI 项目案例：NL2SQL · DPO Agent · LangExtract RAG · Deep Research · GRPO · VLM RL
          </div>
        </div>

        {/* Bottom tag bar */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            color: '#d4a574',
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: '2px solid rgba(212,165,116,0.4)',
              background: 'rgba(212,165,116,0.10)',
            }}
          >
            LangChain
          </span>
          <span
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: '2px solid rgba(212,165,116,0.4)',
              background: 'rgba(212,165,116,0.10)',
            }}
          >
            DeepSeek
          </span>
          <span
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: '2px solid rgba(212,165,116,0.4)',
              background: 'rgba(212,165,116,0.10)',
            }}
          >
            Qwen
          </span>
          <span
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: '2px solid rgba(127,188,140,0.4)',
              color: '#7fbc8c',
              background: 'rgba(127,188,140,0.10)',
            }}
          >
            10 projects · bilingual
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
