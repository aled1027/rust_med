// Audio Service - Handles recording, transcription, and audio processing
export class AudioService {
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
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.prototype.pause && MediaRecorder.prototype.resume) {
      console.log('Browser supports MediaRecorder pause/resume');
      this.pauseResumeSupported = true;
    } else {
      console.warn('Browser does not support MediaRecorder pause/resume');
      this.pauseResumeSupported = false;
    }
  }

  async startRecording(deviceId?: string): Promise<void> {
    try {
      console.log("About to start recording", deviceId);
      // Enhanced audio constraints for better speech recognition
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

      // Prefer WebM format for better quality, will convert to WAV
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

      return new Promise((resolve, reject) => {
        console.log("Recording started");
        this.mediaRecorder!.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log("Recording data available", event.data.size);
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

        this.mediaRecorder!.start(1000); // Collect data every second
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
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
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
    const numberOfChannels = 1; // Force mono for speech recognition
    const format = 1; // PCM
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
