import { useState } from 'react'
import SearchPage from './components/SearchPage.jsx'
import ReportPage from './components/ReportPage.jsx'
import LoadingPage from './components/LoadingPage.jsx'

const GAS_URL = import.meta.env.VITE_GAS_URL || ''

export default function App() {
  const [stage, setStage] = useState('search')
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
    const data = await new Promise((resolve, reject) => {
      const callbackName = 'cbf_callback_' + Date.now()
      const script = document.createElement('script')
      const url = `${GAS_URL}?action=analyze&query=${encodeURIComponent(query.material)}&type=${encodeURIComponent(query.type)}&callback=${callbackName}`
      script.src = url
      window[callbackName] = (data) => {
        delete window[callbackName]
        document.body.removeChild(script)
        resolve(data)
      }
      script.onerror = () => reject(new Error('GAS 연결 실패'))
      document.body.appendChild(script)
      setTimeout(() => reject(new Error('timeout')), 30000)
    })
    if (data.error) throw new Error(data.error)
    setReportData(data)
    setStage('report')
  } catch (e) {
    console.error('연결 오류:', e)
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

function buildDemoData(query) {
  const m = query.material
  return {
    meta: {
      material: m,
      type: query.type,
      method: query.method || 'HPLC-PDA',
      reportNo: `CBF-3P²-${new Date().getFullYear()}-DEMO`,
      generatedAt: new Date().toLocaleDateString('ko-KR')
    },
    track1: {
      profiling: [
        { name: '지표성분 1', class: '-', amount: '-', rt: '-', ratio: '-' },
        { name: '지표성분 2', class: '-', amount: '-', rt: '-', ratio: '-' },
      ],
      profilingAI: [
        `${m} 성분 프로파일 — 진흥원 실측 데이터 입력 후 AI 해석이 제공됩니다.`,
        'Claude API 키 설정 완료 후 실제 성분 기반 해석이 활성화됩니다.'
      ],
      proofing: [
        { compound: '-', efficacy: '-', mechanism: '-', evidence: '-' }
      ],
      proofingAI: [
        `${m} 효능 기전 분석은 API 연결 후 제공됩니다.`,
        '진흥원 내부 assay 데이터와 연계하면 더욱 정확한 해석이 가능합니다.',
        'Claude API 키 입력 후 문헌 기반 기전 분석이 활성화됩니다.'
      ],
      positioningCards: [
        { title: '규제·인정원료 환경', body: `${m} 관련 식약처 인정원료 현황은 API 연결 후 분석됩니다.`, tags: [m, '기능성 검토'] },
        { title: '경쟁 소재 대비', body: `${m} 유사 시판 소재와의 차별점은 API 연결 후 분석됩니다.`, tags: ['차별화', '시장분석'] }
      ],
      positioningFinal: `${m} 유래 소재의 포지셔닝 전략은 API 연결 및 실측 데이터 입력 후 제공됩니다.`
    },
    track2: {
      papers: [
        {
          title: `${m} 관련 논문을 PubMed에서 검색합니다`,
          authors: '-',
          journal: '-',
          year: '-',
          pmid: '-',
          summary: 'PubMed API는 별도 키 없이 연결 가능합니다. GAS 배포 후 실제 논문이 표시됩니다.',
          level: 1
        }
      ],
      papersAI: [
        `${m} 관련 PubMed 문헌 검색 결과가 여기에 표시됩니다.`,
        'GAS 연결 완료 후 실제 논문 데이터가 자동 수집됩니다.',
        'Claude API 키 입력 후 AI 문헌 요약이 활성화됩니다.'
      ],
      patents: [
        {
          no: '-',
          status: '조회 예정',
          title: `${m} 관련 특허를 KIPRIS에서 검색합니다`,
          applicant: '-',
          year: '-',
          tags: [m, '특허 조회 예정']
        }
      ],
      patentsAI: [
        `${m} 특허 환경 분석은 KIPRIS API 연결 후 제공됩니다.`,
        'KIPRIS Plus API 키를 GAS CONFIG에 입력하면 활성화됩니다.',
        '국내외 특허 선행조사 결과가 자동으로 정리됩니다.'
      ],
      products: [
        {
          name: `${m} 관련 제품`,
          brand: '-',
          origin: '-',
          info: '네이버 쇼핑 API 연결 후 실제 시판 제품이 표시됩니다.',
          price: '-',
          source: '네이버 쇼핑 API 연결 필요',
          match: 0
        }
      ],
      productsAI: [
        `${m} 시판 제품 비교 분석은 네이버 쇼핑 API 연결 후 제공됩니다.`,
        '식약처 건기식 DB API 연결 시 인정원료 제품도 함께 표시됩니다.',
        'API 연결 완료 후 성분 유사도 자동 산출이 활성화됩니다.'
      ],
      summary: {
        t1: [
          `${m} 소재 분석 준비 완료`,
          '실측 HPLC 데이터 입력 후 성분 프로파일 반영 예정',
          'Claude API 연결 후 AI 해석 활성화'
        ],
        t2: [
          'PubMed API 연결 후 문헌 자동 수집 예정',
          'KIPRIS·네이버쇼핑·식약처 API 키 입력 필요',
          'API 설정 완료 후 실시간 데이터 제공'
        ],
        final: `${m} 소재 통합 분석을 위해 GAS CONFIG의 API 키 설정을 완료해주세요. Claude API(필수) → 네이버 쇼핑 API(무료, 즉시) → 식약처 API(1~2일) 순으로 진행을 권장합니다.`
      }
    }
  }
}
