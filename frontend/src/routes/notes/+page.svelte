<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { appState } from "$lib/state.svelte";
  import { onMount } from "svelte";

  onMount(async () => {
    await appService.syncNotes();
  });
</script>

<h1>Notes</h1>
<div class="grid">
  <button
    class="button"
    onclick={async () => {
      await appService.saveNote(
        "John",
        "Doe",
        "1985-01-01",
        "soap",
        "This is a test transcript",
        "This is a test medical note"
      );
      await appService.syncNotes();
    }}>Save a Test Note</button
  >
</div>

{#if appState.notes.length === 0}
  <p>No notes found.</p>
{:else}
  <h2>Notes ({appState.notes.length})</h2>
  <ul>
    {#each appState.notes as note}
      <li>
        <strong>{note.firstName} {note.lastName}</strong> - {note.dateOfBirth} -
        {note.noteType}
        <br />
        <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
      </li>
    {/each}
  </ul>
{/if}
