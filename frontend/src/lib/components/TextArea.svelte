<script lang="ts">
  let { text = $bindable(), heading, headingSmall } = $props();
  let copyState = $state("copy");
  let copyText = $derived(copyState === "copy" ? "copy" : "copied");
  let uniqueId = $state(Math.random().toString(36).substring(2, 15));

  async function copyNote() {
    await navigator.clipboard.writeText(text);
    copyState = "copied";
    setTimeout(() => {
      copyState = "copy";
    }, 2000);
  }

  function autosize(element: HTMLElement, value: string) {
    // Svelte action for auto-resizing an element, like a textarea
    function resize() {
      element.style.height = "auto";
      element.style.height = element.scrollHeight + 8 + "px";
    }

    // resize on user input
    element.addEventListener("input", resize);

    // resize on window resize
    window.addEventListener("resize", resize);

    // resize right away
    resize();

    return {
      update(newValue: string) {
        resize();
      },
      destroy() {
        element.removeEventListener("input", resize);
        window.removeEventListener("resize", resize);
      },
    };
  }
</script>

<div class="textarea">
  <div class="textarea__heading">
    <span>
      <span class="textarea__heading-text">{heading}</span>
      <small>{headingSmall}</small>
    </span>
    <button
      type="button"
      class="button right-0"
      data-type={copyState}
      onclick={copyNote}>{copyText}</button
    >
  </div>
  <label class="visually-hidden" for={uniqueId}>{heading}</label>
  <textarea
    id={uniqueId}
    class="textarea__text"
    bind:value={text}
    use:autosize={text}
  ></textarea>
</div>

<style>
  .textarea {
    --textarea-heading-bg-color: var(--color-primary-lighter);
    --textarea-heading-text-color: var(--color-text);
  }

  .textarea__heading {
    width: 100%;
    height: 2.5rem;
    background: var(--color-primary-lighter);
    border-radius: 4px 4px 0 0;
    color: var(--textarea-heading-text-color);

    /* Repel */
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .textarea__heading-text {
    font-weight: 600;
    padding-inline-start: var(--space-xs);
  }

  .textarea__text {
    padding-inline: var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: 0 0 4px 4px;
    background: var(--color-surface);
    color: var(--color-text-on-surface);
    width: 100%;
  }
</style>
