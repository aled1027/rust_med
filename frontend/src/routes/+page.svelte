<main class="with-sidebar">
  <!-- Sidebar for saved notes -->
  <section class="sidebar">
    <h2>Saved Notes</h2>
    <ul>
      <li>Notes will be dynamically populated here.</li>
      <li>Note 1</li>
      <li>Note 2</li>
      <li>Note 3</li>
    </ul>
  </section>

  <!-- Main view area -->
  <div class="not-sidebar">
    <header>
      <h1>Medical Note Generator</h1>
      <div id="status" class="status">Ready</div>
    </header>
    <section>
      <!-- Patient Information Section -->
      <h2>Patient Information</h2>
      <form>
        <div class="input-group">
          <label for="first-name">First Name:</label>
          <input type="text" id="first-name" placeholder="Enter first name" />
        </div>
        <div class="input-group">
          <label for="lastName">Last Name:</label>
          <input type="text" id="lastName" placeholder="Enter last name" />
        </div>
        <div class="input-group">
          <label for="dob">Date of Birth:</label>
          <input type="date" id="dob" class="patient-input" />
        </div>
        <div class="input-group">
          <label for="note-type">Note Type:</label>
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
          <button id="save-note-btn" class="button" disabled>
            Save Note
          </button>
          <div id="recording-dot" class="recording-dot"></div>
          <span id="recording-txt">Not Recording</span>
          <div class="waveform-container">
            <canvas id="waveform" width="400" height="100"></canvas>
          </div>
        </div>
      </form>
    </section>

    <section>
      <h2>Transcript</h2>
      <textarea id="transcript" placeholder="Transcript will appear here..."
      ></textarea>
    </section>

    <section>
      <div class="section-header">
        <h2 id="m">Medical Note</h2>
        <button class="button">Copy Note</button>
        <p>TODO: why do need to copy the note? Where is it being copied to?</p>
      </div>
      <textarea
        id="medical-note"
        placeholder="Generated medical note will appear here..."
      ></textarea>
      <div class="disclaimer">
        <p>
          Generated notes are drafts requiring healthcare provider review and
          approval before use in patient care. The AI process can make mistakes.
        </p>
      </div>
    </section>

    <!-- Settings Section -->
    <section>
      <h2>Settings</h2>
      <details>
        <summary>Settings</summary>
        <form>
          <h3>User Account</h3>
          <div>
            <p>Guest User</p>
            <button class="button">Login</button>
          </div>

          <!-- Model Settings Section -->
          <h3>AI Models</h3>
          <div class="input-group">
            <label for="transcription-model">Transcription Model:</label>
            <select id="transcription-model">
              <option value="whisper-tiny">Whisper Tiny (39MB)</option>
              <option value="whisper-small">Whisper Small (244MB)</option>
              <option value="whisper-medium">Whisper Medium (1.5GB)</option>
            </select>
            <button class="button">Download</button>
          </div>

          <div class="input-group">
            <label for="llm-model">Language Model:</label>
            <select id="llm-model" class="model-select">
              <option value="med_llama">Medical Llama (4GB)</option>
              <option value="llama2-7b">Llama 2 7B (4GB)</option>
              <option value="mistral-7b">Mistral 7B (4GB)</option>
            </select>
            <button class="btn-small btn-download">Download</button>
          </div>

          <!-- Advanced Settings -->
          <h3>Advanced Settings</h3>
          <div class="input-group">
            <label><input type="checkbox" id="autoSave" />Auto-save notes</label
            >
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
  </div>
</main>
