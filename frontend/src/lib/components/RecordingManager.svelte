<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    appState,
    updateStatus,
    showError,
  } from "$lib/stores/app.svelte";

  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let stream: MediaStream | null = null;
  let recordingInterval: number | null = null;
  let pauseResumeSupported = false;

  onMount(async () => {
    await loadMicrophones();
  });

  onDestroy(() => {
    stopRecording();
    if (recordingInterval) {
      clearInterval(recordingInterval);
    }
  });

  async function loadMicrophones() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );
      appState.availableMicrophones = audioDevices;

      if (audioDevices.length > 0) {
        appState.selectedMicrophoneId = audioDevices[0].deviceId;
      }
    } catch (error) {
      console.error("Failed to load microphones:", error);
      showError("Failed to load microphones");
    }
  }

  async function startRecording() {
    try {
      if (!appState.selectedMicrophoneId) {
        showError("No microphone selected");
        return;
      }

      const constraints = {
        audio: {
          deviceId: appState.selectedMicrophoneId
            ? { exact: appState.selectedMicrophoneId }
            : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Check if pause/resume is supported
      pauseResumeSupported = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      );

      const mimeType = pauseResumeSupported
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      mediaRecorder = new MediaRecorder(stream, { mimeType });

      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        appState.isRecording = true;
        appState.isPaused = false;
        appState.recordingTime = 0;
        startTimer();
        updateStatus("Recording...");
      };

      mediaRecorder.onpause = () => {
        appState.isPaused = true;
        updateStatus("Recording paused...");
      };

      mediaRecorder.onresume = () => {
        appState.isPaused = false;
        updateStatus("Recording...");
      };

      mediaRecorder.onstop = () => {
        appState.isRecording = false;
        appState.isPaused = false;
        stopTimer();
        updateStatus("Processing recording...");
      };

      mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      console.error("Failed to start recording:", error);
      showError("Failed to start recording");
      appState.isRecording = false;
    }
  }

  function pauseRecording() {
    if (
      mediaRecorder &&
      pauseResumeSupported &&
      mediaRecorder.state === "recording"
    ) {
      mediaRecorder.pause();
      stopTimer(true);
    }
  }

  function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      startTimer();
    }
  }

  function stopRecording() {
    if (
      mediaRecorder &&
      (mediaRecorder.state === "recording" || mediaRecorder.state === "paused")
    ) {
      mediaRecorder.stop();

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
    }
  }

  function startTimer() {
    if (recordingInterval) {
      clearInterval(recordingInterval);
    }

    recordingInterval = setInterval(() => {
      appState.recordingTime = appState.recordingTime + 1;
    }, 1000);
  }

  function stopTimer(pause = false) {
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }

    if (!pause) {
      appState.recordingTime = 0;
    }
  }

  function getTimerText(): string {
    const minutes = Math.floor(appState.recordingTime / 60);
    const seconds = appState.recordingTime % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  async function processRecordedAudio(): Promise<Blob> {
    if (audioChunks.length === 0) {
      throw new Error("No audio data recorded");
    }

    // Combine all audio chunks
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

    // Convert to WAV format if needed (simplified - in real app you'd use a proper converter)
    // For now, we'll return the webm blob
    return audioBlob;
  }

  function reset() {
    stopRecording();
    audioChunks = [];
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
    appState.recordingTime = 0;
    appState.isRecording = false;
    appState.isPaused = false;
  }

  // Expose methods for parent components
  export {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    processRecordedAudio,
    reset,
    getTimerText,
  };
</script>

<!-- This component doesn't render UI, it just provides recording functionality -->
