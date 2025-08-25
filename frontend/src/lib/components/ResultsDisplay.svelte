<script lang="ts">
  import { appState } from '$lib/stores/app';

  export let onSaveNote: () => void;
  export let onCopyNote: () => void;

  function toggleTranscript() {
    appState.showTranscript = !appState.showTranscript;
  }

  function toggleMedicalNote() {
    appState.showMedicalNote = !appState.showMedicalNote;
  }
</script>

{#if appState.transcript || appState.medicalNote}
  <div class="results-container">
          {#if appState.transcript}
      <section class="result-section">
        <div class="section-header">
          <h2>Transcript</h2>
          <button 
            class="toggle-btn" 
            on:click={toggleTranscript}
            aria-expanded={appState.showTranscript}
          >
            {#if appState.showTranscript}
              Hide
            {:else}
              Show
            {/if}
          </button>
        </div>
        
        {#if appState.showTranscript}
          <div class="content-area">
            <textarea
              class="result-textarea"
              readonly
              value={appState.transcript}
              placeholder="Transcript will appear here..."
            ></textarea>
          </div>
        {/if}
      </section>
    {/if}

    {#if appState.medicalNote}
      <section class="result-section">
        <div class="section-header">
          <h2>Medical Note</h2>
          <div class="header-actions">
            <button class="action-btn copy-btn" on:click={onCopyNote}>
              Copy Note
            </button>
            <button 
              class="toggle-btn" 
              on:click={toggleMedicalNote}
              aria-expanded={appState.showMedicalNote}
            >
              {#if appState.showMedicalNote}
                Hide
              {:else}
                Show
              {/if}
            </button>
          </div>
        </div>
        
        {#if appState.showMedicalNote}
          <div class="content-area">
            <textarea
              class="result-textarea"
              readonly
              value={appState.medicalNote}
              placeholder="Generated medical note will appear here..."
            ></textarea>
            
            <div class="note-actions">
              <button 
                class="button save-btn" 
                disabled={!appState.canSave}
                on:click={onSaveNote}
              >
                Save Note
              </button>
            </div>
            
            <div class="warning">
              <p>
                Generated notes are drafts requiring healthcare provider review and
                approval before use in patient care. The AI process can make mistakes.
              </p>
            </div>
          </div>
        {/if}
      </section>
    {/if}
  </div>
{/if}

<style lang="scss">
  .results-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .result-section {
    border: 2px solid var(--color-border);
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: var(--color-surface);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: var(--color-surface-elevated);
    border-bottom: 1px solid var(--color-border);
    
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }
    
    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background-color: transparent;
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--color-surface-elevated);
      border-color: var(--color-primary);
    }
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background-color: var(--color-primary);
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--color-primary-dark);
    }
    
    &.copy-btn {
      background-color: var(--color-secondary);
      
      &:hover {
        background-color: var(--color-secondary-dark);
      }
    }
  }

  .content-area {
    padding: 1.5rem;
  }

  .result-textarea {
    width: 100%;
    min-height: 200px;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background-color: var(--color-surface);
    color: var(--color-text);
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }

  .note-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    
    .save-btn {
      padding: 0.75rem 2rem;
      background-color: var(--color-success);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: var(--color-success-dark);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .warning {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: var(--color-warning-bg);
    border: 1px solid var(--color-warning);
    border-radius: 0.5rem;
    
    p {
      margin: 0;
      color: var(--color-warning-text);
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }
</style>
