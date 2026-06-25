import { useState, useEffect } from 'react'

const STEPS = [
  { label: 'PubMed 논문 검색 중...', color: 'var(--t2)' },
  { label: 'KIPRIS 특허 조회 중...', color: 'var(--t2)' },
  { label: '식약처 원료 DB 확인 중...', color: 'var(--t2)' },
  { label: '네이버 쇼핑 제품 수집 중...', color: 'var(--t2)' },
  { label: 'AI 효능 기전 분석 중...', color: 'var(--ai)' },
  { label: '3P² 리포트 생성 중...', color: 'var(--t1)' },
]

export default function LoadingPage() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 400)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.spinner}>
          <div style={s.spinnerInner} />
        </div>
        <div style={s.title}>분석 중...</div>
        <div style={s.desc}>외부 DB와 AI를 연동해 3P² 리포트를 생성하고 있습니다.</div>

        <div style={s.steps}>
          {STEPS.map((step, i) => (
            <div key={i} style={s.stepRow}>
              <div style={{ ...s.dot, background: i <= current ? step.color : 'var(--line)' }} />
              <span style={{ ...s.stepLabel, color: i <= current ? 'var(--ink)' : 'var(--muted)' }}>
                {step.label}
              </span>
              {i < current && <span style={s.check}>✓</span>}
              {i === current && <span style={{ ...s.check, color: step.color }}>●</span>}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '48px 52px', textAlign: 'center', minWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,.08)' },
  spinner: { width: 48, height: 48, margin: '0 auto 24px', border: '3px solid var(--line)', borderTop: '3px solid var(--t1)', borderRadius: '50%', animation: 'spin .8s linear infinite' },
  spinnerInner: {},
  title: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, marginBottom: 8 },
  desc: { fontSize: 13, color: 'var(--muted)', marginBottom: 32 },
  steps: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 },
  stepRow: { display: 'flex', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, transition: 'background .3s' },
  stepLabel: { fontSize: 13, flex: 1, transition: 'color .3s' },
  check: { fontSize: 12, color: 'var(--t1)', fontWeight: 700 }
}
