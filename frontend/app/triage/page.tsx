'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Download,
  FileText,
  HeartPulse,
  Languages,
  Mic,
  RefreshCw,
  Square,
  Stethoscope,
  Upload,
  Volume2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type TriageLevel = 'Green' | 'Yellow' | 'Red' | 'Black'
type VitalStatus = 'normal' | 'mild anomaly' | 'moderate anomaly' | 'severe anomaly'

type VitalFinding = {
  label: string
  value: string
  status: VitalStatus
  message: string
}

type ExtractedEntities = {
  medications: string[]
  tests: string[]
  diagnoses: string[]
  abnormalFindings: string[]
  notes: string[]
}

type TriageResult = {
  level: TriageLevel
  urgency: string
  reasoning: string[]
  differentials: string[]
  firstAid: string[]
  referral: string
  uncertaintyFlags: string[]
}

type SpeechRecognitionCtor = new () => SpeechRecognition

type SpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type SpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

const initialVitals = {
  systolic: '150',
  diastolic: '92',
  heartRate: '118',
  temperature: '38.7',
  oxygen: '91',
  glucose: '280',
}

const sampleOcrText =
  'Prescription: Metformin 500mg twice daily. Diagnosis: diabetes mellitus. Lab report: blood glucose 280 mg/dL, HbA1c 9.1, oxygen saturation 91%. Doctor note: review urgently if breathing difficulty or chest pain appears.'

const sampleSymptoms =
  'Patient has fever for 3 days, cough, shortness of breath, weakness, and chest discomfort. Symptoms are worsening since morning.'

const dangerTerms = [
  'chest pain',
  'shortness of breath',
  'breathing difficulty',
  'unconscious',
  'confusion',
  'seizure',
  'stroke',
  'severe bleeding',
  'black stool',
  'cyanosis',
  'suicidal',
]

const symptomDictionary = [
  'fever',
  'cough',
  'headache',
  'vomiting',
  'diarrhea',
  'weakness',
  'dizziness',
  'abdominal pain',
  'chest discomfort',
  'rash',
  'burning urination',
  'pain',
]

const medicationTerms = [
  'metformin',
  'insulin',
  'paracetamol',
  'amoxicillin',
  'azithromycin',
  'omeprazole',
  'salbutamol',
  'amlodipine',
  'losartan',
  'aspirin',
]

const testTerms = [
  'blood glucose',
  'hb',
  'hba1c',
  'cbc',
  'creatinine',
  'oxygen saturation',
  'spo2',
  'ecg',
  'x-ray',
  'urine',
]

const diagnosisTerms = [
  'diabetes',
  'hypertension',
  'asthma',
  'pneumonia',
  'anemia',
  'infection',
  'kidney disease',
]

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const candidate =
    (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition
  return candidate ?? null
}

function detectLanguage(text: string) {
  return /[\u0980-\u09FF]/.test(text) ? 'Bengali' : 'English'
}

function normalizeSymptoms(text: string) {
  const language = detectLanguage(text)
  if (!text.trim()) return ''
  if (language === 'English') return text.trim()
  return `Bengali intake captured. Translation fallback needed before clinical review: ${text.trim()}`
}

function splitUnique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function extractStructuredSymptoms(text: string) {
  const lower = text.toLowerCase()
  const symptoms = symptomDictionary.filter((term) => lower.includes(term))
  const dangers = dangerTerms.filter((term) => lower.includes(term))
  const durationMatch = text.match(/(\d+\s*(day|days|hour|hours|week|weeks|month|months))/i)
  const severityMatch = text.match(/\b(mild|moderate|severe|worsening|critical)\b/i)

  return {
    chiefComplaint: symptoms[0] ?? 'Needs CHW confirmation',
    symptomDuration: durationMatch?.[0] ?? 'Not specified',
    painLocation: lower.includes('chest')
      ? 'Chest'
      : lower.includes('abdominal')
        ? 'Abdomen'
        : lower.includes('head')
          ? 'Head'
          : 'Not specified',
    severity: severityMatch?.[0] ?? (dangers.length ? 'severe' : 'not specified'),
    dangerSigns: dangers,
  }
}

