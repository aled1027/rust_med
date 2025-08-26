<script lang="ts">
  let { transcript, medicalNote }: { transcript: string; medicalNote: string } =
    $props();
</script>

<div class="flow">
  <!-- TODO: change to a component for viewing a note. THen use at /notes/note-id -->
  <h2>Results</h2>
  <h3>Transcript</h3>
  <textarea
    class="result-textarea"
    readonly
    value={transcript}
    placeholder="Transcript will appear here..."
  ></textarea>

  <h3>Medical Note</h3>

  <textarea
    class="result-textarea"
    readonly
    value={medicalNote}
    placeholder="Generated medical note will appear here..."
  ></textarea>

  <p class="warning">
    generated notes are drafts requiring healthcare provider review and approval
    before use in patient care. the ai process can make mistakes.
  </p>
</div>
