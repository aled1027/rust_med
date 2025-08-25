import { 
  appStatus, 
  isRecording, 
  isPaused, 
  recordingTime,
  transcript,
  medicalNote,
  lastTranscript,
  lastMedicalNote,
  updateStatus,
  showError,
  clearResults,
  clearPatientInfo,
  reset
} from '$lib/stores/app';

export class AppService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingInterval: number | null = null;
  private pauseResumeSupported = false;

  async initialize() {
    try {
      updateStatus('Ready');
      console.log('Medical Note Generator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      showError('Failed to initialize application');
    }
  }

  async startRecording() {
    try {
      updateStatus('Initializing recording...');
      clearResults();
      
      // Clear last results
      lastTranscript.set('');
      lastMedicalNote.set('');
      
      // For now, we'll simulate recording since we need to handle permissions properly
      this.simulateRecording();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to start recording: ${errorMessage}`);
      isRecording.set(false);
    }
  }

  private simulateRecording() {
    isRecording.set(true);
    isPaused.set(false);
    recordingTime.set(0);
    this.startTimer();
    updateStatus('Recording... (Simulated)');
    
    // Simulate recording for 5 seconds then auto-stop
    setTimeout(() => {
      this.stopRecording();
    }, 5000);
  }

  pauseResumeRecording() {
    try {
      if ($isPaused) {
        // Resume recording
        updateStatus('Resuming recording...');
        isPaused.set(false);
        this.startTimer();
      } else {
        // Pause recording
        updateStatus('Pausing recording...');
        isPaused.set(true);
        this.stopTimer(true);
      }
    } catch (error) {
      console.error('Error in pauseResumeRecording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to pause/resume recording: ${errorMessage}`);
    }
  }

  stopRecording() {
    try {
      updateStatus('Stopping recording...');
      
      isRecording.set(false);
      isPaused.set(false);
      this.stopTimer();
      
      // Process the recorded audio
      this.processRecording();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to stop recording: ${errorMessage}`);
      isRecording.set(false);
    }
  }

  private startTimer() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
    
    this.recordingInterval = setInterval(() => {
      recordingTime.update(time => time + 1);
    }, 1000);
  }

  private stopTimer(pause = false) {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    if (!pause) {
      recordingTime.set(0);
    }
  }

  private async processRecording() {
    try {
      updateStatus('Converting audio to WAV format...');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate transcription
      await this.handleTranscription();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to process recording: ${errorMessage}`);
    }
  }

  private async handleTranscription() {
    try {
      updateStatus('Transcribing audio...');
      
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transcript
      const mockTranscript = `Patient presents with chief complaint of chest pain. 
      
History of Present Illness:
The patient is a 45-year-old male who reports experiencing chest pain for the past 2 hours. The pain is described as pressure-like, located in the center of the chest, and radiates to the left arm. The pain is rated as 8/10 in severity and is associated with shortness of breath and diaphoresis.

The patient denies any recent trauma, fever, or other symptoms. He reports the pain started while he was watching television and has been constant since onset.`;
      
      transcript.set(mockTranscript);
      lastTranscript.set(mockTranscript);
      
      updateStatus('Generating medical note...');
      
      // Simulate note generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock medical note
      const mockMedicalNote = `SOAP NOTE

SUBJECTIVE:
${mockTranscript}

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
      
      medicalNote.set(mockMedicalNote);
      lastMedicalNote.set(mockMedicalNote);
      
      updateStatus('Medical note generated successfully!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Transcription failed: ${errorMessage}`);
      transcript.set(`Transcription failed: ${errorMessage}`);
      medicalNote.set('Audio saved successfully, but transcription service failed.');
    }
  }

  async saveNote() {
    try {
      // Check if we have both transcript and medical note
      if (!$lastTranscript || !$lastMedicalNote) {
        showError('No note to save. Please record and generate a note first.');
        return;
      }

      updateStatus('Saving note...');

      // For now, we'll just show a success message
      // In a real app, this would save to a database or file system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStatus('Note saved successfully!');
      clearResults();
      clearPatientInfo();
      lastTranscript.set('');
      lastMedicalNote.set('');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to save note: ${errorMessage}`);
    }
  }

  copyNote() {
    if ($medicalNote) {
      navigator.clipboard.writeText($medicalNote).then(() => {
        updateStatus('Note copied to clipboard!');
      }).catch(() => {
        showError('Failed to copy note to clipboard');
      });
    }
  }

  reset() {
    reset();
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    recordingTime.set(0);
    isRecording.set(false);
    isPaused.set(false);
  }
}

// Create a singleton instance
export const appService = new AppService();