function extractEntities(text: string): ExtractedEntities {
  const lower = text.toLowerCase()
  const abnormalPatterns = [
    /glucose\s*\d+/gi,
    /hba1c\s*\d+(\.\d+)?/gi,
    /oxygen saturation\s*\d+/gi,
    /spo2\s*\d+/gi,
    /bp\s*\d+\/\d+/gi,
  ]

  return {
    medications: splitUnique(medicationTerms.filter((term) => lower.includes(term))),
    tests: splitUnique(testTerms.filter((term) => lower.includes(term))),
    diagnoses: splitUnique(diagnosisTerms.filter((term) => lower.includes(term))),
    abnormalFindings: splitUnique(abnormalPatterns.flatMap((pattern) => text.match(pattern) ?? [])),
    notes: text.trim()
      ? splitUnique(
          text
            .split(/[.\n]/)
            .map((line) => line.trim())
            .filter((line) => /urgent|review|follow|refer|doctor|pain|breath/i.test(line))
        )
      : [],
  }
}

function classifyVital(
  label: string,
  value: string,
  mild: (value: number) => boolean,
  moderate: (value: number) => boolean,
  severe: (value: number) => boolean,
  normalMessage: string
): VitalFinding {
  const numericValue = Number(value)
  if (!value || Number.isNaN(numericValue)) {
    return { label, value: 'Missing', status: 'normal', message: 'No value entered' }
  }

  if (severe(numericValue)) {
    return { label, value, status: 'severe anomaly', message: `${label} is in a critical range` }
  }

  if (moderate(numericValue)) {
    return { label, value, status: 'moderate anomaly', message: `${label} needs urgent review` }
  }

  if (mild(numericValue)) {
    return { label, value, status: 'mild anomaly', message: `${label} is outside the usual range` }
  }

  return { label, value, status: 'normal', message: normalMessage }
}

function analyzeVitals(vitals: typeof initialVitals): VitalFinding[] {
  return [
    classifyVital(
      'Systolic BP',
      vitals.systolic,
      (value) => value >= 130 || value < 90,
      (value) => value >= 160 || value < 80,
      (value) => value >= 180 || value < 70,
      'Systolic pressure is acceptable'
    ),
    classifyVital(
      'Diastolic BP',
      vitals.diastolic,
      (value) => value >= 85 || value < 60,
      (value) => value >= 100 || value < 50,
      (value) => value >= 120 || value < 40,
      'Diastolic pressure is acceptable'
    ),
    classifyVital(
      'Heart Rate',
      vitals.heartRate,
      (value) => value > 100 || value < 60,
      (value) => value > 120 || value < 50,
      (value) => value > 140 || value < 40,
      'Heart rate is acceptable'
    ),
    classifyVital(
      'Temperature',
      vitals.temperature,
      (value) => value >= 37.8 || value < 36,
      (value) => value >= 39 || value < 35.5,
      (value) => value >= 40 || value < 35,
      'Temperature is acceptable'
    ),
    classifyVital(
      'Oxygen Saturation',
      vitals.oxygen,
      (value) => value < 95,
      (value) => value < 92,
      (value) => value < 88,
      'Oxygen saturation is acceptable'
    ),
    classifyVital(
      'Blood Glucose',
      vitals.glucose,
      (value) => value > 180 || value < 70,
      (value) => value > 250 || value < 60,
      (value) => value > 350 || value < 50,
      'Blood glucose is acceptable'
    ),
  ]
}

function levelFromScore(score: number): TriageLevel {
  if (score >= 10) return 'Black'
  if (score >= 7) return 'Red'
  if (score >= 3) return 'Yellow'
  return 'Green'
}

