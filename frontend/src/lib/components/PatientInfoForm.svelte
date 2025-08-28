<script lang="ts">
  import { appState, updateStatus } from "$lib/state.svelte";
  import { appService } from "$lib/services/appService";
  import { goto } from "$app/navigation";

  let firstName = $state("");
  let lastName = $state("");
  let dateOfBirth = $state(new Date().toISOString().split("T")[0]);
  let noteType = $state("soap");
  let transcript = $state("");
  let medicalNote = $state("");

  let recordButtonDataType = $derived.by(() => {
    if (appState.recordingState === "ready") {
      return "record";
    } else if (appState.recordingState === "recording") {
      return "pause";
    } else if (appState.recordingState === "paused") {
      return "pause";
    } else {
      return "record";
    }
  });

  let recordButtonDisabled = $derived.by(() => {
    return !["ready", "recording", "paused"].includes(appState.recordingState);
  });

  let recordButtonText = $derived.by(() => {
    if (appState.recordingState === "ready") {
      return "Start Recording";
    } else if (appState.recordingState === "recording") {
      return "Pause Recording";
    } else if (appState.recordingState === "paused") {
      return "Resume Recording";
    } else {
      return "Processing...";
    }
  });

  function handleRecordButtonClick() {
    if (appState.recordingState === "ready") {
      appService.startRecording();
    } else if (["recording", "paused"].includes(appState.recordingState)) {
      appService.pauseResumeRecording();
    }
  }

  async function stopAndProcessRecording() {
    await appService.stopRecording();

    // TODO:
    const processResult = await appService.processRecording();
    if (processResult.error) {
      return;
    }
    transcript = processResult.transcript;
    medicalNote = processResult.medicalNote;

    updateStatus("Creating note...");
    const noteId = await appService.createNote(
      firstName,
      lastName,
      dateOfBirth,
      noteType,
      transcript,
      medicalNote
    );
    await appService.syncNotes();
    goto(`/notes?noteId=${noteId}`);
  }

  function formatRecordingTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<form onsubmit={(e) => e.preventDefault()}>
  <div class="form-group">
    <label for="first-name">Patient First Name</label>
    <input
      type="text"
      id="first-name"
      placeholder="Enter first name"
      bind:value={firstName}
      required
    />
  </div>

  <div class="form-group">
    <label for="last-name">Patient Last Name</label>
    <input
      type="text"
      id="last-name"
      placeholder="Enter last name"
      bind:value={lastName}
      required
    />
  </div>

  <div class="form-group">
    <label for="date-of-birth">Patient Date of Birth</label>
    <input
      type="date"
      id="date-of-birth"
      name="date-of-birth"
      bind:value={dateOfBirth}
      required
    />
  </div>

  <div class="form-group">
    <label for="note-type">Note Type</label>
    <select id="note-type" bind:value={noteType} required>
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
    {#if appState.recordingState === "recording" || appState.recordingState === "paused"}
      <div class="recording-indicator">
        <div class="recording-dot"></div>
        <span class="recording-time"
          >{formatRecordingTime(appState.recordingTime)}</span
        >
      </div>
    {/if}
  </div>

  <div class="control-buttons">
    <button
      class="button"
      data-type={recordButtonDataType}
      disabled={recordButtonDisabled}
      onclick={handleRecordButtonClick}
    >
      {recordButtonText}
    </button>

    <button
      class="button"
      data-type="stop"
      disabled={appState.recordingState !== "recording"}
      onclick={stopAndProcessRecording}
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
