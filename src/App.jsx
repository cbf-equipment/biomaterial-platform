import { useState } from 'react'
import SearchPage from './components/SearchPage.jsx'
import ReportPage from './components/ReportPage.jsx'
import LoadingPage from './components/LoadingPage.jsx'

// GAS 웹앱 URL - 2단계에서 발급 후 여기에 입력
const GAS_URL = import.meta.env.VITE_GAS_URL || ''

export default function App() {
  const [stage, setStage] = useState('search') // 'search' | 'loading' | 'report'
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState('')

async function handleSearch(query) {
  setStage('loading')
  setError('')
  try {
    if (!GAS_URL) {
      await new Promise(r => setTimeout(r, 2500))
      setReportData(buildDemoData(query))
      setStage('report')
      return
    }
    const url = `${GAS_URL}?action=analyze&query=${encodeURIComponent(query.material)}&type=${encodeURIComponent(query.type)}`
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error('서버 응답 오류')
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    setReportData(data)
    setStage('report')
  } catch (e) {
    console.error(e)
    // GAS 연결 실패 시 소재명 반영한 데모 데이터
    setReportData(buildDemoData(query))
    setStage('report')
  }
}

  function handleReset() {
    setStage('search')
    setReportData(null)
  }

  if (stage === 'loading') return <LoadingPage />
  if (stage === 'report') return <ReportPage data={reportData} onReset={handleReset} />
  return <SearchPage onSearch={handleSearch} error={error} />
}

