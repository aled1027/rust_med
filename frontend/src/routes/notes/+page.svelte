<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { appState } from "$lib/state.svelte";
  import { page } from "$app/state";
  import type { TauriNote } from "$lib/types";
  import { afterNavigate } from "$app/navigation";
  import { goto } from "$app/navigation";
  import TextArea from "$lib/components/TextArea.svelte";

  let note: TauriNote | null = $state(null);
  let showDeleteConfirmation = $state(false);

  async function deleteNote() {
    if (note) {
      await appService.deleteNote(note.id);
      goto("/");
    }
  }

  function confirmDelete() {
    showDeleteConfirmation = true;
  }

  function cancelDelete() {
    showDeleteConfirmation = false;
  }

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
      <div class="grid" data-layout="small-thirds">
        <button class="button" disabled>Save</button>

        <button class="button" disabled>Reset</button>
        <button class="button button--danger" onclick={confirmDelete}
          >Delete</button
        >
      </div>

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

      <TextArea
        text={note.medicalNote}
        heading="Medical Note"
        headingSmall="({note.noteType.toUpperCase()})"
      />

      <p class="warning">
        Generated notes are drafts requiring healthcare provider review and
        approval before use in patient care. the ai process can make mistakes.
      </p>

      <h3>Advanced Fields</h3>
      <details class="flow">
        <summary>Advanced Fields</summary>
        <div class="settings-group">
          <label for="note-id">Note ID</label>
          <input type="text" id="note-id" bind:value={note.id} />
        </div>
        <TextArea text={note.transcript} heading="Transcript" headingSmall="" />
      </details>
    </form>
  {/if}
</main>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirmation}
  <div class="modal-overlay">
    <form
      class="modal-content"
      onsubmit={(e) => {
        e.preventDefault();
        deleteNote();
      }}
    >
      <h3>Confirm Deletion</h3>
      <p>
        Are you sure you want to delete this note for {note?.lastName}, {note?.firstName}?
      </p>
      <p class="warning">This action cannot be undone.</p>

      <div class="modal-actions">
        <button type="button" class="button" onclick={cancelDelete}
          >Cancel</button
        >
        <button type="submit" class="button button--danger">Delete Note</button>
      </div>
    </form>
  </div>
{/if}

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

  .button--danger {
    background-color: var(--color-error, #dc2626);
    color: white;
  }

  .button--danger:hover {
    background-color: var(--color-error-hover, #b91c1c);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-content h3 {
    margin-top: 0;
    color: var(--color-error, #dc2626);
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }
</style>