function buildTriageResult(
  normalizedSymptoms: string,
  entities: ExtractedEntities,
  vitalFindings: VitalFinding[]
): TriageResult {
  const lower = normalizedSymptoms.toLowerCase()
  const dangerSigns = dangerTerms.filter((term) => lower.includes(term))
  const severeVitals = vitalFindings.filter((finding) => finding.status === 'severe anomaly')
  const moderateVitals = vitalFindings.filter((finding) => finding.status === 'moderate anomaly')
  const mildVitals = vitalFindings.filter((finding) => finding.status === 'mild anomaly')

  const score =
    dangerSigns.length * 3 +
    severeVitals.length * 4 +
    moderateVitals.length * 2 +
    mildVitals.length +
    entities.abnormalFindings.length +
    (lower.includes('worsening') ? 2 : 0)

  const level = levelFromScore(score)
  const reasoning = [
    dangerSigns.length
      ? `Danger signs detected: ${dangerSigns.join(', ')}.`
      : 'No explicit danger sign was detected in the symptom text.',
    severeVitals.length || moderateVitals.length
      ? `Vitals needing attention: ${[...severeVitals, ...moderateVitals]
          .map((finding) => `${finding.label} ${finding.value}`)
          .join(', ')}.`
      : 'Entered vitals do not show urgent anomalies.',
    entities.abnormalFindings.length
      ? `Document findings include: ${entities.abnormalFindings.join(', ')}.`
      : 'No abnormal lab value was extracted from the uploaded text.',
  ]

  const differentials = splitUnique([
    lower.includes('fever') || lower.includes('cough') ? 'Respiratory infection' : '',
    lower.includes('shortness of breath') || lower.includes('oxygen') ? 'Respiratory distress' : '',
    lower.includes('chest') ? 'Cardiac or pulmonary cause' : '',
    entities.diagnoses.includes('diabetes') || lower.includes('glucose') ? 'Diabetes-related complication' : '',
    lower.includes('vomiting') || lower.includes('diarrhea') ? 'Dehydration or gastrointestinal infection' : '',
  ])

  const firstAid =
    level === 'Green'
      ? ['Record symptoms, advise fluids/rest as appropriate, and schedule routine follow-up.']
      : level === 'Yellow'
        ? ['Keep patient under observation, repeat vitals, and arrange medical review soon.']
        : level === 'Red'
          ? ['Keep airway clear, monitor vitals, avoid oral intake if unstable, and arrange urgent referral.']
          : ['Activate emergency response immediately, keep airway/breathing/circulation supported, and transfer now.']

  return {
    level,
    urgency:
      level === 'Green'
        ? 'Non-urgent monitoring'
        : level === 'Yellow'
          ? 'Medical review needed soon'
          : level === 'Red'
            ? 'Urgent referral required'
            : 'Immediate emergency protocol',
    reasoning,
    differentials: differentials.length ? differentials : ['Insufficient information; physician review required'],
    firstAid,
    referral:
      level === 'Green'
        ? 'Refer if symptoms persist or worsen.'
        : level === 'Yellow'
          ? 'Refer to local physician or clinic within the same day.'
          : level === 'Red'
            ? 'Refer to emergency or specialist care immediately.'
            : 'Immediate emergency transfer with senior medical supervision.',
    uncertaintyFlags: splitUnique([
      normalizedSymptoms ? '' : 'No symptom transcript entered',
      entities.notes.length ? '' : 'Medical history document was not available or not readable',
      vitalFindings.some((finding) => finding.value === 'Missing') ? 'Some vitals are missing' : '',
    ]),
  }
}

function statusClass(status: VitalStatus) {
  if (status === 'severe anomaly') return 'border-red-300 bg-red-50 text-red-900'
  if (status === 'moderate anomaly') return 'border-amber-300 bg-amber-50 text-amber-950'
  if (status === 'mild anomaly') return 'border-yellow-300 bg-yellow-50 text-yellow-950'
  return 'border-emerald-200 bg-emerald-50 text-emerald-900'
}

function levelClass(level: TriageLevel) {
  if (level === 'Black') return 'bg-zinc-950 text-white'
  if (level === 'Red') return 'bg-red-600 text-white'
  if (level === 'Yellow') return 'bg-amber-400 text-zinc-950'
  return 'bg-emerald-600 text-white'
}

