<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { browser } from "$app/environment";
  import { appState } from "$lib/stores/app.svelte";

  let notes = $state<any[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadNotes() {
    if (browser) {
      loading = true;
      error = null;
      try {
        console.log("Notes page: loadNotes called");
        const result = await appService.loadNotes();
        console.log("Notes page: loadNotes result:", result);
        if (result.success) {
          notes = result.notes;
        } else {
          error = result.error || "Failed to load notes";
          console.error("Failed to load notes:", result.error);
        }
      } catch (err) {
        error = err instanceof Error ? err.message : "Unknown error";
        console.error("Error loading notes:", err);
      } finally {
        loading = false;
      }
    }
  }

  async function saveANote() {
    if (browser) {
      try {
        console.log("Notes page: saveANote called");
        appState.patientInfo.firstName = "John";
        appState.patientInfo.lastName = "Doe";
        appState.patientInfo.dateOfBirth = "1990-01-01";
        appState.selectedNoteType = "soap";
        appState.transcript = "This is a test transcript";
        appState.medicalNote = "This is a test medical note";
        await appService.saveNote();
        console.log("Notes page: saveANote completed");
        // Reload notes after saving
        // await loadNotes();
      } catch (err) {
        console.error("Error saving note:", err);
        error = err instanceof Error ? err.message : "Unknown error";
      }
    }
  }
</script>

<h1>Notes</h1>
<div class="grid">
  <button class="button" onclick={loadNotes} disabled={loading}>
    {loading ? "Loading..." : "Load Notes"}
  </button>
  <button class="button" onclick={saveANote}>Save a Test Note</button>
</div>

{#if error}
  <div class="error-message">
    Error: {error}
  </div>
{/if}

{#if loading}
  <p>Loading notes...</p>
{:else if notes.length === 0}
  <p>No notes found.</p>
{:else}
  <h2>Found {notes.length} notes:</h2>
  <ul>
    {#each notes as note}
      <li>
        <strong>{note.first_name} {note.last_name}</strong> - {note.dob} - {note.note_type}
        <br />
        <small>Created: {new Date(note.created_at).toLocaleString()}</small>
      </li>
    {/each}
  </ul>
{/if}
