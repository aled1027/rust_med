<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { browser } from "$app/environment";
  import { appState } from "$lib/state.svelte";
  import { onMount } from "svelte";
  import type { TauriNote } from "$lib/types";

  let notes = $state<TauriNote[]>([]);

  async function saveNote() {
    if (!browser) {
      throw new Error("saveNote called in non-browser environment");
    }
    appService.saveNote();
    notes = await appService.loadNotes();
  }

  onMount(async () => {
    await appService.initialize();
    notes = await appService.loadNotes();

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
  <button class="button" onclick={saveNote}>Save a Test Note</button>
</div>

{#if notes.length === 0}
  <p>No notes found.</p>
{:else}
  <h2>Notes ({notes.length})</h2>
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
