<script lang="ts">
  import IconMenu from "~icons/mdi/menu";
  import IconClose from "~icons/mdi/close";
  import { afterNavigate } from "$app/navigation";

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
    <h2>Saved Notes</h2>
    <ul>
      <li>Notes will be dynamically populated here.</li>
      <li>Note 1</li>
      <li>Note 2</li>
      <li>Note 3</li>
    </ul>
  </div>
</nav>
