# PromptPolish

AI 프롬프트 자동 개선 Chrome 확장 프로그램

## 특징

- ✨ GPT, Claude, Gemini, Perplexity 각각에 최적화된 프롬프트 자동 생성
- 🚀 Alt+P 단축키로 빠른 개선
- 🔒 API Key 입력 불필요 (서버 관리)
- 📝 Diff 미리보기로 변경사항 확인
- 🎯 선택 영역만 개선 가능

## 설치

1. Chrome에서 `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. "압축해제된 확장 프로그램 로드" 클릭
4. `prompt-polish` 폴더 선택

## 백엔드 설정

### Cloudflare Workers 배포

1. [Cloudflare Workers](https://workers.cloudflare.com/) 계정 생성
2. 새 Worker 생성
3. `backend-api.js` 코드 복사
4. Environment Variables에 `OPENAI_API_KEY` 추가
5. 배포 후 Worker URL 복사
6. `promptImprover.js`의 `BACKEND_API` 변수를 Worker URL로 변경

```javascript
// promptImprover.js
const BACKEND_API = 'https://your-worker.your-subdomain.workers.dev/improve';
```

### 대안: Vercel Edge Functions

```javascript
// api/improve.js
export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { draft, targetAI, systemPrompt } = await request.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: draft }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  return new Response(JSON.stringify({
    improved: data.choices?.[0]?.message?.content
  }));
}
```

## 사용 방법

1. 지원 사이트 방문 (ChatGPT, Claude, Gemini, Perplexity)
2. 텍스트 입력창 클릭
3. `Alt+P` 누르거나 툴바의 Polish 버튼 클릭
4. Diff 확인 후 적용

## 파일 구조

```
prompt-polish/
├── manifest.json          # 확장 프로그램 설정
├── background.js          # 백그라운드 스크립트
├── content.js             # 콘텐츠 스크립트 (메인 로직)
├── promptImprover.js      # 프롬프트 개선 로직
├── diff.js                # Diff 생성 유틸
├── ui.css                 # UI 스타일
├── popup.html/js          # 팝업 (대상 AI 선택)
├── options.html/js        # 옵션 페이지
├── backend-api.js         # 백엔드 API 예제
└── README.md              # 이 파일
```

## 보안

- API Key는 서버 측에서만 관리
- 사용자 입력 텍스트만 개선 목적으로 전송
- 대상 AI 선택 정보만 로컬 저장
- HTTPS 암호화 통신

## 라이선스

MIT
