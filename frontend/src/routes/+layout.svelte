<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import Menu from "$lib/components/Menu.svelte";
  import "../styles/main.scss";
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Menu />
{@render children?.()}
