export interface LabResult {
  test_name: string
  value: string | number
  unit: string
  reference_range: string
}

export interface LabExplanation {
  plain_language: string
  abnormalities: string[]
  recommendations: string[]
  confidence: number
  urgency: 'routine' | 'soon' | 'urgent'
}

export async function explainLabResults(
  results: LabResult[],
  patientAge: number,
  gender: string,
  symptoms?: string
): Promise<LabExplanation> {
  const prompt = `You are a medical AI assistant. Explain these lab results in plain language for a ${patientAge}-year-old ${gender} patient${symptoms ? ` with symptoms: ${symptoms}` : ''}.

Lab Results:
${results.map(r => `- ${r.test_name}: ${r.value} ${r.unit} (normal: ${r.reference_range})`).join('\n')}

Respond ONLY with valid JSON in this exact format:
{
  "plain_language": "simple explanation for patient",
  "abnormalities": ["list", "of", "abnormal", "findings"],
  "recommendations": ["list", "of", "recommendations"],
  "confidence": 0.85,
  "urgency": "routine"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const text = data.content?.[0]?.text || '{}'
  
  try {
    return JSON.parse(text)
  } catch {
    return {
      plain_language: text,
      abnormalities: [],
      recommendations: ['Please consult your doctor for interpretation.'],
      confidence: 0.5,
      urgency: 'routine',
    }
  }
}
