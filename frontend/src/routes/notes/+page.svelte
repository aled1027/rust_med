<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { appState } from "$lib/state.svelte";
  import { page } from "$app/state";
  import type { TauriNote } from "$lib/types";
  import { afterNavigate } from "$app/navigation";

  let note: TauriNote | null = $state(null);

  afterNavigate(async () => {
    await appService.syncNotes();

    // Hack through handling routing because this is technically an SSG route
    const noteId = page.url.searchParams.get("noteId");
    const maybeNote = appState.notes.find((n) => n.id === noteId);
    if (!!maybeNote) {
      // Make a copy of the note so we can mutate it. And then save it if needed
      note = { ...maybeNote };
    }
  });
</script>

<main class="flow">
  <header class="my-xl">
    <h1 class="size-step-7 text-align-center w-fit mx-auto">
      Medical Note Generator
    </h1>
  </header>

  {#if note}
    <form class="my-form">
      <h2>{note.lastName}, {note.firstName}</h2>
      <small>Note created at: {new Date(note.createdAt).toLocaleString()}</small
      >
      <div class="settings-group">
        <label for="first-name">First Name</label>
        <input type="text" id="first-name" bind:value={note.firstName} />
      </div>
      <div class="settings-group">
        <label for="last-name">Last Name</label>
        <input type="text" id="last-name" bind:value={note.lastName} />
      </div>
      <div class="settings-group">
        <label for="date-of-birth">Date of Birth</label>
        <input type="date" id="date-of-birth" bind:value={note.dateOfBirth} />
      </div>
      <h3>Medical Note</h3>
      <small>Note type: {note.noteType}</small>

      <p class="warning">
        Generated notes are drafts requiring healthcare provider review and
        approval before use in patient care. the ai process can make mistakes.
      </p>

      <div class="nice-box">
        <textarea class="my-0" readonly value={note.medicalNote}></textarea>
      </div>
      <h3>Advanced Fields</h3>
      <details class="flow">
        <summary>Advanced Fields</summary>
        <div class="settings-group">
          <label for="note-id">Note ID</label>
          <input type="text" id="note-id" bind:value={note.id} />
        </div>
        <h4 class="mt-s">Transcript</h4>
        <div class="nice-box">
          <p class="my-0">{note.transcript}</p>
        </div>
      </details>
    </form>
  {/if}
</main>

<style>
  .my-form {
    max-width: 600px;
    margin-inline: auto;
  }

  .settings-group {
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
  }

  .nice-box {
    padding-block: var(--space-xs);
    padding-inline: var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: #fdfcf4;
    color: var(--color-text);
    width: 100%;
  }
</style>
