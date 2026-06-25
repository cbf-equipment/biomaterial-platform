const StarBadge = ({ level }) => {
  const stars = '★'.repeat(level) + '☆'.repeat(3 - level)
  const bg = level === 3 ? '#e1f0e7' : level === 2 ? '#fff0e0' : '#f0eef7'
  const color = level === 3 ? '#2a6e3a' : level === 2 ? '#b06010' : '#6b4e9e'
  return <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, fontWeight: 700, background: bg, color, whiteSpace: 'nowrap' }}>근거 {stars}</span>
}

const AIBox = ({ items }) => (
  <div style={{ background: 'var(--ai-bg)', borderLeft: '3px solid var(--ai)', padding: '13px 16px', borderRadius: '0 4px 4px 0', marginTop: 10 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ai)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>◆ AI 해석</div>
    {items.map((item, i) => (
      <div key={i} style={{ fontSize: 12.5, paddingLeft: 15, position: 'relative', marginBottom: i < items.length - 1 ? 8 : 0 }}>
        <span style={{ position: 'absolute', left: 0, color: 'var(--ai)', fontWeight: 700 }}>›</span>
        {item}
      </div>
    ))}
  </div>
)

const SectionTitle = ({ num, ko, en }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 11, marginBottom: 12 }}>
    <span style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{num}</span>
    <span style={{ fontSize: 17, fontWeight: 700 }}>{ko}</span>
    <span style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{en}</span>
  </div>
)

const Tag = ({ children }) => (
  <span style={{ fontSize: 10.5, background: '#f0eee7', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: 10, color: '#4a4843', marginRight: 5, marginTop: 5, display: 'inline-block' }}>{children}</span>
)

const Table = ({ headers, rows, thColor }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, margin: '6px 0' }}>
    <thead>
      <tr>{headers.map((h, i) => (
        <th key={i} style={{ background: thColor + '20', color: thColor, borderBottom: `1.5px solid ${thColor}`, padding: '8px 11px', textAlign: i >= 2 ? 'right' : 'left', fontSize: 11, letterSpacing: '.04em' }}>{h}</th>
      ))}</tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td key={j} style={{ padding: '8px 11px', borderBottom: '1px solid var(--line)', textAlign: j >= 2 ? 'right' : 'left', fontVariantNumeric: 'tabular-nums' }}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

