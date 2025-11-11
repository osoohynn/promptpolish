// promptImprover.js - Uses backend API (no user API key needed)

const TARGET_PROMPTS = {
  gpt: {
    name: "ChatGPT",
    systemAddition: "Optimize for ChatGPT. Use clear instructions, structured format with numbered steps or bullets. Specify output format explicitly. Include examples if helpful."
  },
  claude: {
    name: "Claude",
    systemAddition: "Optimize for Claude. Use natural conversational style. Provide context and reasoning. Structure with clear sections. Claude excels at long-form detailed responses."
  },
  gemini: {
    name: "Gemini",
    systemAddition: "Optimize for Gemini. Be specific and detailed. Use structured format. Gemini handles multimodal inputs well, so mention if images/documents are involved."
  },
  perplexity: {
    name: "Perplexity",
    systemAddition: "Optimize for Perplexity. Frame as research questions. Request citations and sources. Good for fact-finding and comparative analysis."
  }
};

const BASE_SYSTEM_PROMPT = "You are a prompt optimizer. Rewrite the user's draft prompt to be clearer, more specific, and better structured. Preserve the original intent. Remove unnecessary words. Add structure (goal, requirements, constraints, output format). Respond in the same language as the input.";

// TODO: Replace with your actual backend API endpoint
const BACKEND_API = 'https://promptpolish.kwonsu667.workers.dev';

async function improvePrompt(draft, targetAI = 'gpt') {
  // Build system prompt for target AI
  let systemPrompt = BASE_SYSTEM_PROMPT;
  if (TARGET_PROMPTS[targetAI]) {
    systemPrompt += " " + TARGET_PROMPTS[targetAI].systemAddition;
  }

  try {
    // Call backend API
    const response = await fetch(BACKEND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        draft: draft,
        targetAI: targetAI,
        systemPrompt: systemPrompt
      })
    });

    if (!response.ok) {
      console.warn('[PromptPolish] Backend API failed, using local polish:', response.status);
      return localPolish(draft, targetAI);
    }

    const data = await response.json();
    const improved = data.improved || data.result || draft;
    return improved.trim();
  } catch (error) {
    console.warn('[PromptPolish] Backend API error, using local polish:', error);
    return localPolish(draft, targetAI);
  }
}

function localPolish(draft, targetAI = 'gpt') {
  const text = draft.trim();
  const targetName = TARGET_PROMPTS[targetAI]?.name || 'AI';

  const sections = [];

  sections.push(`# Prompt for ${targetName}`);
  sections.push('');
  sections.push('## Goal');
  sections.push(text);
  sections.push('');
  sections.push('## Requirements');
  sections.push('- Clear and specific output');
  sections.push('- [Add specific requirements here]');
  sections.push('');
  sections.push('## Output Format');
  sections.push('- [Specify desired format]');

  if (targetAI === 'perplexity') {
    sections.push('');
    sections.push('## Sources');
    sections.push('- Please cite sources');
  }

  return sections.join('\n');
}

// Export
if (typeof window !== 'undefined') {
  window.improvePrompt = improvePrompt;
  window.TARGET_PROMPTS = TARGET_PROMPTS;
}
