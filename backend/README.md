# PromptPolish Backend

PromptPolish 확장 프로그램을 위한 백엔드 API 구현입니다.

## 옵션

### 1. Cloudflare Workers (추천 ⭐)

**장점:**
- 완전 무료 (하루 10만 요청)
- 배포 가장 간단
- 전세계 엣지 네트워크
- 서버 관리 불필요

**배포:**

1. https://dash.cloudflare.com/ 접속
2. Workers & Pages → Create application → Create Worker
3. `cloudflare-worker.js` 코드 복사
4. Settings → Variables → Environment Variables:
   ```
   OPENAI_API_KEY = sk-your-key
   ```
5. Deploy 클릭
6. Worker URL 복사: `https://promptpolish.your-name.workers.dev`

### 2. Node.js + Express

**장점:**
- 표준적인 REST API
- 로컬 개발 쉬움
- 커스터마이징 유연

**설치:**

```bash
cd backend/nodejs-express
npm install
cp .env.example .env
# .env 파일에 OPENAI_API_KEY 입력
npm start
```

**배포 (Railway):**

```bash
# Railway CLI 설치
npm install -g railway

# 로그인
railway login

# 프로젝트 생성 및 배포
railway init
railway add
railway up

# 환경변수 설정
railway variables set OPENAI_API_KEY=sk-your-key
```

**배포 (Heroku):**

```bash
# Heroku CLI 설치 후
heroku create promptpolish-api
heroku config:set OPENAI_API_KEY=sk-your-key
git push heroku main
```

### 3. Vercel Serverless

**장점:**
- GitHub 연동 자동 배포
- 무료 플랜 넉넉
- 설정 간단

**배포:**

```bash
cd backend/vercel

# Vercel CLI 설치
npm install -g vercel

# 로그인 및 배포
vercel login
vercel

# 환경변수 설정
vercel env add OPENAI_API_KEY
# sk-your-key 입력

# Production 배포
vercel --prod
```

## 확장 프로그램 연결

백엔드 배포 후 `promptImprover.js` 수정:

```javascript
// 25번째 줄
const BACKEND_API = 'https://your-backend-url.com/improve';

// 예시:
// Cloudflare: 'https://promptpolish.your-name.workers.dev'
// Vercel: 'https://promptpolish.vercel.app/improve'
// Railway: 'https://promptpolish-production.up.railway.app/improve'
```

## API 명세

### POST /improve

**Request:**
```json
{
  "draft": "사용자가 입력한 초안 프롬프트",
  "targetAI": "gpt|claude|gemini|perplexity",
  "systemPrompt": "시스템 프롬프트"
}
```

**Response:**
```json
{
  "improved": "개선된 프롬프트",
  "targetAI": "gpt",
  "model": "gpt-4o-mini"
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

## 비용

### OpenAI API (gpt-4o-mini)
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- 평균 프롬프트 개선: ~500 tokens
- 예상 비용: **1000회당 $0.50**

### 호스팅
- **Cloudflare Workers**: 무료 (10만 요청/일)
- **Vercel**: 무료 (10만 요청/월)
- **Railway**: $5/월 (무제한)

## 보안

1. API Key는 환경변수로만 관리
2. CORS 설정으로 도메인 제한 가능
3. Rate limiting 추가 권장:

```javascript
// Cloudflare Workers 예시
if (requestCount > 100) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

## 모니터링

### Cloudflare
- Dashboard → Workers → Analytics

### Node.js
```javascript
// 요청 로깅 추가
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})
```

### Vercel
- Dashboard → Project → Analytics

## 트러블슈팅

### CORS 에러
```javascript
// CORS 헤더 확인
Access-Control-Allow-Origin: *
```

### OpenAI API 에러
```bash
# API Key 확인
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-key"
```

### 타임아웃
```javascript
// OpenAI 호출 시 timeout 설정
signal: AbortSignal.timeout(30000) // 30초
```

## 추천 설정

**개발 중**: Node.js Express (localhost)
**프로덕션**: Cloudflare Workers (무료, 빠름)
**팀/비즈니스**: Railway (모니터링, DB 연동)
