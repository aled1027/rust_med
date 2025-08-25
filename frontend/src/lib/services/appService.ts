import {
  appState,
  updateStatus,
  showError,
  clearResults,
  clearPatientInfo,
  reset as resetStore
} from '$lib/stores/app.svelte';
import { audioService } from '$lib/services/audioService';

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
  private recordingInterval: number | null = null;

  async initialize() {
    try {
      // Load available microphones
      appState.availableMicrophones = await audioService.getAvailableMicrophones();
      console.log('Init init microphones:', appState.availableMicrophones);
      if (appState.availableMicrophones.length > 0) {
        appState.selectedMicrophoneId = appState.availableMicrophones[0].deviceId;
        console.log('Selected microphone:', appState.selectedMicrophoneId);
      }

      updateStatus('Ready');
      console.log('Medical Note Generator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      showError('Failed to initialize application');
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

      // Start actual recording using audio service
      await audioService.startRecording(appState.selectedMicrophoneId);

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
      if (appState.isPaused) {
        // Resume recording
        updateStatus('Resuming recording...');
        audioService.resumeRecording();
        appState.isPaused = false;
        this.startTimer();
      } else {
        // Pause recording
        updateStatus('Pausing recording...');
        audioService.pauseRecording();
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

      audioService.stopRecording();
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

      // Get the recorded audio blob from audio service
      const audioBlob = await audioService.getRecordedAudio();

      if (!audioBlob) {
        throw new Error('No audio data recorded');
      }

      updateStatus('Audio processed successfully. Starting transcription...');

      // Write the audio to a file
      const appDataDir = await this.getTauriAPI().path.appLocalDataDir();
      const audioPath = `${appDataDir}/temp_audio_${Date.now()}.wav`;
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await this.getTauriAPI().fs.writeFile(audioPath, uint8Array);
      console.log("Audio written to file", audioPath);

      // Save audio to temporary file and transcribe
      await this.handleTranscription(audioPath);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to process recording: ${errorMessage}`);
    }
  }

  private async handleTranscription(audioPath: string) {
    try {
      updateStatus('Transcribing audio...');

      const tauri = this.getTauriAPI();
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
    audioService.reset();
    appState.recordingTime = 0;
    appState.isRecording = false;
    appState.isPaused = false;
  }
}

// Create a singleton instance
export const appService = new AppService();
