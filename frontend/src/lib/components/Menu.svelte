<script lang="ts">
  import IconMenu from "~icons/mdi/menu";
  import IconClose from "~icons/mdi/close";
  import IconHistory from "~icons/mdi/history";

  import { page } from "$app/state";
  import { afterNavigate } from "$app/navigation";

  let currentPath = $derived(page.url.pathname);
  let isMenuOpen = $state(false);

  afterNavigate(() => {
    isMenuOpen = false;
  });

  async function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  interface NavItem {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
  }

  let baseItems = $state<NavItem[]>([
    { icon: IconHistory, label: "History", href: "/" },
  ]);

  let navItems = $derived.by(() => {
    return baseItems;
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

  // TODO: the accessibility of the menu isn't quite right because it's navigable when the menu
  // is closed. But I was having issues with the transition behavior, so leaving for now.
</script>

<svelte:window on:keydown={handleKeydown} on:click={handleClickOutside} />

<nav class="menu" data-open={isMenuOpen} aria-label="Main navigation">
  <button
    class="button toggle-open"
    onclick={toggleMenu}
    aria-label="Open main menu"
    aria-expanded={isMenuOpen}
    aria-controls="main-menu"
  >
    <IconMenu aria-hidden="true" />
  </button>

  <div id="main-menu" class="menu__contents bg-glass">
    <div class="repel menu__top">
      <!-- <Logo {logoLink} /> -->
      <button
        class="button toggle-close"
        onclick={toggleMenu}
        aria-label="Close main menu"
      >
        <IconClose aria-hidden="true" />
      </button>
    </div>

    <ul role="list">
      <li>
        <a class="button w-full my-s" href="/">
          <span>Home</span>
        </a>
      </li>
      {#each navItems as item}
        <li>
          {#if item.href}
            <a
              class="menu__nav-link"
              href={item.href}
              data-active={currentPath === item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
            >
              <item.icon class="menu-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          {:else}
            <button class="menu__nav-link" onclick={item.onClick} type="button">
              <item.icon class="menu-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</nav>
