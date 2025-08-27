<script lang="ts">
  // An awesome textarea component with copy buttons, heading, and so on

  let { text } = $props();

  let copyState = $state("copy");
  async function copyNote() {
    await navigator.clipboard.writeText(text);
    copyState = "copied";
    setTimeout(() => {
      copyState = "copy";
    }, 2000);
  }

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
</script>

<label for="medical-note" class="visually-hidden">Medical Note</label>
<div class="position-relative">
  <!-- TODO: finish copy button. Tell the user they copied! -->
  <button type="button" class="button" data-type={copyState} onclick={copyNote}
    >{copyState === "copy" ? "copy" : "copied"}</button
  >
  <textarea
    id="medical-note"
    class="my-nice-box"
    value={text}
    use:autoResizeTextarea
  ></textarea>
</div>

<style>
  .my-nice-box {
    padding-block: var(--space-xs);
    padding-block-start: 2rem;
    padding-inline: var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: #fdfcf4;
    color: var(--color-text);
    width: 100%;
  }
  .button[data-type="copy"],
  .button[data-type="copied"] {
    border: none;
    position: absolute;
    top: 0;
    right: 0;
    height: 1.5rem;
    font-size: 0.75rem;
    min-width: 10ch;
  }
  .button[data-type="copied"] {
    opacity: 0.6;
  }
</style>
