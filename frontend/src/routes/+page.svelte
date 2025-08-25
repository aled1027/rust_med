<script lang="ts">
</script>

<main class="flow">
  <header>
    <h1>Medical Note Generator</h1>
    <div id="status" class="status">Ready</div>
  </header>

  <section class="flow">
    <h2>New Note</h2>
    <form class="flow">
      <div class="input-group">
        <label for="first-name">Patient First Name</label>
        <input type="text" id="first-name" placeholder="Enter first name" />
      </div>
      <div class="input-group">
        <label for="last-name">Patient Last Name</label>
        <input type="text" id="last-name" placeholder="Enter last name" />
      </div>
      <div class="input-group">
        <label for="dob">Patient Date of Birth</label>
        <input type="date" id="dob" class="patient-input" />
      </div>
      <div class="input-group">
        <label for="note-type">Note Type</label>
        <select id="note-type">
          <option value="soap">SOAP Note</option>
          <option value="full">Full Note</option>
        </select>
      </div>
      <div>
        <!-- non-input fields; buttons -->
        <button id="start-recording-btn" class="button">
          Start Recording
        </button>
        <button id="pause-recording-btn" class="button" disabled>
          Pause
        </button>
        <button
          id="stop-recording-btn"
          class="button"
          data-type="secondary"
          disabled
        >
          Stop Recording
        </button>
        <button id="save-note-btn" class="button" disabled> Save Note </button>
        <div id="recording-dot" class="recording-dot"></div>
        <!-- <span id="recording-txt">Not Recording</span> -->
        <!-- <div class="waveform-container"> -->
        <!-- <canvas id="waveform" width="400" height="100"></canvas> -->
        <!-- </div> -->
      </div>
    </form>
  </section>

  <section class="flow">
    <h2 id="transcript">Transcript</h2>
    <textarea
      id="transcript-textarea"
      placeholder="Transcript will appear here..."
    ></textarea>
  </section>

  <section class="flow">
    <h2 id="medical-note">Medical Note</h2>
    <p>TODO: why do need to copy the note? Where is it being copied to?</p>
    <button class="button">Copy Note</button>
    <textarea
      id="medical-note"
      placeholder="Generated medical note will appear here..."
    ></textarea>
    <p class="warning">
      Generated notes are drafts requiring healthcare provider review and
      approval before use in patient care. The AI process can make mistakes.
    </p>
  </section>

  <!-- Settings Section -->
  <section class="flow">
    <h2>Settings</h2>
    <details>
      <summary>Settings</summary>
      <form class="flow my-m">
        <h2 id="settings">Settings</h2>
        <h3 id="ai-models">AI Models</h3>
        <div class="input-group">
          <label for="transcription-model">Transcription Model:</label>
          <select id="transcription-model">
            <option value="whisper-tiny">Whisper Tiny (39MB)</option>
            <option value="whisper-small">Whisper Small (244MB)</option>
            <option value="whisper-medium">Whisper Medium (1.5GB)</option>
          </select>
        </div>
        <button class="button">Download</button>

        <div class="input-group">
          <label for="llm-model">Language Model:</label>
          <select id="llm-model" class="model-select">
            <option value="med_llama">Medical Llama (4GB)</option>
            <option value="llama2-7b">Llama 2 7B (4GB)</option>
            <option value="mistral-7b">Mistral 7B (4GB)</option>
          </select>
        </div>
        <button class="button">Download</button>

        <!-- Advanced Settings -->
        <h3 id="advanced-settings">Advanced Settings</h3>
        <div class="input-group">
          <label><input type="checkbox" id="autoSave" />Auto-save notes</label>
        </div>
        <div class="input-group">
          <label
            ><input type="checkbox" id="streamingMode" checked />Enable
            streaming output</label
          >
        </div>
      </form>
    </details>
  </section>
  <footer></footer>
</main>
