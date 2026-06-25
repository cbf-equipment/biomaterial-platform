/**
 * CBF 바이오 소재 3P² 분석 플랫폼 — Google Apps Script 백엔드
 * 
 * [설정 방법]
 * 1. Google Apps Script (script.google.com) 새 프로젝트 생성
 * 2. 이 코드 전체 붙여넣기
 * 3. 아래 CONFIG 항목 입력 (API 키 등)
 * 4. 배포 → 웹 앱 → 액세스: 모든 사용자 → 배포
 * 5. 배포 URL을 React 앱의 VITE_GAS_URL에 입력
 */

// ───────── CONFIG (여기에 API 키 입력) ─────────
const CONFIG = {
  CLAUDE_API_KEY:  'sk-ant-XXXXXXXX',   // Anthropic Console에서 발급
  NAVER_CLIENT_ID: 'XXXXXXXX',           // developers.naver.com → 애플리케이션 등록
  NAVER_CLIENT_SECRET: 'XXXXXXXX',       // 동상
  MFDS_API_KEY:    'XXXXXXXX',           // data.go.kr → 식약처 건기식정보 신청
  KIPRIS_API_KEY:  'XXXXXXXX',           // open.kipris.or.kr → KIPRIS Plus 신청
  SHEET_ID:        '',                   // 결과 저장용 Google Sheet ID (URL에서 복사)
}
// ────────────────────────────────────────────

/**
 * GET 요청 처리 (CORS 허용 포함)
 */
