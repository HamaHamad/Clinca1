import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export interface LabResult {
  test_name: string
  value: number | string
  unit: string
  reference_range: string
}

export interface LabExplanation {
  plain_language: string
  abnormalities: string[]
  recommendations: string[]
  urgency: 'normal' | 'monitor' | 'urgent'
  confidence: 'high' | 'medium' | 'low'
}

export interface PrescriptionCheck {
  allergy_warnings: string[]
  interaction_warnings: string[]
  dosage_appropriate: boolean
  cheaper_alternative?: string
  safety_notes: string[]
}

/**
 * Generate plain-language explanation of lab results using AI
 */
export async function explainLabResults(
  results: LabResult[],
  patientAge: number,
  patientGender: string,
  symptoms?: string[]
): Promise<LabExplanation> {
  const resultsText = results
    .map(
      (r) =>
        `${r.test_name}: ${r.value} ${r.unit} (Reference: ${r.reference_range})`
    )
    .join('\n')

  const symptomsText = symptoms?.length ? `Symptoms: ${symptoms.join(', ')}` : ''

  const prompt = `You are a medical AI assistant helping patients understand their lab results in simple language.

Patient: ${patientAge} years old, ${patientGender}
${symptomsText}

Lab Results:
${resultsText}

Provide:
1. Plain language explanation (2-3 sentences) - what do these results mean?
2. List any abnormalities found
3. General recommendations (NOT medical advice)
4. Urgency level: normal, monitor, or urgent
5. Your confidence level: high, medium, or low

IMPORTANT: 
- Use simple, non-technical language
- Avoid alarming language
- Always mention "consult your doctor"
- This is educational, not diagnostic

Respond in JSON format:
{
  "plain_language": "...",
  "abnormalities": ["..."],
  "recommendations": ["..."],
  "urgency": "normal|monitor|urgent",
  "confidence": "high|medium|low"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a medical AI assistant that explains lab results in simple language for patients. Always be accurate, empathetic, and clear that this is educational only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for medical accuracy
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const explanation: LabExplanation = JSON.parse(content)
    return explanation
  } catch (error) {
    console.error('Error explaining lab results:', error)
    
    // Fallback: basic rule-based explanation
    return {
      plain_language:
        'Unable to generate AI explanation. Please consult your doctor to review these results.',
      abnormalities: [],
      recommendations: ['Discuss results with your doctor'],
      urgency: 'normal',
      confidence: 'low',
    }
  }
}

/**
 * Check prescription for safety issues (allergies, interactions, dosage)
 */
export async function checkPrescriptionSafety(
  medication: string,
  dosage: string,
  patientAllergies: string[],
  currentMedications: string[],
  patientAge: number,
  patientWeight?: number
): Promise<PrescriptionCheck> {
  const prompt = `You are a medical AI assistant checking prescription safety.

Medication: ${medication}
Dosage: ${dosage}
Patient Age: ${patientAge} years
Patient Weight: ${patientWeight ? `${patientWeight} kg` : 'Not provided'}

Patient Allergies: ${patientAllergies.length > 0 ? patientAllergies.join(', ') : 'None reported'}
Current Medications: ${currentMedications.length > 0 ? currentMedications.join(', ') : 'None'}

Check for:
1. Allergy warnings based on known allergies
2. Drug interactions with current medications
3. Dosage appropriateness for age/weight
4. Cheaper generic alternatives (if any)
5. General safety notes

Respond in JSON format:
{
  "allergy_warnings": ["..."],
  "interaction_warnings": ["..."],
  "dosage_appropriate": true/false,
  "cheaper_alternative": "generic name or null",
  "safety_notes": ["..."]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a medical AI assistant that checks prescriptions for safety issues. Be thorough but not overly cautious. Flag real concerns.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Very low temperature for safety checks
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const check: PrescriptionCheck = JSON.parse(content)
    return check
  } catch (error) {
    console.error('Error checking prescription:', error)
    
    // Fallback: conservative safety check
    return {
      allergy_warnings: patientAllergies.length > 0 
        ? ['Unable to verify allergy interactions - please check manually']
        : [],
      interaction_warnings: currentMedications.length > 0
        ? ['Unable to verify drug interactions - please check manually']
        : [],
      dosage_appropriate: true, // Assume appropriate, doctor must verify
      safety_notes: ['AI safety check unavailable - doctor must verify all details'],
    }
  }
}

/**
 * Generate differential diagnosis suggestions (doctor-in-the-loop)
 */
export async function suggestDifferentialDiagnosis(
  symptoms: string[],
  vitals: any,
  patientAge: number,
  patientGender: string,
  medicalHistory: string[]
): Promise<string[]> {
  const vitalsText = Object.entries(vitals)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')

  const prompt = `Patient: ${patientAge} years old, ${patientGender}
Symptoms: ${symptoms.join(', ')}
Vitals: ${vitalsText}
Medical History: ${medicalHistory.length > 0 ? medicalHistory.join(', ') : 'None'}

List 3-5 most likely differential diagnoses in order of probability. Consider common conditions in low-resource settings (e.g., malaria, TB, typhoid, anemia, hypertension, diabetes).

Respond with JSON array: ["diagnosis 1", "diagnosis 2", ...]`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a medical AI assistant helping doctors with differential diagnosis. Focus on common conditions in low-resource healthcare settings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const result = JSON.parse(content)
    return result.diagnoses || []
  } catch (error) {
    console.error('Error generating differential diagnosis:', error)
    return []
  }
}

/**
 * Voice transcription using Whisper
 */
export async function transcribeVoice(audioBlob: Blob): Promise<string> {
  try {
    const audioFile = new File([audioBlob], 'voice.webm', {
      type: 'audio/webm',
    })

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Can be parameterized for multi-language
    })

    return transcription.text
  } catch (error) {
    console.error('Error transcribing voice:', error)
    throw new Error('Failed to transcribe voice')
  }
}

/**
 * Text-to-speech for reading explanations aloud
 */
export async function textToSpeech(text: string, language: string = 'en'): Promise<Blob> {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy', // Can be parameterized
      input: text,
    })

    const buffer = await response.arrayBuffer()
    return new Blob([buffer], { type: 'audio/mpeg' })
  } catch (error) {
    console.error('Error generating speech:', error)
    throw new Error('Failed to generate speech')
  }
}

/**
 * Imaging analysis (basic - for TB screening on chest X-rays)
 * Note: This is a placeholder - real implementation would use specialized medical imaging models
 */
export async function analyzeChestXray(imageBase64: string): Promise<{
  findings: string[]
  tb_likelihood: 'low' | 'medium' | 'high'
  confidence: 'low' | 'medium' | 'high'
  recommendation: string
}> {
  const prompt = `Analyze this chest X-ray image for signs of tuberculosis (TB) and other abnormalities.

Provide:
1. List of findings (e.g., "consolidation upper right lobe", "pleural effusion")
2. TB likelihood: low, medium, or high
3. Confidence level
4. Recommendation for doctor

CRITICAL: This is AI-assisted screening only. Doctor review is MANDATORY.

Respond in JSON format:
{
  "findings": ["..."],
  "tb_likelihood": "low|medium|high",
  "confidence": "low|medium|high",
  "recommendation": "..."
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a medical AI assistant analyzing chest X-rays for TB screening in low-resource settings. Be conservative and always recommend doctor review.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error analyzing X-ray:', error)
    return {
      findings: ['Unable to analyze - please review manually'],
      tb_likelihood: 'low',
      confidence: 'low',
      recommendation: 'AI analysis unavailable. Manual radiologist review required.',
    }
  }
}
