<script lang="ts">
  import { appState } from "$lib/state.svelte";
</script>

<div class="flow">
  <h2>Results</h2>
  <h3>Transcript</h3>
  <textarea
    class="result-textarea"
    readonly
    value={appState.transcript}
    placeholder="Transcript will appear here..."
  ></textarea>

  <h3>Medical Note</h3>

  <textarea
    class="result-textarea"
    readonly
    value={appState.medicalNote}
    placeholder="Generated medical note will appear here..."
  ></textarea>

  <p class="warning">
    Generated notes are drafts requiring healthcare provider review and approval
    before use in patient care. The AI process can make mistakes.
  </p>
</div>
