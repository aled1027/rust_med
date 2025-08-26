<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { browser } from "$app/environment";
  import { appState } from "$lib/stores/app.svelte";
  import { onMount } from "svelte";

  let notes = $state<any[]>([]);

  async function loadNotes() {
    if (browser) {
      notes = await appService.loadNotes();
      console.log("notes:", notes);
    }
  }

  async function saveNote() {
    if (!browser) {
      throw new Error("saveNote called in non-browser environment");
    }

    const note_id = await appService.saveNote();
  }

  onMount(() => {
    appService.initialize();

    appState.patientInfo.firstName = "John";
    appState.patientInfo.lastName = "Doe";
    appState.patientInfo.dateOfBirth = "1985-01-01";
    appState.selectedNoteType = "soap";
    appState.lastTranscript = "This is a test transcript";
    appState.lastMedicalNote = "This is a test medical note";
  });
</script>

<h1>Notes</h1>
<div class="grid">
  <button class="button" onclick={loadNotes}>Load Notes</button>
  <button class="button" onclick={saveNote}>Save a Test Note</button>
</div>

{#if notes.length === 0}
  <p>No notes found.</p>
{:else}
  <h2>Found {notes.length} notes:</h2>
  <ul>
    {#each notes as note}
      <li>
        <strong>{note.firstName} {note.lastName}</strong> - {note.dateOfBirth} -
        {note.noteType}
        <br />
        <small>{note.createdAt}</small>
        <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
      </li>
    {/each}
  </ul>
{/if}
