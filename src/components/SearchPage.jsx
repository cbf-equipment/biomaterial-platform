import { useState } from 'react'

const MATERIAL_TYPES = [
  '식물 추출물', '발효 소재', '해양 소재', '곤충 소재', '미생물 소재', '기타'
]

const ANALYSIS_METHODS = [
  'HPLC-PDA', 'HPLC-MS', 'GC-MS', 'UV-Vis', '기타'
]

const QUICK_EXAMPLES = ['호장근', '강황', '오미자', '복분자', '산양삼', '잣나무 수피']

export default function SearchPage({ onSearch, error }) {
  const [material, setMaterial] = useState('')
  const [type, setType] = useState('식물 추출물')
  const [method, setMethod] = useState('HPLC-PDA')
  const [sciName, setSciName] = useState('')
  const [extract, setExtract] = useState('70% EtOH')

  function handleSubmit() {
    if (!material.trim()) return
    onSearch({ material: material.trim(), type, method, sciName, extract })
  }

  return (
    <div style={s.page}>
      {/* 헤더 */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoArea}>
            <div style={s.logoMark}>CBF</div>
            <div>
              <div style={s.orgName}>춘천바이오산업진흥원</div>
              <div style={s.orgSub}>기술개발팀 · 효능평가 및 분석지원</div>
            </div>
          </div>
          <div style={s.headerRight}>
            <span style={s.badge}>3P² AI 분석 플랫폼</span>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <div style={s.hero}>
        <div style={s.heroTag}>Profiling · Proofing · Positioning &nbsp;|&nbsp; Paper · Patent · Product</div>
        <h1 style={s.heroTitle}>바이오 소재 통합 분석</h1>
        <p style={s.heroDesc}>소재명을 입력하면 AI가 성분 프로파일·효능 근거·특허·시판 제품을<br/>자동 수집·분석해 3P² 리포트를 생성합니다.</p>
      </div>

      {/* 입력 카드 */}
      <div style={s.card}>
        <div style={s.cardTitle}>소재 정보 입력</div>

        <div style={s.field}>
          <label style={s.label}>소재명 <span style={s.req}>*</span></label>
          <input
            style={s.input}
            value={material}
            onChange={e => setMaterial(e.target.value)}
            placeholder="예: 호장근, 강황, 오미자..."
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <div style={s.quickRow}>
            {QUICK_EXAMPLES.map(ex => (
              <button key={ex} style={s.quickBtn} onClick={() => setMaterial(ex)}>{ex}</button>
            ))}
          </div>
        </div>

        <div style={s.row}>
          <div style={{ ...s.field, flex: 1 }}>
            <label style={s.label}>소재 유형</label>
            <select style={s.select} value={type} onChange={e => setType(e.target.value)}>
              {MATERIAL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ ...s.field, flex: 1 }}>
            <label style={s.label}>분석법</label>
            <select style={s.select} value={method} onChange={e => setMethod(e.target.value)}>
              {ANALYSIS_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div style={s.row}>
          <div style={{ ...s.field, flex: 1 }}>
            <label style={s.label}>학명 (선택)</label>
            <input style={s.input} value={sciName} onChange={e => setSciName(e.target.value)} placeholder="예: Polygonum cuspidatum" />
          </div>
          <div style={{ ...s.field, flex: 1 }}>
            <label style={s.label}>추출 조건 (선택)</label>
            <input style={s.input} value={extract} onChange={e => setExtract(e.target.value)} placeholder="예: 70% EtOH, 열수..." />
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.submitBtn} onClick={handleSubmit} disabled={!material.trim()}>
          3P² 리포트 생성
        </button>
      </div>

      {/* 분석 항목 안내 */}
      <div style={s.infoGrid}>
        {[
          { color: 'var(--t1)', label: 'TRACK 1', title: 'Profiling · Proofing · Positioning', desc: '실측 성분 프로파일 → 효능 기전 매칭 → 시장 포지션 도출' },
          { color: 'var(--t2)', label: 'TRACK 2', title: 'Paper · Patent · Product', desc: 'PubMed 논문 · KIPRIS 특허 · 네이버쇼핑·식약처 제품 자동 수집' },
          { color: 'var(--ai)', label: 'AI 해석', title: 'Claude AI 근거 연계', desc: '수집 데이터를 AI가 교차 분석해 전략적 시사점 도출' }
        ].map(item => (
          <div key={item.label} style={{ ...s.infoCard, borderTop: `3px solid ${item.color}` }}>
            <div style={{ ...s.infoLabel, color: item.color }}>{item.label}</div>
            <div style={s.infoTitle}>{item.title}</div>
            <div style={s.infoDesc}>{item.desc}</div>
          </div>
        ))}
      </div>

      <footer style={s.footer}>
        춘천바이오산업진흥원 · 기술개발팀 · 본 플랫폼의 AI 해석은 의사결정 보조 참고자료입니다.
      </footer>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  header: { background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '0 24px' },
  headerInner: { maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 },
  logoArea: { display: 'flex', alignItems: 'center', gap: 14 },
  logoMark: { width: 42, height: 42, background: 'var(--t1)', borderRadius: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, letterSpacing: '.05em' },
  orgName: { fontSize: 15, fontWeight: 700 },
  orgSub: { fontSize: 11, color: 'var(--muted)' },
  headerRight: {},
  badge: { fontSize: 11, border: '1px solid var(--accent)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 3, letterSpacing: '.06em' },

  hero: { maxWidth: 860, margin: '0 auto', padding: '52px 24px 32px' },
  heroTag: { fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em', marginBottom: 10 },
  heroTitle: { fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 14 },
  heroDesc: { fontSize: 15, color: 'var(--muted)', lineHeight: 1.8 },

  card: { maxWidth: 860, margin: '0 auto 24px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '32px 36px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' },
  cardTitle: { fontSize: 13, fontWeight: 700, letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 22, textTransform: 'uppercase' },

  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' },
  req: { color: '#c04040' },
  input: { width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '10px 13px', fontSize: 14, background: 'var(--paper)', outline: 'none', color: 'var(--ink)' },
  select: { width: '100%', border: '1px solid var(--line)', borderRadius: 6, padding: '10px 13px', fontSize: 14, background: 'var(--paper)', color: 'var(--ink)', outline: 'none' },
  row: { display: 'flex', gap: 16 },

  quickRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  quickBtn: { fontSize: 12, padding: '4px 11px', border: '1px solid var(--line)', borderRadius: 12, background: '#f4f2ec', color: 'var(--muted)', cursor: 'pointer' },

  error: { background: '#fef0f0', border: '1px solid #f5c0c0', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#b03030', marginBottom: 14 },

  submitBtn: { width: '100%', padding: '14px', background: 'var(--t1)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 700, letterSpacing: '.04em', marginTop: 6, opacity: 1, transition: 'opacity .2s' },

  infoGrid: { maxWidth: 860, margin: '0 auto 32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: '0 24px' },
  infoCard: { background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 6, padding: '18px 20px' },
  infoLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', marginBottom: 6 },
  infoTitle: { fontSize: 13, fontWeight: 700, marginBottom: 7, lineHeight: 1.4 },
  infoDesc: { fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 },

  footer: { textAlign: 'center', padding: '20px', fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--line)', background: 'var(--paper)' }
}