export default function ReportPage({ data, onReset }) {
  const { meta, track1, track2 } = data

  function handlePrint() {
    window.print()
  }

  return (
    <div>
      {/* 인쇄 제외 영역 - 상단 컨트롤 */}
      <div className="no-print" style={s.topBar}>
        <button style={s.backBtn} onClick={onReset}>← 새 분석</button>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{meta.material} · {meta.generatedAt}</div>
        <button style={s.printBtn} onClick={handlePrint}>PDF / 인쇄</button>
      </div>

      {/* 리포트 본문 */}
      <div style={s.sheet}>
        {/* MASTHEAD */}
        <div style={s.masthead}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>춘천바이오산업진흥원</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>기술개발팀 · 효능평가 및 분석지원</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={s.badge}>3P² AI 통합 리포트</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700 }}>소재 통합 해석 리포트</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Profiling · Proofing · Positioning | Paper · Patent · Product</div>
          </div>
        </div>

        {/* META */}
        <div style={s.meta}>
          {[
            ['의뢰 시료', meta.material],
            ['소재 유형', meta.type],
            ['분석법', meta.method],
            ['리포트 번호', meta.reportNo]
          ].map(([k, v]) => (
            <div key={k} style={s.metaCell}>
              <span style={s.metaK}>{k}</span>
              <span style={s.metaV}>{v}</span>
            </div>
          ))}
        </div>

        {/* LEGEND */}
        <div style={s.legend}>
          <span style={s.chip}><span style={{ ...s.dot, background: 'var(--t1)' }} />트랙1 실측 (Profiling·Proofing·Positioning)</span>
          <span style={s.chip}><span style={{ ...s.dot, background: 'var(--t2)' }} />트랙2 조사 (Paper·Patent·Product)</span>
          <span style={s.chip}><span style={{ ...s.dot, background: 'var(--ai)' }} />AI 해석·근거 연계</span>
        </div>

        {/* ── TRACK 1 ── */}
        <div style={{ ...s.trackHeader, background: 'var(--t1)' }}>
          <span style={s.trackLabel}>TRACK 1 — Profiling · Proofing · Positioning</span>
          <span style={s.trackDesc}>실측 분석 데이터 기반 소재 효능 및 시장 포지션 도출</span>
        </div>

        {/* 1. Profiling */}
        <div style={s.section}>
          <SectionTitle num="1" ko="프로파일링" en="Profiling" />
          <p style={s.lead}>의뢰 시료에서 정량된 지표성분 프로파일입니다. <span style={{ color: 'var(--t1)', fontWeight: 600, fontSize: 11 }}>[진흥원 실측 — {meta.method}]</span></p>
          <Table
            headers={['지표성분', '분류', '함량 (mg/g)', 'RT (min)', '상대비 (%)']}
            rows={track1.profiling.map(p => [p.name, p.class, p.amount, p.rt, p.ratio])}
            thColor="var(--t1)"
          />
          <AIBox items={track1.profilingAI} />
        </div>

        {/* 2. Proofing */}
        <div style={s.section}>
          <SectionTitle num="2" ko="효능 검증" en="Proofing" />
          <p style={s.lead}>검출 성분을 문헌·기전 DB와 자동 매칭한 효능 근거입니다. <span style={{ color: 'var(--ai)', fontWeight: 600, fontSize: 11 }}>[AI 해석]</span></p>
          <Table
            headers={['성분', '연계 효능', '작용 기전', '근거 수준']}
            rows={track1.proofing.map(p => [p.compound, p.efficacy, p.mechanism, p.evidence])}
            thColor="var(--t1)"
          />
          <AIBox items={track1.proofingAI} />
        </div>

        {/* 3. Positioning */}
        <div style={s.section}>
          <SectionTitle num="3" ko="포지셔닝" en="Positioning" />
          <p style={s.lead}>식약처 인정원료·유사 제품과 비교한 시장 포지션 제안입니다. <span style={{ color: 'var(--ai)', fontWeight: 600, fontSize: 11 }}>[AI 해석]</span></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
            {track1.positioningCards.map((c, i) => (
              <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '13px 15px', background: '#fff' }}>
                <div style={{ fontSize: 12, color: 'var(--t1)', fontWeight: 700, marginBottom: 7 }}>{c.title}</div>
                <div style={{ fontSize: 12.5 }}>{c.body}</div>
                <div style={{ marginTop: 6 }}>{c.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, background: '#fff', border: '1px dashed var(--ai)', borderRadius: 4, padding: '12px 15px' }}>
            <span style={{ color: 'var(--ai)', fontWeight: 700 }}>제안 포지션 ▸ </span>{track1.positioningFinal}
          </div>
        </div>

        {/* ── TRACK 2 ── */}
        <div style={{ ...s.trackHeader, background: 'var(--t2)' }}>
          <span style={s.trackLabel}>TRACK 2 — Paper · Patent · Product</span>
          <span style={s.trackDesc}>문헌·특허·시장 환경 자동 수집 및 AI 요약</span>
        </div>

        {/* 4. Paper */}
        <div style={s.section}>
          <SectionTitle num="4" ko="문헌 분석" en="Paper" />
          <p style={s.lead}>지표성분 키워드로 PubMed를 자동 검색·AI 요약한 근거 문헌입니다. <span style={{ color: 'var(--t2)', fontWeight: 600, fontSize: 11 }}>[API: PubMed]</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            {track2.papers.map((p, i) => (
              <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 3, padding: '13px 15px', background: '#fff', display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', lineHeight: 1.4, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{p.authors} · <em>{p.journal}</em> {p.year} · PMID {p.pmid}</div>
                  <div style={{ fontSize: 12 }}>{p.summary}</div>
                </div>
                <StarBadge level={p.level} />
              </div>
            ))}
          </div>
          <AIBox items={track2.papersAI} />
        </div>

        {/* 5. Patent */}
        <div style={s.section}>
          <SectionTitle num="5" ko="특허 환경" en="Patent" />
          <p style={s.lead}>국내외 특허 DB를 자동 검색한 선행 특허 현황입니다. <span style={{ color: 'var(--t2)', fontWeight: 600, fontSize: 11 }}>[API: KIPRIS · USPTO]</span></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
            {track2.patents.map((p, i) => (
              <div key={i} style={{ border: '1px solid var(--t2-bg)', borderRadius: 3, padding: '12px 14px', background: 'var(--t2-bg)' }}>
                <div style={{ fontSize: 10, color: 'var(--t2)', letterSpacing: '.04em', marginBottom: 4 }}>{p.no} · {p.status}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, marginBottom: 6 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.applicant} · {p.year}</div>
                <div style={{ marginTop: 6 }}>{p.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>
              </div>
            ))}
          </div>
          <AIBox items={track2.patentsAI} />
        </div>

        {/* 6. Product */}
        <div style={s.section}>
          <SectionTitle num="6" ko="제품 현황" en="Product" />
          <p style={s.lead}>시판 유사 제품을 자동 수집·비교 분석한 시장 현황입니다. <span style={{ color: 'var(--t2)', fontWeight: 600, fontSize: 11 }}>[API: 네이버 쇼핑 · 식약처]</span></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 6 }}>
            {track2.products.map((p, i) => (
              <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '13px 14px', background: '#fff' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{p.brand} · {p.origin}</div>
                <div style={{ fontSize: 11.5, marginBottom: 8, color: '#3a3a36' }}>{p.info}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)' }}>{p.price}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, marginBottom: 8 }}>출처: {p.source}</div>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span>성분 유사도</span><span>{p.match}%</span>
                </div>
                <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${p.match}%`, background: p.match >= 80 ? 'var(--t1)' : p.match >= 50 ? 'var(--accent)' : '#ccc' }} />
                </div>
              </div>
            ))}
          </div>
          <AIBox items={track2.productsAI} />
        </div>

        {/* SUMMARY */}
        <div style={s.bridge}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>통합 전략 요약 — 트랙1 × 트랙2 교차 결론</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { color: 'var(--t1)', label: 'TRACK 1 결론 (소재 분석)', items: track2.summary.t1 },
              { color: 'var(--t2)', label: 'TRACK 2 결론 (외부 환경)', items: track2.summary.t2 }
            ].map(col => (
              <div key={col.label}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', color: col.color, marginBottom: 8 }}>{col.label}</div>
                {col.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 12.5, paddingLeft: 14, position: 'relative', marginBottom: 6 }}>
                    <span style={{ position: 'absolute', left: 0, color: col.color, fontWeight: 700 }}>›</span>{item}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12.5, background: '#fff', border: '1px dashed var(--ai)', borderRadius: 4, padding: '13px 16px' }}>
            <span style={{ color: 'var(--ai)', fontWeight: 700 }}>최종 제안 ▸ </span>{track2.summary.final}
          </div>
        </div>

        {/* FOOTER */}
        <div style={s.foot}>
          <strong>리포트 구성</strong> · 트랙1(녹색): 진흥원 자체 실측 및 AI 근거 연계. 트랙2(인디고): PubMed·KIPRIS·네이버 쇼핑·식약처 건기식정보 API 실시간 조회 후 AI 요약. 본 리포트의 AI 해석은 의사결정 보조 참고자료이며 최종 효능·기능성 입증은 별도 인증 절차를 통해 확정됩니다.
        </div>
      </div>

      {/* 인쇄 스타일 */}
      <style>{`
        .no-print { }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; padding: 0; }
        }
        @page { size: A4; margin: 12mm 0; }
      `}</style>
    </div>
  )
}

const s = {
  topBar: { position: 'sticky', top: 0, zIndex: 100, background: 'var(--paper)', borderBottom: '1px solid var(--line)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { fontSize: 13, padding: '7px 14px', border: '1px solid var(--line)', borderRadius: 6, background: 'transparent', color: 'var(--ink)' },
  printBtn: { fontSize: 13, padding: '7px 18px', border: 'none', borderRadius: 6, background: 'var(--t1)', color: '#fff', fontWeight: 700 },
  sheet: { maxWidth: 920, margin: '20px auto 40px', background: 'var(--paper)', border: '1px solid var(--line)', boxShadow: '0 3px 24px rgba(0,0,0,.08)' },
  masthead: { padding: '26px 40px 18px', borderBottom: '3px double var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' },
  badge: { display: 'inline-block', fontSize: 11, letterSpacing: '.1em', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '3px 9px', borderRadius: 2, marginBottom: 7 },
  meta: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--line)', fontSize: 12 },
  metaCell: { padding: '10px 15px', borderRight: '1px solid var(--line)' },
  metaK: { display: 'block', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.04em', marginBottom: 2 },
  metaV: { fontWeight: 600, display: 'block' },
  legend: { display: 'flex', gap: 20, padding: '11px 40px', background: '#f2f0e8', borderBottom: '1px solid var(--line)', fontSize: 12, alignItems: 'center', flexWrap: 'wrap' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  trackHeader: { display: 'flex', alignItems: 'center', borderTop: '2px solid var(--ink)' },
  trackLabel: { fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', padding: '9px 18px', fontWeight: 700, color: '#fff' },
  trackDesc: { fontSize: 11.5, color: 'var(--muted)', padding: '9px 16px' },
  section: { padding: '22px 40px', borderBottom: '1px solid var(--line)' },
  lead: { fontSize: 13, color: '#3a3a36', marginBottom: 12 },
  bridge: { padding: '18px 40px', background: '#f7f5ef', borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)' },
  foot: { padding: '14px 40px 20px', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }
}
