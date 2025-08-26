<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { browser } from "$app/environment";
  import { appState } from "$lib/stores/app.svelte";
  import { onMount } from "svelte";

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
    await appService.initialize();
    await appService.ensureTauriService();
    console.log(appService);

    if (browser && appService.tauriService && appService.tauriService.tauri) {
      const t = appService.tauriService.tauri;
      console.log("----------------");
      console.log("Next doing save_patient_note");
      appState.patientInfo.firstName = "John";
      appState.patientInfo.lastName = "Doe";
      appState.patientInfo.dateOfBirth = "1985-01-01";
      appState.selectedNoteType = "soap";
      appState.lastTranscript = "This is a test transcript";
      appState.lastMedicalNote = "This is a test medical note";
      const result = appService.saveNote();
      console.log("result:", result);
    }
    console.log("Notes page: saveANote completed");
  }

  onMount(() => {
    appService.initialize();
  });
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
        <strong>{note.firstName} {note.lastName}</strong> - {note.dateOfBirth} -
        {note.noteType}
        <br />
        <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
      </li>
    {/each}
  </ul>
{/if}
