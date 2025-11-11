# Chrome 웹 스토어 배포 가이드

## 📋 체크리스트

배포 전 확인 사항:
- [ ] 모든 기능 테스트 완료
- [ ] 디버깅 로그 제거 (console.log)
- [ ] 아이콘 이미지 준비 (128x128, 48x48, 16x16)
- [ ] 스크린샷 준비 (1280x800 또는 640x400, 최소 1개)
- [ ] 개인정보처리방침 URL (필수)
- [ ] 홍보용 이미지 (440x280, 선택)

---

## 1단계: 개발자 계정 등록

### 비용: $5 (평생 1회 결제)

1. https://chrome.google.com/webstore/devconsole 접속
2. Google 계정으로 로그인
3. "개발자 등록비 지불" ($5)
4. 개발자 정보 입력

---

## 2단계: 아이콘 이미지 준비

### 필수 크기:
- **128x128px** - 스토어 표시용
- **48x48px** - 확장 프로그램 관리 페이지
- **16x16px** - 주소창 옆 아이콘

### 만들기:

**온라인 도구 사용:**
- https://www.canva.com (무료)
- https://www.figma.com (무료)

**간단한 방법:**
1. Canva 접속
2. "Custom size" → 128x128
3. ✨ 이모지나 텍스트 추가
4. PNG로 다운로드
5. 48x48, 16x16 버전도 제작

**또는 AI 생성:**
```
DALL-E / Midjourney 프롬프트:
"minimalist icon for a prompt optimization tool,
simple geometric shapes, black and white,
professional, clean design"
```

---

## 3단계: 스크린샷 준비

### 필수 사양:
- **크기**: 1280x800 또는 640x400
- **형식**: PNG 또는 JPG
- **개수**: 최소 1개, 최대 5개 추천

### 찍는 방법:
1. ChatGPT에서 확장 사용
2. **Cmd+Shift+4** (맥) 또는 **Windows+Shift+S** (윈도우)
3. 영역 선택해서 캡처

### 추천 스크린샷:
1. **툴바 보이는 화면** - "입력창에 자동으로 나타나는 툴바"
2. **모달 화면** - "AI가 프롬프트를 개선하는 모습"
3. **Before/After** - "개선 전후 비교"

---

## 4단계: 개인정보처리방책 준비

Chrome 웹 스토어는 **개인정보처리방침 URL 필수**입니다.

### 옵션 A: GitHub Pages (무료, 추천)

1. GitHub 저장소 생성
2. `privacy.html` 파일 생성:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PromptPolish - Privacy Policy</title>
</head>
<body>
  <h1>PromptPolish Privacy Policy</h1>

  <h2>Data Collection</h2>
  <p>PromptPolish does not collect, store, or transmit any personal data.</p>

  <h2>Data Usage</h2>
  <p>When you use the prompt improvement feature:</p>
  <ul>
    <li>Your input text is sent to our backend API</li>
    <li>The API forwards it to OpenAI for processing</li>
    <li>We do not store or log any user data</li>
    <li>Your selected AI preference (GPT/Claude/Gemini/Perplexity) is stored locally in your browser only</li>
  </ul>

  <h2>Third-Party Services</h2>
  <p>PromptPolish uses:</p>
  <ul>
    <li><strong>OpenAI API</strong> - to improve your prompts. OpenAI's privacy policy: https://openai.com/privacy</li>
    <li><strong>Cloudflare Workers</strong> - as our backend. Cloudflare's privacy policy: https://www.cloudflare.com/privacypolicy</li>
  </ul>

  <h2>Data Security</h2>
  <p>All data transmission is encrypted via HTTPS.</p>

  <h2>Contact</h2>
  <p>For questions, contact: your-email@example.com</p>

  <p><em>Last updated: 2025-01-11</em></p>
</body>
</html>
```

3. GitHub Settings → Pages → Deploy from main branch
4. URL: `https://yourusername.github.io/promptpolish/privacy.html`

### 옵션 B: Notion (무료)

1. Notion 페이지 생성
2. 위 내용 붙여넣기
3. 우측 상단 "공유" → "웹에서 공개"
4. URL 복사

---

## 5단계: manifest.json 정리

배포 전 버전 확인:

```json
{
  "manifest_version": 3,
  "name": "PromptPolish",
  "version": "1.0.0",
  "description": "AI 프롬프트를 자동으로 개선하는 확장 프로그램",
  ...
}
```

---

## 6단계: 디버깅 로그 제거