export default function TriagePage() {
  const [patientName, setPatientName] = useState('Demo Patient')
  const [age, setAge] = useState('42')
  const [gender, setGender] = useState('Female')
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Bengali'>('English')
  const [transcript, setTranscript] = useState(sampleSymptoms)
  const [ocrText, setOcrText] = useState(sampleOcrText)
  const [vitals, setVitals] = useState(initialVitals)
  const [uploadedFile, setUploadedFile] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const normalizedSymptoms = useMemo(() => normalizeSymptoms(transcript), [transcript])
  const structuredSymptoms = useMemo(() => extractStructuredSymptoms(normalizedSymptoms), [normalizedSymptoms])
  const entities = useMemo(() => extractEntities(ocrText), [ocrText])
  const vitalFindings = useMemo(() => analyzeVitals(vitals), [vitals])
  const triage = useMemo(
    () => buildTriageResult(normalizedSymptoms, entities, vitalFindings),
    [entities, normalizedSymptoms, vitalFindings]
  )

  const reportText = useMemo(() => {
    const date = new Date().toLocaleString()
    return [
      'Rural Healthcare Triage & Decision Support Report',
      `Generated: ${date}`,
      `Patient: ${patientName || 'Unnamed'} | Age: ${age || 'N/A'} | Gender: ${gender || 'N/A'}`,
      '',
      'Decision support disclaimer: This output assists community health workers and must be verified by a qualified physician.',
      '',
      `Triage: ${triage.level} - ${triage.urgency}`,
      `Referral: ${triage.referral}`,
      '',
      'Symptoms',
      `Original transcript: ${transcript || 'N/A'}`,
      `Normalized text: ${normalizedSymptoms || 'N/A'}`,
      `Chief complaint: ${structuredSymptoms.chiefComplaint}`,
      `Duration: ${structuredSymptoms.symptomDuration}`,
      `Severity: ${structuredSymptoms.severity}`,
      `Danger signs: ${structuredSymptoms.dangerSigns.join(', ') || 'None detected'}`,
      '',
      'Vitals',
      ...vitalFindings.map((finding) => `${finding.label}: ${finding.value} - ${finding.status} (${finding.message})`),
      '',
      'Extracted Medical History',
      `Medications: ${entities.medications.join(', ') || 'None extracted'}`,
      `Tests: ${entities.tests.join(', ') || 'None extracted'}`,
      `Diagnoses: ${entities.diagnoses.join(', ') || 'None extracted'}`,
      `Abnormal findings: ${entities.abnormalFindings.join(', ') || 'None extracted'}`,
      '',
      'Reasoning',
      ...triage.reasoning.map((item) => `- ${item}`),
      '',
      'Possible Differentials',
      ...triage.differentials.map((item) => `- ${item}`),
      '',
      'Immediate Steps',
      ...triage.firstAid.map((item) => `- ${item}`),
      '',
      'Uncertainty Flags',
      ...(triage.uncertaintyFlags.length ? triage.uncertaintyFlags.map((item) => `- ${item}`) : ['- None']),
    ].join('\n')
  }, [
    age,
    entities,
    gender,
    normalizedSymptoms,
    patientName,
    structuredSymptoms,
    transcript,
    triage,
    vitalFindings,
  ])

  const startListening = () => {
    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) {
      setTranscript((current) =>
        current
          ? current
          : 'Browser speech recognition is unavailable. Type the patient symptoms here as the manual fallback.'
      )
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = preferredLanguage === 'Bengali' ? 'bn-BD' : 'en-US'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const latest = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
      setTranscript((current) => `${current ? `${current} ` : ''}${latest}`.trim())
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const speakSummary = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const summary = `${triage.level} triage. ${triage.urgency}. ${triage.reasoning[0]} ${triage.referral}`
    const utterance = new SpeechSynthesisUtterance(
      preferredLanguage === 'Bengali'
        ? `Clinical support summary. ${summary}`
        : summary
    )
    utterance.lang = preferredLanguage === 'Bengali' ? 'bn-BD' : 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  const downloadReport = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `triage-report-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

  const resetDemo = () => {
    setPatientName('Demo Patient')
    setAge('42')
    setGender('Female')
    setPreferredLanguage('English')
    setTranscript(sampleSymptoms)
    setOcrText(sampleOcrText)
    setVitals({ systolic: '150', diastolic: '92', heartRate: '118', temperature: '38.7', oxygen: '91', glucose: '280' })
    setUploadedFile('')
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
              <Stethoscope className="h-4 w-4" />
              AI-powered rural healthcare triage
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">
              Community clinic decision support
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Capture symptoms, digitize documents, analyze vitals, generate a triage recommendation, speak a summary,
              and prepare a physician-ready report. This is decision support only, not a final diagnosis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetDemo}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Load demo
            </Button>
            <Button onClick={speakSummary}>
              <Volume2 className="mr-2 h-4 w-4" />
              Speak summary
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-teal-700" />
              <h2 className="text-lg font-semibold">Patient intake</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm font-medium">
                Patient name
                <Input value={patientName} onChange={(event) => setPatientName(event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Age
                <Input value={age} onChange={(event) => setAge(event.target.value)} inputMode="numeric" />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Gender
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                  <option>Not specified</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-fit rounded-md border border-zinc-200 bg-zinc-50 p-1">
                {(['English', 'Bengali'] as const).map((language) => (
                  <button
                    key={language}
                    onClick={() => setPreferredLanguage(language)}
                    className={cn(
                      'rounded px-3 py-1.5 text-sm font-medium',
                      preferredLanguage === language ? 'bg-white text-teal-800 shadow-sm' : 'text-zinc-600'
                    )}
                  >
                    {language}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={isListening ? stopListening : startListening}>
                  {isListening ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isListening ? 'Stop' : 'Voice intake'}
                </Button>
              </div>
            </div>
            <label className="mt-4 block space-y-1 text-sm font-medium">
              Original transcript or manual fallback
              <textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6"
              />
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['Chief complaint', structuredSymptoms.chiefComplaint],
                ['Duration', structuredSymptoms.symptomDuration],
                ['Pain location', structuredSymptoms.painLocation],
                ['Severity', structuredSymptoms.severity],
                ['Language', detectLanguage(transcript)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <div className="text-xs font-medium uppercase text-zinc-500">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-700" />
              <h2 className="text-lg font-semibold">Prescription and lab report digitization</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent">
                <Upload className="mr-2 h-4 w-4" />
                Upload image/PDF
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(event) => setUploadedFile(event.target.files?.[0]?.name ?? '')}
                />
              </label>
              <span className="text-sm text-zinc-600">
                {uploadedFile || 'OCR API placeholder: paste extracted text below if API is unavailable.'}
              </span>
            </div>
            <label className="mt-4 block space-y-1 text-sm font-medium">
              OCR raw text or manual correction
              <textarea
                value={ocrText}
                onChange={(event) => setOcrText(event.target.value)}
                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6"
              />
            </label>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ['Medications', entities.medications],
                ['Tests', entities.tests],
                ['Diagnoses', entities.diagnoses],
                ['Abnormal findings', entities.abnormalFindings],
              ].map(([label, values]) => (
                <div key={label as string} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <div className="text-xs font-medium uppercase text-zinc-500">{label}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(values as string[]).length ? (
                      (values as string[]).map((value) => (
                        <span key={value} className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs font-medium">
                          {value}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500">None extracted</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-red-700" />
              <h2 className="text-lg font-semibold">Vitals and anomaly detection</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['systolic', 'Systolic BP', 'mmHg'],
                ['diastolic', 'Diastolic BP', 'mmHg'],
                ['heartRate', 'Heart rate', 'bpm'],
                ['temperature', 'Temperature', 'C'],
                ['oxygen', 'Oxygen saturation', '%'],
                ['glucose', 'Blood glucose', 'mg/dL'],
              ].map(([key, label, unit]) => (
                <label key={key} className="space-y-1 text-sm font-medium">
                  {label}
                  <div className="flex">
                    <Input
                      value={vitals[key as keyof typeof initialVitals]}
                      onChange={(event) => setVitals((current) => ({ ...current, [key]: event.target.value }))}
                      inputMode="decimal"
                    />
                    <span className="ml-2 flex h-10 min-w-16 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs text-zinc-600">
                      {unit}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {vitalFindings.map((finding) => (
                <div key={finding.label} className={cn('rounded-md border p-3', statusClass(finding.status))}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{finding.label}</span>
                    <span className="rounded bg-white/70 px-2 py-1 text-xs font-medium">{finding.status}</span>
                  </div>
                  <p className="mt-1 text-sm">{finding.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-700" />
              <h2 className="text-lg font-semibold">AI triage result</h2>
            </div>
            <div className={cn('rounded-md p-4 text-center', levelClass(triage.level))}>
              <div className="text-sm font-medium">Triage level</div>
              <div className="mt-1 text-4xl font-bold">{triage.level}</div>
              <div className="mt-1 text-sm">{triage.urgency}</div>
            </div>
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <div className="flex gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Verify with a qualified physician.
              </div>
              <p className="mt-1">This prototype supports triage decisions but does not provide a final diagnosis.</p>
            </div>
            <div className="mt-4 space-y-4">
              <ResultList title="Reasoning" items={triage.reasoning} />
              <ResultList title="Differential possibilities" items={triage.differentials} />
              <ResultList title="Immediate steps" items={triage.firstAid} />
              <ResultList title="Referral" items={[triage.referral]} />
              <ResultList title="Uncertainty flags" items={triage.uncertaintyFlags.length ? triage.uncertaintyFlags : ['None']} />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-indigo-700" />
              <h2 className="text-lg font-semibold">Report generation</h2>
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-800">
              {reportText}
            </pre>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={downloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download TXT
              </Button>
              <Button onClick={printReport}>
                <FileText className="mr-2 h-4 w-4" />
                Print PDF
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-600">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-zinc-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
