import {
  appState,
  updateStatus,
  showError,
  clearResults,
  clearPatientInfo,
  reset as resetStore
} from '$lib/stores/app.svelte';
import { audioService } from '$lib/services/audioService';
import { browser } from '$app/environment';

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

interface ApiNote {
  first_name: string;
  last_name: string;
  dob: string;
  note_type: string;
  transcript: string;
  medical_note: string;
}

class TauriService {
  private tauri: typeof window.__TAURI__ | null = null;

  constructor() {
    // Don't initialize during SSR
    if (browser && typeof window.__TAURI__ !== 'undefined') {
      this.tauri = window.__TAURI__;
    }
  }

  private ensureTauri(): typeof window.__TAURI__ {
    if (!this.tauri) {
      if (!browser) {
        throw new Error('Tauri APIs not available during SSR');
      }
      if (typeof window.__TAURI__ === 'undefined') {
        throw new Error('Tauri APIs not available');
      }
      this.tauri = window.__TAURI__;
    }
    return this.tauri;
  }

  async appLocalDataDir(): Promise<string> {
    const tauri = this.ensureTauri();
    return tauri.path.appLocalDataDir();
  }

  async writeFile(path: string, data: string | Uint8Array): Promise<void> {
    const tauri = this.ensureTauri();
    await tauri.fs.writeFile(path, data);
  }

  async transcribeAudio(audioPath: string): Promise<{ success: boolean, transcript: string, error: string | null }> {
    const tauri = this.ensureTauri();
    return tauri.core.invoke('transcribe_audio', {
      audioPath: audioPath
    });
  }

  async generateMedicalNote(transcript: string, noteType: string): Promise<{ success: boolean, note: string, error: string | null }> {
    console.log('Generating medical note...');
    const tauri = this.ensureTauri();
    const result = await tauri.core.invoke('generate_medical_note', {
      transcript: transcript,
      noteType: noteType
    });
    console.log('Medical note generated successfully!');
    return result;
  }

  async saveNote(note: ApiNote): Promise<{ success: boolean, error: string | null }> {
    const tauri = this.ensureTauri();
    const apiNote: ApiNote = {
      first_name: note.first_name,
      last_name: note.last_name,
      dob: note.dob,
      note_type: note.note_type,
      transcript: note.transcript,
      medical_note: note.medical_note
    }
    const saveResult = await tauri.core.invoke('save_patient_note', apiNote);
    return saveResult;
  }
}

class AppService {
  /**
   * Recording timer ID for tracking recording duration.
   * Increments appState.recordingTime every second while recording is active.
   * Set to null when no timer is running.
   */
  private recordingTimerId: number | null = null;
  private tauriService: TauriService | null = null;

  private ensureTauriService(): TauriService {
    if (!this.tauriService) {
      if (!browser) {
        throw new Error('Tauri service not available during SSR');
      }
      this.tauriService = new TauriService();
    }
    return this.tauriService;
  }

  async initialize() {
    try {
      // Only initialize audio service in browser
      if (browser) {
        appState.availableMicrophones = await audioService.getAvailableMicrophones();
        if (appState.availableMicrophones.length > 0) {
          appState.selectedMicrophoneId = appState.availableMicrophones[0].deviceId;
        }
      }
      updateStatus('Ready');
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
    if (this.recordingTimerId) {
      clearInterval(this.recordingTimerId);
    }

    this.recordingTimerId = setInterval(() => {
      appState.recordingTime = appState.recordingTime + 1;
    }, 1000);
  }

  private stopTimer(pause = false) {
    if (this.recordingTimerId) {
      clearInterval(this.recordingTimerId);
      this.recordingTimerId = null;
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
      // TODO: make cross platform
      const appDataDir = await this.ensureTauriService().appLocalDataDir();
      // IF DEBUG:
      const audioPath = `${appDataDir}/debug.wav`;
      // ELSE:
      // const audioPath = `${appDataDir}/temp_audio_${Date.now()}.wav`;
      // const arrayBuffer = await audioBlob.arrayBuffer();
      // const uint8Array = new Uint8Array(arrayBuffer);
      // await this.tauriService.writeFile(audioPath, audioBlob);
      // console.log("Audio written to file", audioPath);

      // Save audio to temporary file and transcribe

      updateStatus('Transcribing audio...');
      console.log('Transcribing audio...');
      const transcriptionResult = await this.ensureTauriService().transcribeAudio(audioPath);
      if (!transcriptionResult.success) {
        console.error('Transcription failed:', transcriptionResult.error);
        throw new Error(transcriptionResult.error || 'Transcription failed');
      }
      console.log('Transcription result:', transcriptionResult);

      appState.transcript = transcriptionResult.transcript;
      appState.lastTranscript = transcriptionResult.transcript;


      updateStatus('Generating medical note...');
      const noteGenResult = await this.ensureTauriService().generateMedicalNote(transcriptionResult.transcript, appState.selectedNoteType);
      console.log('Note generation result:', noteGenResult);

      if (!noteGenResult.success) {
        throw new Error(noteGenResult.error || 'Failed to generate medical note');
      }

      appState.medicalNote = noteGenResult.note;
      appState.lastMedicalNote = noteGenResult.note;
      updateStatus('Note generated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to process recording: ${errorMessage}`);
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

      // Save note using Tauri backend
      const saveResult = await this.ensureTauriService().saveNote({
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

  reset() {
    // Call the imported reset function from the store
    resetStore();
    if (this.recordingTimerId) {
      clearInterval(this.recordingTimerId);
      this.recordingTimerId = null;
    }
    audioService.reset();
    appState.recordingTime = 0;
    appState.isRecording = false;
    appState.isPaused = false;
  }
}

// Create a singleton instance
export const appService = new AppService();