배포 전 `console.log` 제거:

```bash
cd /Users/dgsw38/2025-11/prompt-polish

# 모든 console.log 찾기
grep -r "console.log" *.js

# 수동으로 제거 또는 주석 처리
```

---

## 7단계: ZIP 파일 생성

```bash
cd /Users/dgsw38/2025-11
zip -r promptpolish-v1.0.0.zip prompt-polish \
  -x "*.git*" \
  -x "*/backend/*" \
  -x "*/node_modules/*" \
  -x "*.md" \
  -x "*.DS_Store"
```

**포함할 파일:**
- manifest.json
- *.js (background, content, popup, options, promptImprover, diff)
- *.html (popup, options)
- *.css (ui)
- icons/ (아이콘 폴더)

**제외할 파일:**
- backend/ (서버 코드)
- README.md
- .git/

---

## 8단계: 웹 스토어 제출

1. https://chrome.google.com/webstore/devconsole 접속
2. **"새 항목"** 클릭
3. **ZIP 파일 업로드**

### 입력 정보:

**상세 설명 (한국어):**
```
AI 프롬프트를 자동으로 개선하는 확장 프로그램

✨ 주요 기능
• ChatGPT, Claude, Gemini, Perplexity 지원
• Alt+P 단축키로 즉시 프롬프트 개선
• 각 AI 특성에 맞게 최적화
• 원본 수정 후 재개선 가능
• 실시간 수정 및 미리보기

🎯 사용 방법
1. 지원 사이트 방문 (ChatGPT 등)
2. 텍스트 입력창 클릭
3. Alt+P 또는 툴바 버튼 클릭
4. 개선된 프롬프트 확인 및 적용

🔒 개인정보 보호
• 입력한 텍스트만 전송
• 로컬 저장소만 사용
• 외부 추적 없음
```

**상세 설명 (영어):**
```
Automatically improve your AI prompts

✨ Features
• Support for ChatGPT, Claude, Gemini, Perplexity
• Alt+P shortcut for instant improvement
• Optimized for each AI's characteristics
• Re-improve after editing original
• Real-time editing and preview

🎯 How to Use
1. Visit supported sites (ChatGPT, etc.)
2. Click on text input
3. Press Alt+P or toolbar button
4. Review and apply improved prompt

🔒 Privacy
• Only your input text is transmitted
• Local storage only
• No external tracking
```

**카테고리:**
- 생산성 (Productivity)

**언어:**
- 한국어
- English

**가격:**
- 무료

**개인정보처리방침 URL:**
- (4단계에서 만든 URL)

---

## 9단계: 심사 대기

### 예상 시간:
- **일반적**: 1~3일
- **처음 제출**: 최대 1주일

### 심사 거부 사유 (주의):
1. ❌ 개인정보처리방침 없음
2. ❌ 스크린샷 부족/품질 낮음
3. ❌ 설명이 불분명
4. ❌ 악성 코드 의심
5. ❌ 권한 과다 요청

---

## 10단계: 승인 후

### 관리:
- 리뷰 응답
- 버전 업데이트
- 통계 확인

### 업데이트:
1. manifest.json의 version 증가
2. 새 ZIP 생성
3. 웹 스토어에서 "업데이트 업로드"

---

## 💰 비용

- **개발자 등록**: $5 (평생 1회)
- **배포**: 무료
- **유지보수**: 무료

---

## 📈 홍보

승인 후:
- Reddit r/ChatGPT 공유
- Twitter/X 해시태그 #ChatGPT #AI
- Product Hunt 등록
- 개인 블로그/SNS

---

## ⚠️ 주의사항

1. **백엔드 API Key는 절대 포함 금지**
   - Cloudflare Workers에만 저장

2. **사용자 데이터 수집 금지**
   - 분석 도구(Google Analytics 등) 사용 시 명시 필요

3. **정기적 업데이트**
   - Chrome API 변경 시 대응
   - 사용자 피드백 반영

---

## 🆘 문제 해결

### 심사 거부됨:
- 거부 사유 확인
- 수정 후 재제출

### 사용자 불만:
- 웹 스토어 리뷰 응답
- 버그 수정 후 업데이트

---

## 📞 도움말

- Chrome 웹 스토어 문서: https://developer.chrome.com/docs/webstore
- 개발자 대시보드: https://chrome.google.com/webstore/devconsole
- 정책: https://developer.chrome.com/docs/webstore/program-policies

---

준비되면 시작하세요! 🚀
