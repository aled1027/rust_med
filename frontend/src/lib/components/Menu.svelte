<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import IconMenu from "~icons/mdi/menu";
  import IconClose from "~icons/mdi/close";
  import { onMount } from "svelte";
  import { appService } from "$lib/services/appService";
  import { appState } from "$lib/state.svelte";

  let isMenuOpen = $state(false);

  afterNavigate(() => {
    isMenuOpen = false;
  });

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function handleKeydown(event: KeyboardEvent) {
    // Close menu if Escape key pressed or clicked outside nav
    if (event.key === "Escape" && isMenuOpen) {
      toggleMenu();
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      isMenuOpen &&
      event.target instanceof Element &&
      !event.target.closest(".menu")
    ) {
      toggleMenu();
    }
  }

  onMount(async () => {
    await appService.syncNotes();
  });
</script>

<svelte:window on:keydown={handleKeydown} on:click={handleClickOutside} />

<nav class="menu" data-open={isMenuOpen} aria-label="Main navigation">
  <button
    class="button toggle-open"
    data-type="toggle-icon"
    onclick={toggleMenu}
    aria-label="Open main menu"
    aria-expanded={isMenuOpen}
    aria-controls="main-menu"
  >
    <IconMenu aria-hidden="true" />
  </button>

  <div id="main-menu" class="menu__contents bg-glass">
    <div class="repel menu__top my-xs">
      <span>Medical Note Generator</span>
      <button
        class="button toggle-close"
        data-type="toggle-icon"
        onclick={toggleMenu}
        aria-label="Close main menu"
      >
        <IconClose aria-hidden="true" />
      </button>
    </div>

    <ul role="list">
      <li>
        <a class="button w-full my-s" href="/">
          <span>New Note</span>
        </a>
      </li>
    </ul>
    <h2>Notes ({appState.notes.length})</h2>
    <ul role="list">
      {#each appState.notes as note}
        <li>
          <a href="/notes/{note.id}">
            <span>
              {note.lastName || "Unknown"},
              {note.firstName || "Unknown"}
            </span>
            <br />
            <small>
              {new Date(note.createdAt).toLocaleString()}
            </small>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>
