import {
  appState,
  updateStatus,
  showError,
  clearResults,
  clearPatientInfo,
  reset as resetStore
} from '$lib/stores/app.svelte';
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

interface TauriNoteIn {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  noteType: string;
  transcript: string;
  medicalNote: string;
}

interface TauriNote extends TauriNoteIn {
  id: string;
  createdAt: string;
}


export class AudioService {
  // Audio Service - Handles recording, transcription, and audio processing
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;
  private isPaused = false;
  private pauseResumeSupported = false;

  constructor() {
    this.checkPauseResumeSupport();
  }

  private checkPauseResumeSupport() {
    if (typeof MediaRecorder !== 'undefined') {
      console.log('Browser supports MediaRecorder pause/resume');
      this.pauseResumeSupported = true;
    } else {
      console.warn('Browser does not support MediaRecorder pause/resume');
      this.pauseResumeSupported = false;
    }
  }

  async startRecording(deviceId?: string): Promise<void> {
    try {
      const audioConstraints = {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        sampleRate: 44100,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        latency: 0.01,
        volume: 1.0
      };

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });

      const supportedFormats = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4',
        'audio/aac',
        'audio/flac'
      ];

      let selectedFormat = null;
      for (const mimeType of supportedFormats) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedFormat = { mime: mimeType, needsConversion: true };
          break;
        }
      }

      if (!selectedFormat) {
        throw new Error('No audio recording formats supported by your browser');
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: selectedFormat.mime,
        audioBitsPerSecond: 128000
      });

      this.audioChunks = [];
      this.isRecording = true;
      const recordingFrequency = 1000; // Collect data every 1 second

      return new Promise((resolve, reject) => {
        this.mediaRecorder!.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder!.onstop = () => {
          if (!this.isPaused) {
            this.isRecording = false;
            resolve();
          }
        };

        this.mediaRecorder!.onerror = (event) => {
          reject(new Error(`Recording error: ${event.error?.message || 'Unknown error'}`));
        };

        this.mediaRecorder!.start(recordingFrequency); // Collect data every second
        resolve();
      });

    } catch (error) {
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  pauseRecording(): void {
    if (!this.mediaRecorder || !this.pauseResumeSupported) {
      throw new Error('Pause/resume not supported');
    }

    try {
      this.mediaRecorder.pause();
      this.isPaused = true;
    } catch (error) {
      throw new Error(`Failed to pause recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  resumeRecording(): void {
    if (!this.mediaRecorder || !this.pauseResumeSupported) {
      throw new Error('Pause/resume not supported');
    }

    try {
      this.mediaRecorder.resume();
      this.isPaused = false;
    } catch (error) {
      throw new Error(`Failed to resume recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  stopRecording(): void {
    if (!this.mediaRecorder) {
      throw new Error('No active recording');
    }

    try {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
    } catch (error) {
      throw new Error(`Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecordedAudio(): Promise<Blob> {
    if (this.audioChunks.length === 0) {
      throw new Error('No audio data recorded');
    }

    // Create blob from recorded chunks
    const recordedBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });

    // Convert to WAV format for better compatibility with transcription services
    return await this.convertToWav(recordedBlob);
  }

  private async convertToWav(audioBlob: Blob): Promise<Blob> {
    try {
      // Use OfflineAudioContext for better performance
      const audioContext = new (window.AudioContext)({
        sampleRate: 16000  // Whisper prefers 16kHz
      });

      // Read the audio blob as array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Convert to WAV format
      const wavBlob = this.audioBufferToWav(audioBuffer);

      // Clean up audio context
      audioContext.close();

      return wavBlob;

    } catch (error) {
      console.error('Audio conversion failed:', error);
      // Return original blob if conversion fails
      return audioBlob;
    }
  }

  private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const targetSampleRate = 16000;
    const numberOfChannels = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    // Get channel data and convert to mono if needed
    let samples;
    if (audioBuffer.numberOfChannels === 1) {
      samples = audioBuffer.getChannelData(0);
    } else {
      // Mix stereo to mono
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      samples = new Float32Array(left.length);

      for (let i = 0; i < left.length; i++) {
        samples[i] = (left[i] + right[i]) / 2;
      }
    }

    // Resample if needed (simple linear interpolation)
    if (audioBuffer.sampleRate !== targetSampleRate) {
      samples = this.resampleAudio(samples, audioBuffer.sampleRate, targetSampleRate);
    }

    const length = samples.length;
    const arrayBuffer = new ArrayBuffer(44 + length * bytesPerSample);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    this.writeWavHeader(view, length, targetSampleRate, numberOfChannels, bitDepth, bytesPerSample, blockAlign);

    // Convert and write samples
    this.writeSamples(view, samples, 44);

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private resampleAudio(samples: Float32Array, originalSampleRate: number, targetSampleRate: number): Float32Array {
    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.round(samples.length / ratio);
    const resampled = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const index1 = Math.floor(originalIndex);
      const index2 = Math.min(index1 + 1, samples.length - 1);
      const fraction = originalIndex - index1;

      resampled[i] = samples[index1] * (1 - fraction) + samples[index2] * fraction;
    }

    return resampled;
  }

  private writeWavHeader(view: DataView, length: number, sampleRate: number, channels: number, bitDepth: number, bytesPerSample: number, blockAlign: number) {
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * bytesPerSample, true);
    writeString(8, 'WAVE');

    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, channels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * channels * bytesPerSample, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitDepth, true); // BitsPerSample

    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, length * bytesPerSample, true);
  }

  private writeSamples(view: DataView, samples: Float32Array, offset: number) {
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      const intSample = Math.round(sample * 32767);
      view.setInt16(offset + i * 2, intSample, true);
    }
  }

  getRecordingState() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      pauseResumeSupported: this.pauseResumeSupported
    };
  }

  reset(): void {
    this.stopRecording();
    this.audioChunks = [];
    this.stream = null;
    this.mediaRecorder = null;
    this.isRecording = false;
    this.isPaused = false;
  }

  async getAvailableMicrophones(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Available microphones:', devices);
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to get available microphones:', error);
      return [];
    }
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.reset();
  }
}

// Create a singleton instance
export const audioService = new AudioService();

class TauriService {
  private tauri: typeof window.__TAURI__ | null = null;

  ensureTauri(): typeof window.__TAURI__ {
    // TODO: make private
    if (!this.tauri) {
      // Don't initialize during SSR, only in browser
      if (!browser) {
        throw new Error('Tauri APIs not available outside of browser');
      }
      if (typeof window.__TAURI__ === 'undefined') {
        throw new Error('Tauri APIs not available');
      }
      this.tauri = window.__TAURI__;
    }
    return this.tauri;
  }

  async appLocalDataDir(): Promise<string> {
    return this.ensureTauri().path.appLocalDataDir();
  }

  async writeFile(path: string, data: string | Uint8Array): Promise<void> {
    await this.ensureTauri().fs.writeFile(path, data);
  }

  async transcribeAudio(audioPath: string): Promise<{ success: boolean, transcript: string, error: string | null }> {
    return this.ensureTauri().core.invoke('transcribe_audio', {
      audioPath: audioPath
    });
  }

  async generateMedicalNote(transcript: string, noteType: string): Promise<{ success: boolean, note: string, error: string | null }> {
    const result = await this.ensureTauri().core.invoke('generate_medical_note', {
      transcript: transcript,
      noteType: noteType
    });
    return result;
  }

  async loadNotes(): Promise<{ success: boolean, notes: TauriNote[], error: string | null }> {
    const result = await this.ensureTauri().core.invoke('load_patient_notes');
    if (result.success) {
      const notes = result.notes.map((n: any) => ({
        id: n.id,
        firstName: n.first_name,
        lastName: n.last_name,
        dateOfBirth: n.date_of_birth,
        noteType: n.note_type,
        transcript: n.transcript,
        medicalNote: n.medical_note,
        createdAt: n.created_at
      }));
      return { success: true, notes: notes, error: null };
    }
    return { success: false, notes: [], error: result.error };
  }

  async saveNote(note: TauriNoteIn): Promise<{ success: boolean, note_id: string | null, error: string | null }> {
    return await this.ensureTauri().core.invoke('save_patient_note', note);
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
      this.tauriService.ensureTauri();
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


      updateStatus('Generating medical note... (this can take about 30 seconds)');
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


  async saveNote(): Promise<string> {
    updateStatus('Saving note...');
    const tauriNote: TauriNoteIn = {
      firstName: appState.patientInfo.firstName,
      lastName: appState.patientInfo.lastName,
      dateOfBirth: appState.patientInfo.dateOfBirth,
      noteType: appState.selectedNoteType,
      transcript: appState.lastTranscript,
      medicalNote: appState.lastMedicalNote
    }
    const saveResult = await this.ensureTauriService().saveNote(tauriNote);
    if (!saveResult.success || saveResult.note_id === null) {
      throw new Error(saveResult.error || 'Failed to save note');
    }

    updateStatus('Note saved successfully!');

    // TODO: figure out the flow here because this is bad
    clearResults();
    clearPatientInfo();
    appState.lastTranscript = '';
    appState.lastMedicalNote = '';

    return saveResult.note_id;
  }

  async loadNotes(): Promise<TauriNote[]> {
    const loadResult = await this.ensureTauriService().loadNotes();
    if (loadResult.success) {
      return loadResult.notes;
    }
    return [];
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