// GAS 연결 전 데모용 데이터
function buildDemoData(query) {
  return {
    meta: {
      material: query.material,
      type: query.type,
      method: query.method || 'HPLC-PDA',
      reportNo: `CBF-3P²-${new Date().getFullYear()}-DEMO`,
      generatedAt: new Date().toLocaleDateString('ko-KR')
    },
    track1: {
      profiling: [
        { name: 'Resveratrol', class: 'Stilbene', amount: '8.42', rt: '14.2', ratio: '36.1' },
        { name: 'Polydatin (Piceid)', class: 'Stilbene glycoside', amount: '11.07', rt: '9.8', ratio: '47.4' },
        { name: 'Emodin', class: 'Anthraquinone', amount: '2.85', rt: '21.6', ratio: '12.2' },
        { name: 'Physcion', class: 'Anthraquinone', amount: '1.01', rt: '24.9', ratio: '4.3' }
      ],
      profilingAI: [
        'Stilbene 계열(Resveratrol + Polydatin)이 전체 정량 성분의 약 83%를 차지 — stilbene-dominant 케모타입으로 분류.',
        'Polydatin 우세(vs. Resveratrol) → 배당체 비율 높아 수용성·안정성 측면 이점 예상.'
      ],
      proofing: [
        { compound: 'Resveratrol', efficacy: '항산화·항염', mechanism: 'NF-κB 억제, SIRT1 활성화', evidence: 'in vivo / 임상 다수' },
        { compound: 'Polydatin', efficacy: '항염·혈관보호', mechanism: '전염증성 사이토카인 저감', evidence: 'in vitro / in vivo 다수' },
        { compound: 'Emodin', efficacy: '항염·항균', mechanism: 'iNOS·COX-2 발현 억제', evidence: 'in vitro 중심' }
      ],
      proofingAI: [
        '3종 모두 항염 기전 수렴 → 1차 소구 효능을 항염으로 설정하는 것이 근거상 가장 견고.',
        '진흥원 자체 연구결과와 성분 프로파일 정합 → 내부 assay 데이터로 1차 검증 가능.',
        '단일성분 클레임보다 복합 추출물 단위 효능 입증 전략 권장.'
      ],
      positioningCards: [
        { title: '규제·인정원료 환경', body: 'Resveratrol 함유 원료 개별인정형 선례 존재. 본 시료는 stilbene 복합 조성으로 차별화 포인트 확보 가능.', tags: ['개별인정형 검토', '항산화 지표'] },
        { title: '경쟁 소재 대비', body: '시판 resveratrol 소재 대비 Polydatin 고함량 → 수용성·제형 안정성에서 차별 소구점.', tags: ['이너뷰티', '기능성 음료'] }
      ],
      positioningFinal: '강원 자생 호장근 유래 stilbene 복합 항염·항산화 소재 — 지역 특화 복합 추출물로 포지셔닝, 개별인정형 항산화 지표를 1차 타깃으로 권장.'
    },
    track2: {
      papers: [
        { title: 'Polydatin alleviates LPS-induced acute lung injury via suppression of NF-κB and NLRP3 inflammasome pathways', authors: 'Zhang X. et al.', journal: 'Phytomedicine', year: '2023', pmid: '36891234', summary: 'Polydatin 50mg/kg 투여 시 폐포 내 IL-1β·TNF-α 유의감소, NF-κB p65 핵 이행 억제 확인. 마우스 in vivo 모델.', level: 3 },
        { title: 'Resveratrol and its glycoside piceid: a review of their biological activities and clinical trials', authors: 'Park S.J. et al.', journal: 'J. Funct. Foods', year: '2022', pmid: '35204511', summary: 'Piceid(Polydatin)이 Resveratrol 대비 생체이용률 우수한 생체전환 전구체임을 메타분석. 경구 복합 소재 설계 근거 제공.', level: 3 },
        { title: 'Emodin inhibits COX-2/PGE2 pathway in colorectal cancer', authors: 'Kim H. et al.', journal: 'Int. J. Mol. Sci.', year: '2023', pmid: '37298142', summary: 'Emodin의 COX-2 억제 기전 in vitro 검증. 항염 복합 효능 스토리에서 Emodin 역할 보강.', level: 2 }
      ],
      papersAI: [
        '검색된 147건 중 항염 관련 상위 3건 추출. 3건 모두 Proofing 기전과 일치 — 상호 검증 완료.',
        'Polydatin이 단순 Resveratrol 배당체를 넘어 독자 효능 입증 문헌이 축적 중.',
        '임상시험 수준(★★★★) 문헌 현재 없음 → 인체적용시험 추가 필요성을 기업에 안내.'
      ],
      patents: [
        { no: 'KR 10-2023-XXXXXXX', status: '등록', title: '호장근 추출물 및 레스베라트롤을 유효성분으로 포함하는 항산화용 조성물', applicant: '○○대학교 산학협력단', year: '2023', tags: ['항산화', '추출물 조성', '국내'] },
        { no: 'KR 10-2022-XXXXXXX', status: '공개', title: '폴리다틴(Polydatin) 함유 피부 항노화용 화장품 조성물', applicant: '△△코스메틱(주)', year: '2022', tags: ['항노화', '화장품', '국내'] },
        { no: 'US 11,XXX,XXX B2', status: '등록', title: 'Stilbene-based anti-inflammatory composition comprising Polygonum extract', applicant: 'XX Pharma Inc. (US)', year: '2021', tags: ['항염', '경구제형', '해외'] },
        { no: 'CN 114XXXXXXX A', status: '공개', title: 'Polydatin与虎杖提取物复合制剂及其抗炎应用', applicant: '○○大学', year: '2023', tags: ['복합제제', '항염', '중국'] }
      ],
      patentsAI: [
        '국내 등록 특허: 항산화 조성물 위주 → 항염 복합 추출물 단독 특허는 미포화, 진입 여지 있음.',
        '해외(US·CN): 항염 경구제형·복합제제 특허 출원 증가 추세 → 신속한 국내 특허 포지셔닝 권장.',
        'Polydatin 표준화 고함량 소재로 특허 전략 수립 제안.'
      ],
      products: [
        { name: '레스베라트롤 고함량 500mg', brand: 'A건강', origin: '국내', info: 'Resveratrol 500mg/캡슐, 폴리다틴 미표기 · 건기식 신고제품 · 항산화', price: '₩38,000 / 60캡슐', source: '네이버 쇼핑 · 식약처 건기식DB', match: 55 },
        { name: '호장근 스틸벤 복합 추출물', brand: 'B바이오', origin: '국내', info: 'Polydatin 15mg + Resveratrol 10mg/정 · 건기식 개별인정 · 항산화', price: '₩52,000 / 30정', source: '네이버 쇼핑 · 식약처 건기식DB', match: 88 },
        { name: 'Trans-Resveratrol + Grape Extract', brand: 'C Naturals', origin: '미국 (iHerb)', info: 'Resveratrol 250mg + 포도씨 추출물 · Polydatin 비함유 · 항산화 표방', price: '$ 24.99 / 60캡슐', source: 'iHerb 상품정보', match: 30 }
      ],
      productsAI: [
        '국내 유사 제품(B바이오) 대비 본 시료는 Polydatin 함량 약 5.5배 높음 → 원료 함량 경쟁력 확보.',
        '국내 건기식 시장에서 Polydatin을 지표로 전면에 내세운 제품 부재 → 선점 기회.',
        '해외 제품군은 Polydatin 비함유 제품 다수 → 글로벌 시장에서도 Polydatin 고함량 소재는 차별화 자산.'
      ],
      summary: {
        t1: ['Stilbene-dominant 케모타입, 항염 근거 성분 3종 확인', 'Polydatin 고함량 → 수용성·안정성 우수', '개별인정형 항산화 지표 도전 가능'],
        t2: ['항염 복합 추출물 특허는 국내 미포화', 'Polydatin 전면 표방 시판제품 부재 → 선점 기회', '임상문헌 공백 → 인체적용시험이 핵심 과제'],
        final: '강원 자생 호장근의 Polydatin 표준화 항염·항산화 복합 소재로 포지셔닝. 단기: 국내 특허 선출원 + 개별인정형 항산화 도전. 중기: 인체적용시험으로 항염 기능성 클레임 확장. 장기: 이너뷰티·기능성음료 글로벌 B2B 소재 공급.'
      }
    }
  }
}
