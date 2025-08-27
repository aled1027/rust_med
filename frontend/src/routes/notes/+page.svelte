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

  function showConfirmDelete() {
    showDeleteConfirmation = true;
  }

  function cancelDelete() {
    showDeleteConfirmation = false;
  }

  function handleDeleteForm(e: Event) {
    e.preventDefault();
    deleteNote();
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
    <form class="note-form">
      <h2>{note.lastName}, {note.firstName}</h2>
      <small>Note created at: {new Date(note.createdAt).toLocaleString()}</small
      >
      <div class="grid" data-layout="small-thirds">
        <button class="button" disabled>Save</button>

        <button class="button" disabled>Reset</button>
        <button class="button button--danger" onclick={showConfirmDelete}
          >Delete</button
        >
      </div>

      <div class="note-form-group">
        <label for="first-name">First Name</label>
        <input type="text" id="first-name" bind:value={note.firstName} />
      </div>
      <div class="note-form-group">
        <label for="last-name">Last Name</label>
        <input type="text" id="last-name" bind:value={note.lastName} />
      </div>
      <div class="note-form-group">
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
        <div class="note-form-group">
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
  <dialog class="modal" open>
    <form class="modal__inner" onsubmit={handleDeleteForm}>
      <h3>Confirm Deletion</h3>
      <p>
        Are you sure you want to delete this medical note for {note?.lastName}, {note?.firstName}?
      </p>
      <p class="mt-xs">This action cannot be undone.</p>

      <div class="grid mt-m" data-layout="small-thirds">
        <button
          type="button"
          class="button"
          data-type="ghost"
          onclick={cancelDelete}>Cancel</button
        >
        <button type="submit" class="button" data-type="danger"
          >Delete Note</button
        >
      </div>
    </form>
  </dialog>
{/if}

<style>
  .note-form {
    max-width: 600px;
    margin-inline: auto;
  }

  .note-form-group {
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
  }

  .modal {
    border: none;
    padding: 0;
    margin: 0;
    position: fixed;
    inset: 0;
    top: 0;
    z-index: 100;
    height: 100vh;
    width: 100vw;
    display: grid;
    place-content: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal__inner {
    background: var(--color-surface);
    color: var(--color-text-on-surface);
    padding: 2rem;
    border-radius: 8px;
    max-width: 600px;
    margin-inline: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
</style>
