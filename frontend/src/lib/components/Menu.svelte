<script lang="ts">
  import {
    Icon,
    Sparkles,
    Beaker,
    CalendarDays,
    User,
    Users,
    ChartBar,
    WrenchScrewdriver,
    PencilSquare,
    QuestionMarkCircle,
    ArrowRightOnRectangle,
    ArrowLeftOnRectangle,
    Bars3BottomLeft,
    XMark,
  } from "svelte-hero-icons";
  import { page } from "$app/state";
  import { Api } from "$lib/api.svelte";
  import { getContext } from "svelte";
  import Logo from "./Logo.svelte";
  import { afterNavigate } from "$app/navigation";

  const api: Api = getContext("api");
  const logoLink = "/notebook";
  let currentPath = $derived(page.url.pathname);
  let isMenuOpen = $state(false);

  afterNavigate(() => {
    // Close the menu after navigating to a new page
    isMenuOpen = false;
  });

  async function logout() {
    localStorage.removeItem("token");
    // Do a hard redirect instead of using goto so the loader runs
    window.location.href = "/";
  }

  interface NavItem {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
  }

  let baseItems = $state<NavItem[]>([
    { icon: CalendarDays, label: "History", href: "/history" },
    {
      icon: QuestionMarkCircle,
      label: "Help",
      href: "mailto:help@incontext.fun",
    },
    // { icon: Beaker, label: 'Experiments', href: '/experiments' }
    // { icon: PencilSquare, label: 'Start Notebook', href: '/notebook' }
    // { icon: User, label: 'Profile', href: '#' },
    // { icon: Users, label: 'Friends', href: '#' },
    // { icon: ChartBar, label: 'Dashboard', href: '#' }
    // { icon: WrenchScrewdriver, label: 'Tools', href: '#' }
  ]);

  let navItems = $derived.by(() => {
    let items = [...baseItems];
    if (!api.isLoggedIn) {
      items.push({
        icon: ArrowRightOnRectangle,
        label: "Sign In",
        href: "/login",
      });
    } else {
      items.push({
        icon: ArrowLeftOnRectangle,
        label: "Logout",
        onClick: logout,
      });
    }
    return items;
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
    data-type="toggle-icon"
    onclick={toggleMenu}
    aria-label="Open main menu"
    aria-expanded={isMenuOpen}
    aria-controls="main-menu"
  >
    <Icon src={Bars3BottomLeft} aria-hidden="true" />
  </button>
  <div id="main-menu" class="menu__contents bg-glass">
    <div class="repel menu__top">
      <Logo {logoLink} />
      <button
        class="button toggle-close"
        data-type="toggle-icon"
        onclick={toggleMenu}
        aria-label="Close main menu"
      >
        <Icon src={XMark} aria-hidden="true" />
      </button>
    </div>

    <p class="menu__message">
      Welcome to the inContext Alpha.
      <br />
        target="_blank"
        href="https://docs.google.com/forms/d/e/1FAIpQLSehGT3c28nsu5NUQcAzA4cQb5EvMy0bhIE_GoQ-pgYnEBbXww/viewform?usp=sharing"
        >feedback</a
      >!
    </p>
    <ul role="list">
      <li>
        <a class="button w-full my-s" href="/notebook">
          <span>Start Notebook</span>
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
              <Icon class="menu-icon" src={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          {:else}
            <button class="menu__nav-link" onclick={item.onClick} type="button">
              <Icon class="menu-icon" src={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</nav>
