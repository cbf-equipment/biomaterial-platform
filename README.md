# CBF 바이오 소재 3P² 분석 플랫폼

춘천바이오산업진흥원 기술개발팀 · 효능평가 및 분석지원

## 배포 주소
https://cbf-equipment.github.io/biomaterial-platform

---

## 설정 순서

### STEP 1 — GitHub 레포 생성

1. github.com/cbf-equipment 에서 `New repository`
2. Repository name: `biomaterial-platform`
3. Public 선택 → Create
4. 이 폴더 전체를 업로드 (또는 git push)

### STEP 2 — GitHub Pages 활성화

Settings → Pages → Source: **GitHub Actions** 선택
→ push 후 Actions 탭에서 배포 확인

### STEP 3 — Google Apps Script 배포 (백엔드)

1. https://script.google.com → 새 프로젝트
2. `gas/Code.gs` 내용 전체 붙여넣기
3. CONFIG 항목에 API 키 입력 (아래 API 발급 참고)
4. 배포 → 웹 앱
   - 설명: CBF 3P² API
   - 다음 사용자로 실행: **나**
   - 액세스 권한: **모든 사용자**
5. 배포 URL 복사

### STEP 4 — 환경변수 설정

GitHub 레포 → Settings → Secrets and variables → Actions → New repository secret

| 이름 | 값 |
|---|---|
| `VITE_GAS_URL` | GAS 배포 URL |

또는 로컬 개발 시 `.env.local` 파일:
```
VITE_GAS_URL=https://script.google.com/macros/s/XXXX/exec
```

---

## API 발급 목록

| API | 신청 주소 | 비용 | 용도 |
|---|---|---|---|
| PubMed E-utilities | eutils.ncbi.nlm.nih.gov | 무료 | 논문 검색 (키 불필요) |
| KIPRIS Plus | open.kipris.or.kr | 무료 | 국내 특허 검색 |
| 식약처 건기식정보 | data.go.kr (15056760) | 무료 | 건기식 제품·원료 |
| 네이버 쇼핑 검색 | developers.naver.com | 무료 | 시판 제품 수집 |
| Claude API | console.anthropic.com | 유료 | AI 해석 생성 |

---

## 로컬 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

---

## 구조

```
biomaterial-platform/
├── src/
│   ├── App.jsx              # 메인 앱 (화면 전환)
│   ├── index.css            # 전역 스타일
│   └── components/
│       ├── SearchPage.jsx   # 소재 입력 화면
│       ├── LoadingPage.jsx  # 분석 중 로딩
│       └── ReportPage.jsx   # 3P² 리포트 출력 + PDF
├── gas/
│   └── Code.gs              # Google Apps Script 백엔드
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions 자동 배포
└── vite.config.js
```

---

## 데이터 흐름

```
사용자 입력
    ↓
GitHub Pages (React)
    ↓ fetch
Google Apps Script (백엔드 허브)
    ├─ PubMed API    → 논문
    ├─ KIPRIS API    → 특허
    ├─ 식약처 API   → 제품·원료
    ├─ 네이버 API   → 시판 제품
    └─ Claude API   → AI 해석
    ↓
Google Sheets (누적 저장)
    ↓
3P² 리포트 반환 → PDF 출력
```
