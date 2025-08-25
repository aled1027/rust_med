<script lang="ts">
  import { errorMessage } from '$lib/stores/app';
</script>

{#if $errorMessage}
  <div class="error-container" role="alert">
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{$errorMessage}</span>
    </div>
  </div>
{/if}

<style lang="scss">
  .error-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  }

  .error-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .error-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .error-text {
    color: #dc2626;
    font-weight: 500;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