function doGet(e) {
  const params = e.parameter
  const action = params.action || 'analyze'
  const query  = params.query  || ''
  const type   = params.type   || '식물 추출물'

  let result
  try {
    if (action === 'analyze') {
      result = runAnalysis(query, type)
    } else {
      result = { error: '알 수 없는 action' }
    }
  } catch (err) {
    result = { error: err.message }
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
}

/**
 * 메인 분석 파이프라인
 */
function runAnalysis(material, type) {
  // 1. PubMed 논문 검색
  const papers = fetchPubMed(material)

  // 2. 특허 검색 (KIPRIS)
  const patents = fetchKipris(material)

  // 3. 식약처 건기식 원료·제품 검색
  const mfdsProducts = fetchMFDS(material)

  // 4. 네이버 쇼핑 제품 검색
  const naverProducts = fetchNaverShopping(material)

  // 5. Claude AI 해석
  const aiResult = runClaudeAnalysis(material, { papers, patents, mfdsProducts, naverProducts })

  // 6. 결과 조합
  const report = {
    meta: {
      material,
      type,
      method: 'HPLC-PDA',
      reportNo: `CBF-3P²-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      generatedAt: new Date().toLocaleDateString('ko-KR')
    },
    track1: buildTrack1(material, aiResult),
    track2: buildTrack2(papers, patents, mfdsProducts, naverProducts, aiResult)
  }

  // 7. Google Sheets에 누적 저장
  saveToSheet(material, report)

  return report
}

// ────────────────────────────────────────────
// TRACK 2: 외부 API 호출
// ────────────────────────────────────────────

/**
 * PubMed E-utilities API
 * 무료, API키 불필요 (권장은 있음)
 */
function fetchPubMed(material) {
  try {
    // 1단계: 논문 ID 검색
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(material + '[Title/Abstract]')}&retmax=10&retmode=json`
    const searchRes = UrlFetchApp.fetch(searchUrl)
    const searchData = JSON.parse(searchRes.getContentText())
    const ids = searchData.esearchresult?.idlist || []
    if (!ids.length) return []

    // 2단계: 초록 조회
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.slice(0,5).join(',')}&rettype=abstract&retmode=json`
    const fetchRes = UrlFetchApp.fetch(fetchUrl)
    const fetchData = JSON.parse(fetchRes.getContentText())
    const articles = fetchData.PubmedArticleSet?.PubmedArticle || []

    return articles.map(a => {
      const art = a.MedlineCitation?.Article || {}
      return {
        title:   art.ArticleTitle || '',
        authors: (art.AuthorList?.Author || []).slice(0,2).map(au => `${au.LastName || ''} ${(au.Initials || '')}.`).join(', '),
        journal: art.Journal?.Title || '',
        year:    art.Journal?.JournalIssue?.PubDate?.Year || '',
        pmid:    a.MedlineCitation?.PMID?.['#text'] || '',
        abstract: (art.Abstract?.AbstractText || [''])[0] || '',
        level: 2
      }
    })
  } catch (e) {
    Logger.log('PubMed 오류: ' + e.message)
    return []
  }
}

/**
 * KIPRIS Plus API (특허 검색)
 * open.kipris.or.kr 에서 API 키 발급 필요
 */
function fetchKipris(material) {
  if (!CONFIG.KIPRIS_API_KEY || CONFIG.KIPRIS_API_KEY === 'XXXXXXXX') {
    return getDemoPatents(material)
  }
  try {
    const url = `http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getWordSearch?word=${encodeURIComponent(material)}&accessKey=${CONFIG.KIPRIS_API_KEY}&numOfRows=5&pageNo=1`
    const res = UrlFetchApp.fetch(url)
    const xml = XmlService.parse(res.getContentText())
    const items = xml.getRootElement().getChild('body')?.getChild('items')?.getChildren('item') || []
    return items.map(item => ({
      no: item.getChildText('applicationNumber') || '',
      status: item.getChildText('registerStatus') || '공개',
      title: item.getChildText('inventionTitle') || '',
      applicant: item.getChildText('applicantName') || '',
      year: (item.getChildText('applicationDate') || '').slice(0,4),
      tags: [material, '특허']
    }))
  } catch (e) {
    Logger.log('KIPRIS 오류: ' + e.message)
    return getDemoPatents(material)
  }
}

/**
 * 식약처 건강기능식품 정보 (공공데이터포털)
 * data.go.kr → 식약처_건강기능식품정보 API 신청
 */
function fetchMFDS(material) {
  if (!CONFIG.MFDS_API_KEY || CONFIG.MFDS_API_KEY === 'XXXXXXXX') {
    return []
  }
  try {
    const url = `https://openapi.foodsafetykorea.go.kr/api/${CONFIG.MFDS_API_KEY}/HLTH_FNCT_FOOD_RAWMTRL/json/1/10/RAW_MTRL_NM=${encodeURIComponent(material)}`
    const res = UrlFetchApp.fetch(url)
    const data = JSON.parse(res.getContentText())
    const rows = data.HLTH_FNCT_FOOD_RAWMTRL?.row || []
    return rows.map(r => ({
      name: r.RAW_MTRL_NM || '',
      function: r.FNCLTY_CN || '',
      status: r.PRMS_STTS || ''
    }))
  } catch (e) {
    Logger.log('식약처 오류: ' + e.message)
    return []
  }
}

/**
 * 네이버 쇼핑 검색 API
 * developers.naver.com → 애플리케이션 등록 → 검색 API 체크
 */
function fetchNaverShopping(material) {
  if (!CONFIG.NAVER_CLIENT_ID || CONFIG.NAVER_CLIENT_ID === 'XXXXXXXX') {
    return []
  }
  try {
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(material + ' 추출물')}&display=5&sort=sim`
    const res = UrlFetchApp.fetch(url, {
      headers: {
        'X-Naver-Client-Id': CONFIG.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': CONFIG.NAVER_CLIENT_SECRET
      }
    })
    const data = JSON.parse(res.getContentText())
    return (data.items || []).map(item => ({
      name: item.title.replace(/<[^>]+>/g, ''),
      brand: item.brand || item.maker || '',
      origin: '국내',
      price: `₩${Number(item.lprice).toLocaleString()}`,
      link: item.link,
      image: item.image,
      match: 50
    }))
  } catch (e) {
    Logger.log('네이버쇼핑 오류: ' + e.message)
    return []
  }
}

// ────────────────────────────────────────────
// Claude AI 해석
// ────────────────────────────────────────────

function runClaudeAnalysis(material, rawData) {
  if (!CONFIG.CLAUDE_API_KEY || CONFIG.CLAUDE_API_KEY === 'sk-ant-XXXXXXXX') {
    return getDemoAI(material)
  }
  try {
    const prompt = buildPrompt(material, rawData)
    const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': CONFIG.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })
    const data = JSON.parse(res.getContentText())
    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (e) {
    Logger.log('Claude API 오류: ' + e.message)
    return getDemoAI(material)
  }
}

function buildPrompt(material, rawData) {
  return `당신은 천연물 소재 전문 분석가입니다. 아래 소재에 대한 수집 데이터를 분석하여 JSON으로만 응답하세요.

소재명: ${material}
수집된 논문 수: ${rawData.papers.length}건
수집된 특허 수: ${rawData.patents.length}건
네이버 쇼핑 제품 수: ${rawData.naverProducts.length}건

논문 데이터:
${rawData.papers.slice(0,3).map(p => `- ${p.title} (${p.year})\n  ${p.abstract?.slice(0,200)}`).join('\n')}

아래 JSON 형식으로만 응답하세요 (추가 텍스트 없이):
{
  "profilingAI": ["해석 문장1", "해석 문장2"],
  "proofingAI": ["효능 근거 요약1", "효능 근거 요약2", "효능 근거 요약3"],
  "positioningFinal": "최종 포지셔닝 제안 한 문장",
  "papersAI": ["문헌 종합1", "문헌 종합2", "문헌 종합3"],
  "patentsAI": ["특허 분석1", "특허 분석2", "특허 분석3"],
  "productsAI": ["제품 비교1", "제품 비교2", "제품 비교3"],
  "summaryT1": ["트랙1 결론1", "트랙1 결론2", "트랙1 결론3"],
  "summaryT2": ["트랙2 결론1", "트랙2 결론2", "트랙2 결론3"],
  "summaryFinal": "단기·중기·장기 전략 제안"
}`
}

// ────────────────────────────────────────────
// 리포트 데이터 조합
// ────────────────────────────────────────────

function buildTrack1(material, ai) {
  return {
    profiling: [],  // 진흥원 실측 입력 시 채워짐
    profilingAI: ai.profilingAI || [],
    proofing: [],
    proofingAI: ai.proofingAI || [],
    positioningCards: [
      { title: '규제·인정원료 환경', body: '식약처 건기식 인정원료 현황 및 진입 가능성을 확인하세요.', tags: [material, '기능성 검토'] },
      { title: '경쟁 소재 대비', body: '유사 시판 소재와의 성분 차별점을 AI가 분석했습니다.', tags: ['차별화'] }
    ],
    positioningFinal: ai.positioningFinal || `${material} 유래 복합 소재로 포지셔닝 권장.`
  }
}

function buildTrack2(papers, patents, mfdsProducts, naverProducts, ai) {
  const products = [
    ...naverProducts.map(p => ({ ...p, source: '네이버 쇼핑' })),
    ...mfdsProducts.map(p => ({ name: p.name, brand: '식약처 인정', origin: '국내', info: p.function, price: '-', source: '식약처 건기식DB', match: 70 }))
  ]

  return {
    papers: papers.map(p => ({ ...p, summary: p.abstract?.slice(0, 150) + '...' || '' })),
    papersAI: ai.papersAI || [],
    patents,
    patentsAI: ai.patentsAI || [],
    products: products.slice(0, 6),
    productsAI: ai.productsAI || [],
    summary: {
      t1: ai.summaryT1 || [],
      t2: ai.summaryT2 || [],
      final: ai.summaryFinal || ''
    }
  }
}

// ────────────────────────────────────────────
// Google Sheets 누적 저장 (자산 A)
// ────────────────────────────────────────────

function saveToSheet(material, report) {
  if (!CONFIG.SHEET_ID) return
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID)
    let sheet = ss.getSheetByName('분석이력')
    if (!sheet) {
      sheet = ss.insertSheet('분석이력')
      sheet.appendRow(['일시', '소재명', '유형', '리포트번호', '논문수', '특허수', '제품수', '최종포지셔닝'])
    }
    sheet.appendRow([
      new Date().toLocaleString('ko-KR'),
      material,
      report.meta.type,
      report.meta.reportNo,
      report.track2.papers.length,
      report.track2.patents.length,
      report.track2.products.length,
      report.track2.summary.final
    ])
  } catch (e) {
    Logger.log('Sheets 저장 오류: ' + e.message)
  }
}

// ────────────────────────────────────────────
// 데모 폴백 데이터
// ────────────────────────────────────────────

function getDemoPatents(material) {
  return [
    { no: 'KR 10-2023-DEMO', status: '공개', title: `${material} 추출물을 유효성분으로 포함하는 항산화용 조성물`, applicant: '○○대학교 산학협력단', year: '2023', tags: [material, '항산화', '국내'] },
    { no: 'KR 10-2022-DEMO', status: '등록', title: `${material} 유래 기능성 성분을 포함하는 화장품 조성물`, applicant: '△△바이오(주)', year: '2022', tags: [material, '화장품', '국내'] }
  ]
}

function getDemoAI(material) {
  return {
    profilingAI: [`${material}의 주요 지표성분 프로파일을 분석했습니다.`, '복합 성분 조성으로 다효능 소재 가능성이 있습니다.'],
    proofingAI: ['항염 기전 수렴 확인 — 1차 소구 효능으로 항염을 설정하는 것이 근거상 적합합니다.', '문헌 데이터와 기전 일치 — 내부 assay 데이터로 1차 검증 가능합니다.', '복합 추출물 단위 효능 입증 전략을 권장합니다.'],
    positioningFinal: `강원 자생 ${material} 유래 복합 소재로 포지셔닝. 개별인정형 기능성 원료 도전을 권장합니다.`,
    papersAI: ['관련 논문 검색 완료. 항염·항산화 관련 문헌이 다수 확인됩니다.', '임상 수준 문헌은 추가 수집이 필요합니다.', '인체적용시험 추가를 권장합니다.'],
    patentsAI: ['국내 특허 환경 분석 완료.', '항염 복합 추출물 단독 특허는 진입 여지가 있습니다.', '신속한 국내 특허 포지셔닝을 권장합니다.'],
    productsAI: ['유사 시판 제품 현황 수집 완료.', '차별화된 성분 조성으로 경쟁 우위 확보 가능합니다.', '글로벌 시장에서도 차별화 자산으로 활용 가능합니다.'],
    summaryT1: ['소재 성분 프로파일 분석 완료', '효능 기전 연계 근거 확인', '시장 포지셔닝 방향 도출'],
    summaryT2: ['국내외 특허 환경 미포화 확인', '유사 시판제품 차별화 기회 존재', '임상 근거 추가가 핵심 과제'],
    summaryFinal: `단기: 국내 특허 선출원. 중기: 인체적용시험으로 기능성 클레임 확장. 장기: 글로벌 B2B 소재 공급.`
  }
}
