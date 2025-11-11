/**
 * Node.js + Express Backend for PromptPolish
 *
 * 설치:
 * npm install
 *
 * 실행:
 * npm start
 *
 * 환경변수:
 * OPENAI_API_KEY=sk-your-key npm start
 */

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'PromptPolish API',
    version: '1.0.0',
    status: 'running'
  })
})

// Main endpoint
app.post('/improve', async (req, res) => {
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
      return res.status(500).json({ error: 'Server configuration error: Missing API key' })
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
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      return res.status(500).json({ error: 'OpenAI API failed' })
    }

    const data = await response.json()
    const improved = data.choices?.[0]?.message?.content || draft

    res.json({
      improved: improved.trim(),
      targetAI: targetAI,
      model: 'gpt-4o-mini',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`✨ PromptPolish API running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
