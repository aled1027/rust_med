<script lang="ts">
  import { appState } from "$lib/stores/app.svelte";
  import { appService } from "$lib/services/appService";

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<form class="patient-info-form" onsubmit={(e) => e.preventDefault()}>
  <div class="form-group">
    <label for="first-name">Patient First Name</label>
    <input
      type="text"
      id="first-name"
      placeholder="Enter first name"
      bind:value={appState.patientInfo.firstName}
      required
    />
  </div>

  <div class="form-group">
    <label for="last-name">Patient Last Name</label>
    <input
      type="text"
      id="last-name"
      placeholder="Enter last name"
      bind:value={appState.patientInfo.lastName}
      required
    />
  </div>

  <div class="form-group">
    <label for="dob">Patient Date of Birth</label>
    <input
      type="date"
      id="dob"
      bind:value={appState.patientInfo.dateOfBirth}
      required
    />
  </div>

  <div class="form-group">
    <label for="note-type">Note Type</label>
    <select id="note-type" bind:value={appState.selectedNoteType} required>
      <option value="soap">SOAP Note</option>
      <option value="full">Full Note</option>
    </select>
  </div>

  <div class="form-group">
    <label for="microphone">Microphone</label>
    <select id="microphone" bind:value={appState.selectedMicrophoneId}>
      {#each appState.availableMicrophones as microphone}
        <option value={microphone.deviceId}>
          {microphone.label ||
            `Microphone ${microphone.deviceId.slice(0, 50)}...`}
        </option>
      {/each}
    </select>
  </div>
</form>

<div class="recording-controls">
  <div class="status-display">
    <span class="status-text">{appState.appStatus}</span>
    {#if appState.isRecording}
      <div class="recording-indicator">
        <div class="recording-dot"></div>
        <span class="recording-time">{formatTime(appState.recordingTime)}</span>
      </div>
    {/if}
  </div>

  <div class="control-buttons">
    <button
      class="button start-btn"
      class:recording={appState.isRecording}
      disabled={!appState.canStartRecording}
      onclick={() => appService.startRecording()}
    >
      {#if appState.isRecording}
        Recording...
      {:else}
        Start Recording
      {/if}
    </button>

    <button
      class="button pause-btn"
      class:paused={appState.isPaused}
      disabled={!appState.canPauseResume}
      onclick={() => appService.pauseResumeRecording()}
    >
      {#if appState.isPaused}
        Resume
      {:else}
        Pause
      {/if}
    </button>

    <button
      class="button stop-btn"
      disabled={!appState.canStopRecording}
      onclick={() => appService.stopRecording()}
    >
      Stop Recording
    </button>
  </div>
</div>

<style lang="scss">
  .recording-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .status-display {
    text-align: center;

    .status-text {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--color-text);
    }
  }

  .recording-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;

    .recording-dot {
      width: 12px;
      height: 12px;
      background-color: #ef4444;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .recording-time {
      font-family: monospace;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--color-text);
    }
  }

  .control-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.start-btn {
      background-color: #10b981;
      color: white;

      &:hover:not(:disabled) {
        background-color: #059669;
      }

      &.recording {
        background-color: #ef4444;

        &:hover:not(:disabled) {
          background-color: #dc2626;
        }
      }
    }

    &.pause-btn {
      background-color: #f59e0b;
      color: white;

      &:hover:not(:disabled) {
        background-color: #d97706;
      }

      &.paused {
        background-color: #10b981;

        &:hover:not(:disabled) {
          background-color: #059669;
        }
      }
    }

    &.stop-btn {
      background-color: #6b7280;
      color: white;

      &:hover:not(:disabled) {
        background-color: #4b5563;
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
