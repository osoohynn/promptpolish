// promptImprover.js - Template-based prompt improvement

const TARGET_PROMPTS = {
  gpt: {
    name: "ChatGPT"
  },
  claude: {
    name: "Claude"
  },
  gemini: {
    name: "Gemini"
  },
  perplexity: {
    name: "Perplexity"
  }
};

async function improvePrompt(draft, targetAI = 'gpt') {
  // 템플릿 방식으로 변경 - API 호출 제거
  return createPromptTemplate(draft, targetAI);
}

// 7가지 프롬프트 작성 방법론을 모두 포함한 통합 템플릿
function createPromptTemplate(draft, targetAI = 'gpt') {
  const text = draft.trim();
  const targetName = TARGET_PROMPTS[targetAI]?.name || 'AI';

  // Claude용 특화 가이드
  const thinkingGuide = targetAI === 'claude'
    ? '\n\n응답하기 전에 <thinking> 태그 안에서 단계별로 사고 과정을 보여주세요.'
    : '';

  // draft가 비어있으면 placeholder 제공
  const taskContent = text.length > 0
    ? text
    : '[여기에 AI에게 요청할 구체적인 작업을 작성하세요]';

  const template = `<context>
[여기에 배경 정보나 상황을 설명하세요. 어디서, 누가, 어떻게 사용할지 구체적으로 작성하면 더 좋은 결과를 얻을 수 있습니다.]
</context>

<role>
당신은 [전문가 역할]입니다.
예: "당신은 10년 경력의 UX 디자이너입니다" 또는 "당신은 법률 전문가입니다"
</role>

<task>
${taskContent}
</task>

<requirements>
- [구체적인 요구사항 1]
- [구체적인 요구사항 2]
- [구체적인 요구사항 3]
</requirements>

<constraints>
- [제약사항이나 주의사항]
- 예: "500자 이내로 작성", "전문용어 사용 금지" 등
</constraints>

<examples>
<example>
[입력 예시 1]
---
[기대하는 출력 예시 1]
</example>

<example>
[입력 예시 2]
---
[기대하는 출력 예시 2]
</example>

<example>
[입력 예시 3]
---
[기대하는 출력 예시 3]
</example>
</examples>

<thinking_process>
다음 순서로 단계적으로 접근해주세요:
1. [첫 번째 단계]
2. [두 번째 단계]
3. [세 번째 단계]${thinkingGuide}
</thinking_process>

<output_format>
[원하는 출력 형식을 구체적으로 명시하세요]
예:
- JSON 형식
- 마크다운 표 형식
- 번호가 매겨진 리스트
- 코드 블록
등
</output_format>`;

  return template;
}

// Export
if (typeof window !== 'undefined') {
  window.improvePrompt = improvePrompt;
  window.TARGET_PROMPTS = TARGET_PROMPTS;
}
