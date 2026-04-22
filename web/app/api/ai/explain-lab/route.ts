import { createClient } from '@/lib/supabase/server'
import { explainLabResults, type LabResult } from '@/shared/ai-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const { lab_report_id } = await request.json()

    if (!lab_report_id) {
      return NextResponse.json({ error: 'Lab report ID required' }, { status: 400 })
    }

    // Fetch lab report with patient details
    const { data: labReport, error: fetchError } = await supabase
      .from('lab_reports')
      .select(
        `
        *,
        patients (
          date_of_birth,
          gender,
          chronic_conditions
        ),
        consultations (
          symptoms
        )
      `
      )
      .eq('id', lab_report_id)
      .single()

    if (fetchError || !labReport) {
      return NextResponse.json(
        { error: 'Lab report not found' },
        { status: 404 }
      )
    }

    // Check if already processed
    if (labReport.ai_explanation) {
      return NextResponse.json({
        explanation: labReport.ai_explanation,
        abnormalities: labReport.ai_abnormalities,
        recommendations: labReport.ai_recommendations,
        confidence: labReport.ai_confidence,
        cached: true,
      })
    }

    // Parse results from JSONB
    const results: LabResult[] = Object.entries(labReport.results).map(
      ([key, value]: [string, any]) => ({
        test_name: key,
        value: value.value,
        unit: value.unit,
        reference_range: value.reference || 'N/A',
      })
    )

    // Calculate patient age
    const patientAge = new Date().getFullYear() - new Date(labReport.patients.date_of_birth).getFullYear()

    // Get AI explanation
    const explanation = await explainLabResults(
      results,
      patientAge,
      labReport.patients.gender,
      labReport.consultations?.symptoms
    )

    // Determine if critical based on urgency
    const isCritical = explanation.urgency === 'urgent'

    // Update lab report with AI analysis
    const { error: updateError } = await supabase
      .from('lab_reports')
      .update({
        ai_explanation: explanation.plain_language,
        ai_abnormalities: explanation.abnormalities,
        ai_recommendations: explanation.recommendations,
        ai_confidence: explanation.confidence,
        ai_model_version: 'gpt-4-turbo-preview',
        ai_processed_at: new Date().toISOString(),
        is_critical: isCritical,
      })
      .eq('id', lab_report_id)

    if (updateError) {
      console.error('Error updating lab report:', updateError)
      // Don't fail the request if update fails, still return explanation
    }

    return NextResponse.json({
      explanation: explanation.plain_language,
      abnormalities: explanation.abnormalities,
      recommendations: explanation.recommendations,
      confidence: explanation.confidence,
      urgency: explanation.urgency,
      is_critical: isCritical,
      cached: false,
    })
  } catch (error) {
    console.error('Error in AI explanation API:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate explanation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
