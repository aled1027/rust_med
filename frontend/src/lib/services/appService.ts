import {
  appState,
  updateStatus,
  showError,
  clearResults,
  clearPatientInfo,
  reset as resetStore
} from '$lib/stores/app.svelte';

// Tauri API utilities
declare global {
  interface Window {
    __TAURI__: {
      core: { invoke: (command: string, args?: any) => Promise<any> };
      fs: { writeFile: (path: string, data: string | Uint8Array) => Promise<void> };
      path: { appLocalDataDir: () => Promise<string> };
      event: { listen: (event: string, callback: (data: any) => void) => Promise<void> };
    };
  }
}

export class AppService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingInterval: number | null = null;
  private pauseResumeSupported = false;
  private recordingManager: any = null;

  async initialize() {
    try {
      // Initialize the recording manager from the static modules
      await this.loadRecordingManager();
      updateStatus('Ready');
      console.log('Medical Note Generator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      showError('Failed to initialize application');
    }
  }

  private async loadRecordingManager() {
    try {
      // Dynamically import the recording manager from static modules
      const { RecordingManager } = await import('../../../static/modules/recordingManager.js');
      this.recordingManager = new RecordingManager();
      console.log('Recording manager loaded successfully');
    } catch (error) {
      console.error('Failed to load recording manager:', error);
      throw new Error('Failed to load recording manager');
    }
  }

  private getTauriAPI() {
    if (typeof window.__TAURI__ === 'undefined') {
      throw new Error('Tauri APIs not available');
    }
    return window.__TAURI__;
  }

  async startRecording() {
    try {
      updateStatus('Initializing recording...');
      clearResults();

      // Clear last results
      appState.lastTranscript = '';
      appState.lastMedicalNote = '';

      // Check if recording manager is available
      if (!this.recordingManager) {
        throw new Error('Recording manager not initialized');
      }

      // Start actual recording
      await this.recordingManager.startRecording();

      appState.isRecording = true;
      appState.isPaused = false;
      appState.recordingTime = 0;
      this.startTimer();
      updateStatus('Recording...');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to start recording: ${errorMessage}`);
      appState.isRecording = false;
    }
  }

  pauseResumeRecording() {
    try {
      if (!this.recordingManager) {
        throw new Error('Recording manager not initialized');
      }

      if (appState.isPaused) {
        // Resume recording
        updateStatus('Resuming recording...');
        this.recordingManager.resumeRecording();
        appState.isPaused = false;
        this.startTimer();
      } else {
        // Pause recording
        updateStatus('Pausing recording...');
        this.recordingManager.pauseRecording();
        appState.isPaused = true;
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

      if (!this.recordingManager) {
        throw new Error('Recording manager not initialized');
      }

      this.recordingManager.stopRecording();
      appState.isRecording = false;
      appState.isPaused = false;
      this.stopTimer();

      // Process the recorded audio
      this.processRecording();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to stop recording: ${errorMessage}`);
      appState.isRecording = false;
    }
  }

  private startTimer() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }

    this.recordingInterval = setInterval(() => {
      appState.recordingTime = appState.recordingTime + 1;
    }, 1000);
  }

  private stopTimer(pause = false) {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (!pause) {
      appState.recordingTime = 0;
    }
  }

  private async processRecording() {
    try {
      updateStatus('Processing recorded audio...');

      if (!this.recordingManager) {
        throw new Error('Recording manager not initialized');
      }

      // Get the recorded audio blob
      const audioBlob = await this.recordingManager.processRecordedAudio();

      if (!audioBlob) {
        throw new Error('No audio data recorded');
      }

      updateStatus('Audio processed successfully. Starting transcription...');

      // Save audio to temporary file and transcribe
      await this.handleTranscription(audioBlob);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to process recording: ${errorMessage}`);
    }
  }

  private async handleTranscription(audioBlob: Blob) {
    try {
      updateStatus('Transcribing audio...');

      const tauri = this.getTauriAPI();

      // Convert blob to base64 for Tauri
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));

      // Create a temporary file path
      const timestamp = Date.now();
      const tempAudioPath = `temp_audio_${timestamp}.wav`;

      // Save audio to temporary file using Tauri
      const appDataDir = await tauri.path.appLocalDataDir();
      const audioPath = `${appDataDir}/temp/${tempAudioPath}`;

      // Save the audio file first
      await tauri.fs.writeFile(audioPath, uint8Array);

      // Call Tauri transcription
      const transcriptionResult = await tauri.core.invoke('transcribe_audio', {
        audioPath: audioPath
      });

      if (transcriptionResult.success) {
        appState.transcript = transcriptionResult.transcript;
        appState.lastTranscript = transcriptionResult.transcript;

        updateStatus('Generating medical note...');

        // Generate medical note using Tauri
        const noteResult = await tauri.core.invoke('generate_medical_note', {
          transcript: transcriptionResult.transcript,
          noteType: appState.selectedNoteType
        });

        if (noteResult.success) {
          appState.medicalNote = noteResult.note;
          appState.lastMedicalNote = noteResult.note;
          updateStatus('Medical note generated successfully!');
        } else {
          throw new Error(noteResult.error || 'Failed to generate medical note');
        }
      } else {
        throw new Error(transcriptionResult.error || 'Transcription failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Transcription failed: ${errorMessage}`);
      appState.transcript = `Transcription failed: ${errorMessage}`;
      appState.medicalNote = 'Audio saved successfully, but transcription service failed.';
    }
  }

  async saveNote() {
    try {
      // Check if we have both transcript and medical note
      if (!appState.lastTranscript || !appState.lastMedicalNote) {
        showError('No note to save. Please record and generate a note first.');
        return;
      }

      updateStatus('Saving note...');

      const tauri = this.getTauriAPI();

      // Save note using Tauri backend
      const saveResult = await tauri.core.invoke('save_patient_note', {
        first_name: appState.patientInfo.firstName,
        last_name: appState.patientInfo.lastName,
        dob: appState.patientInfo.dateOfBirth,
        note_type: appState.selectedNoteType,
        transcript: appState.lastTranscript,
        medical_note: appState.lastMedicalNote
      });

      if (saveResult.success) {
        updateStatus('Note saved successfully!');
        clearResults();
        clearPatientInfo();
        appState.lastTranscript = '';
        appState.lastMedicalNote = '';
      } else {
        throw new Error(saveResult.error || 'Failed to save note');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to save note: ${errorMessage}`);
    }
  }

  copyNote() {
    if (appState.medicalNote) {
      navigator.clipboard.writeText(appState.medicalNote).then(() => {
        updateStatus('Note copied to clipboard!');
      }).catch(() => {
        showError('Failed to copy note to clipboard');
      });
    }
  }

  reset() {
    // Call the imported reset function from the store
    resetStore();
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    if (this.recordingManager) {
      this.recordingManager.reset();
    }
    appState.recordingTime = 0;
    appState.isRecording = false;
    appState.isPaused = false;
  }
}

// Create a singleton instance
export const appService = new AppService();
