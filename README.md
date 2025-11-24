# PromptPolish

효과적인 프롬프트 작성을 위한 Chrome 확장 프로그램

## 특징

- ✨ **7가지 프롬프트 작성 방법론 통합 템플릿**
  - XML 태그 구조화 (`<context>`, `<role>`, `<task>` 등)
  - 역할 기반 프롬프트 (`<role>`)
  - 예시 포함 (Few-shot learning)
  - 단계별 사고 과정 (Chain of Thought)
  - 명확한 출력 형식 지정
- 🚀 **빠르고 간편한 사용** - 빈 입력창에서 버튼 한 번으로 템플릿 제공
- 💰 **완전 무료** - API 호출 없음, 백엔드 서버 불필요
- 🎯 **AI별 최적화** - ChatGPT, Claude, Gemini, Perplexity 각각 최적화
- 📝 **자유로운 편집** - 모달에서 템플릿 수정 후 적용

## 설치

1. Chrome에서 `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. "압축해제된 확장 프로그램 로드" 클릭
4. `prompt-polish` 폴더 선택

## 사용 방법

1. 지원 사이트 방문 (ChatGPT, Claude, Gemini, Perplexity)
2. **빈 입력창 클릭** → "📝 템플릿 이용하기" 버튼 표시
3. 버튼 클릭 → 모달에서 템플릿 편집
4. "입력창에 적용" 클릭 → 템플릿이 입력창에 삽입
5. 각 섹션을 채워서 완성된 프롬프트 작성

## 템플릿 구조

제공되는 템플릿은 다음과 같은 섹션으로 구성됩니다:

```xml
<context>
배경 정보나 상황 설명
</context>

<role>
AI의 역할 정의 (예: "10년 경력의 UX 디자이너")
</role>

<task>
구체적인 작업 요청
</task>

<requirements>
구체적인 요구사항
</requirements>

<constraints>
제약사항이나 주의사항
</constraints>

<examples>
입력/출력 예시 3개
</examples>

<thinking_process>
단계별 사고 과정 가이드
</thinking_process>

<output_format>
원하는 출력 형식
</output_format>
```

## 파일 구조

```
prompt-polish/
├── manifest.json          # 확장 프로그램 설정
├── background.js          # 백그라운드 스크립트
├── content.js             # 콘텐츠 스크립트 (메인 로직)
├── promptImprover.js      # 템플릿 생성 로직
├── ui.css                 # UI 스타일
├── popup.html/js          # 팝업
├── options.html/js        # 옵션 페이지
└── README.md              # 이 파일
```

## 지원 사이트

- ✅ ChatGPT (chat.openai.com, chatgpt.com)
- ✅ Claude (claude.ai)
- ✅ Gemini (gemini.google.com)
- ✅ Perplexity (perplexity.ai)

## 참고 자료

이 프로젝트는 Claude 프롬프트 작성 방법론을 기반으로 합니다:
- 직접적이고 구체적인 작성
- XML 태그 활용
- 예시 포함 (Few-shot prompting)
- 단계별 사고 과정 (Chain of Thought)
- 역할 부여
- 명확한 출력 형식 지정

## 라이선스

MIT
