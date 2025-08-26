<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { appState } from "$lib/state.svelte";
  import { page } from "$app/state";
  import type { TauriNote } from "$lib/types";
  import { afterNavigate } from "$app/navigation";
  import { goto } from "$app/navigation";

  let note: TauriNote | null = $state(null);

  // Svelte action for auto-resizing textarea
  function autoResizeTextarea(node: HTMLTextAreaElement) {
    // TODO: this resizer isn't great. It's not responsive to page changes, content changes.
    // It seems like it only handles the initial resize/render in an okay way.
    function resize() {
      node.style.height = "auto";
      node.style.height = node.scrollHeight + "px";
    }

    // Initial resize
    resize();

    // Resize when content changes
    const observer = new MutationObserver(resize);
    observer.observe(node, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  async function copyNote() {
    if (note) {
      await navigator.clipboard.writeText(note.medicalNote);
    }
  }

  async function deleteNote() {
    // TODO: add confirmation and success
    if (note) {
      await appService.deleteNote(note.id);
      goto("/");
    }
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
      <button class="button" onclick={deleteNote}> Delete </button>

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

      <label for="medical-note" class="visually-hidden">Medical Note</label>
      <div class="position-relative">
        <!-- TODO: finish copy button. Tell the user they copied! -->
        <button type="button" class="button" data-type="copy" onclick={copyNote}
          >copy</button
        >
        <textarea
          id="medical-note"
          class="nice-box with-copy-button"
          value={note.medicalNote}
          use:autoResizeTextarea
        ></textarea>
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
    padding-block-start: 2rem;
    padding-inline: var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: #fdfcf4;
    color: var(--color-text);
    width: 100%;
  }

  .button[data-type="copy"] {
    border: none;
    position: absolute;
    top: 0;
    right: 0;
    height: 1.5rem;
    font-size: 0.75rem;
  }
</style>
