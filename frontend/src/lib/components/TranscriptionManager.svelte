<script lang="ts">
  import { appState, updateStatus, showError } from "$lib/stores/app.svelte";

  let lastTranscriptData = "";
  let lastMedicalNoteData = "";

  // Event callbacks
  let onTranscriptionProgress:
    | ((message: string, isText?: boolean) => void)
    | null = null;
  let onNoteGenerationProgress: ((message: string) => void) | null = null;
  let onNoteGenerationStream: ((streamedNote: string) => void) | null = null;
  let onNoteGenerationComplete: ((finalNote: string) => void) | null = null;

  function onTranscriptionProgressCallback(
    callback: (message: string, isText?: boolean) => void
  ) {
    onTranscriptionProgress = callback;
  }

  function onNoteGenerationProgressCallback(
    callback: (message: string) => void
  ) {
    onNoteGenerationProgress = callback;
  }

  function onNoteGenerationStreamCallback(
    callback: (streamedNote: string) => void
  ) {
    onNoteGenerationStream = callback;
  }

  function onNoteGenerationCompleteCallback(
    callback: (finalNote: string) => void
  ) {
    onNoteGenerationComplete = callback;
  }

  async function saveAndTranscribe(
    audioBlob: Blob,
    noteType: string
  ): Promise<{
    success: boolean;
    transcript?: string;
    medicalNote?: string;
    noteError?: string;
  }> {
    try {
      updateStatus("Transcribing audio...");

      // Simulate transcription process (replace with actual Tauri API calls)
      const mockTranscript = await simulateTranscription(audioBlob);

      if (onTranscriptionProgress) {
        onTranscriptionProgress("Transcription completed successfully!");
        onTranscriptionProgress(mockTranscript, true);
      }

      appState.transcript = mockTranscript;
      appState.lastTranscript = mockTranscript;
      lastTranscriptData = mockTranscript;

      updateStatus("Generating medical note...");

      // Simulate medical note generation
      const mockMedicalNote = await simulateNoteGeneration(
        mockTranscript,
        noteType
      );

      if (onNoteGenerationComplete) {
        onNoteGenerationComplete(mockMedicalNote);
      }

      appState.medicalNote = mockMedicalNote;
      appState.lastMedicalNote = mockMedicalNote;
      lastMedicalNoteData = mockMedicalNote;

      return {
        success: true,
        transcript: mockTranscript,
        medicalNote: mockMedicalNote,
      };
    } catch (error) {
      console.error("Transcription failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Transcription failed: ${errorMessage}`);

      return {
        success: false,
        noteError: errorMessage,
      };
    }
  }

  async function simulateTranscription(audioBlob: Blob): Promise<string> {
    // Simulate transcription delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return a mock transcript
    return `Patient presents with chief complaint of chest pain. 
    
History of Present Illness:
The patient is a 45-year-old male who reports experiencing chest pain for the past 2 hours. The pain is described as pressure-like, located in the center of the chest, and radiates to the left arm. The pain is rated as 8/10 in severity and is associated with shortness of breath and diaphoresis.

The patient denies any recent trauma, fever, or other symptoms. He reports the pain started while he was watching television and has been constant since onset.`;
  }

  async function simulateNoteGeneration(
    transcriptText: string,
    noteType: string
  ): Promise<string> {
    // Simulate note generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (noteType === "soap") {
      return `SOAP NOTE

SUBJECTIVE:
${transcriptText}

OBJECTIVE:
Vital Signs: BP 140/90, HR 95, RR 22, T 98.6°F, O2 Sat 95%
General: Patient appears anxious and in moderate distress
Cardiovascular: Regular rate and rhythm, no murmurs, gallops, or rubs
Respiratory: Clear to auscultation bilaterally
Abdomen: Soft, non-tender, non-distended

ASSESSMENT:
1. Acute chest pain, suspicious for acute coronary syndrome
2. Hypertension
3. Anxiety

PLAN:
1. Immediate ECG and cardiac enzymes
2. Aspirin 325mg PO
3. Nitroglycerin sublingual if systolic BP >90
4. Cardiology consultation
5. Admit to cardiac unit for monitoring`;
    } else {
      return `COMPREHENSIVE MEDICAL NOTE

CHIEF COMPLAINT:
Chest pain

HISTORY OF PRESENT ILLNESS:
${transcriptText}

PAST MEDICAL HISTORY:
- Hypertension (diagnosed 5 years ago)
- Hyperlipidemia
- No known cardiac disease

MEDICATIONS:
- Lisinopril 10mg daily
- Atorvastatin 20mg daily

ALLERGIES:
- No known drug allergies

SOCIAL HISTORY:
- 45-year-old male
- Non-smoker
- Occasional alcohol use
- Works as an accountant

FAMILY HISTORY:
- Father: MI at age 50
- Mother: Hypertension
- No other significant family history

REVIEW OF SYSTEMS:
- Constitutional: No fever, chills, or weight loss
- Cardiovascular: See HPI
- Respiratory: See HPI
- Gastrointestinal: No nausea, vomiting, or abdominal pain
- Musculoskeletal: No joint pain or swelling
- Neurological: No headache, dizziness, or weakness

PHYSICAL EXAMINATION:
Vital Signs: BP 140/90, HR 95, RR 22, T 98.6°F, O2 Sat 95%

General: Patient appears anxious and in moderate distress, diaphoretic

HEENT: Normocephalic, atraumatic, PERRLA, no scleral icterus

Cardiovascular: Regular rate and rhythm, no murmurs, gallops, or rubs, peripheral pulses 2+ bilaterally

Respiratory: Clear to auscultation bilaterally, no wheezes, rales, or rhonchi

Abdomen: Soft, non-tender, non-distended, no hepatosplenomegaly

Extremities: No edema, cyanosis, or clubbing

Neurological: Alert and oriented x3, cranial nerves II-XII intact, motor and sensory function intact

ASSESSMENT:
1. Acute chest pain, suspicious for acute coronary syndrome
2. Hypertension
3. Hyperlipidemia
4. Anxiety

PLAN:
1. Immediate ECG and cardiac enzymes (troponin, CK-MB)
2. Aspirin 325mg PO
3. Nitroglycerin sublingual if systolic BP >90
4. Cardiology consultation
5. Admit to cardiac unit for monitoring
6. Follow-up on cardiac enzyme results
7. Consider stress test or cardiac catheterization based on results`;
    }
  }

  function clearResults() {
    appState.transcript = "";
    appState.medicalNote = "";
    appState.lastTranscript = "";
    appState.lastMedicalNote = "";
    lastTranscriptData = "";
    lastMedicalNoteData = "";
  }

  function getLastTranscript(): string {
    return lastTranscriptData;
  }

  function getLastMedicalNote(): string {
    return lastMedicalNoteData;
  }

  // Expose methods for parent components
  export {
    saveAndTranscribe,
    clearResults,
    getLastTranscript,
    getLastMedicalNote,
    onTranscriptionProgressCallback,
    onNoteGenerationProgressCallback,
    onNoteGenerationStreamCallback,
    onNoteGenerationCompleteCallback,
  };
</script>

<!-- This component doesn't render UI, it just provides transcription functionality -->
