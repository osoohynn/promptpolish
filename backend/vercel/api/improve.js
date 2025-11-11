/**
 * Vercel Serverless Function for PromptPolish
 *
 * 배포 방법:
 * 1. Vercel 계정 생성 (https://vercel.com)
 * 2. vercel CLI 설치: npm install -g vercel
 * 3. 이 폴더에서: vercel
 * 4. Environment Variables 설정:
 *    vercel env add OPENAI_API_KEY
 * 5. 배포: vercel --prod
 * 6. 배포된 URL 사용
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { draft, targetAI, systemPrompt } = req.body

    // Validation
    if (!draft || draft.trim().length === 0) {
      return res.status(400).json({ error: 'Draft is required' })
    }

    if (draft.length > 10000) {
      return res.status(400).json({ error: 'Draft too long (max 10000 chars)' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Call OpenAI
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
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return res.status(500).json({ error: 'OpenAI API failed' })
    }

    const data = await response.json()
    const improved = data.choices?.[0]?.message?.content || draft

    return res.status(200).json({
      improved: improved.trim(),
      targetAI: targetAI,
      model: 'gpt-4o-mini'
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
