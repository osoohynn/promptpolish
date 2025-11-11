/**
 * Cloudflare Workers Backend for PromptPolish
 *
 * 배포 방법:
 * 1. https://dash.cloudflare.com/ 접속
 * 2. Workers & Pages → Create application → Create Worker
 * 3. 이 코드 복사 붙여넣기
 * 4. Settings → Variables → Environment Variables 추가:
 *    - OPENAI_API_KEY: sk-your-openai-key
 * 5. Deploy 클릭
 * 6. Worker URL 복사 (예: https://promptpolish.your-name.workers.dev)
 * 7. ../promptImprover.js의 BACKEND_API 변수에 URL 설정
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    })
  }

  // Only POST allowed
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { draft, targetAI, systemPrompt } = body

    // Validation
    if (!draft || draft.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Draft is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (draft.length > 10000) {
      return new Response(JSON.stringify({ error: 'Draft too long (max 10000 chars)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
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
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      return new Response(JSON.stringify({ error: 'OpenAI API failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await openaiResponse.json()
    const improved = data.choices?.[0]?.message?.content || draft

    return new Response(JSON.stringify({
      improved: improved.trim(),
      targetAI: targetAI,
      model: 'gpt-4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
