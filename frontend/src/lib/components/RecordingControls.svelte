<script lang="ts">
  import { 
    isRecording, 
    isPaused, 
    recordingTime,
    canStartRecording,
    canPauseResume,
    canStopRecording,
    appStatus
  } from '$lib/stores/app';

  export let onStartRecording: () => void;
  export let onPauseResume: () => void;
  export let onStopRecording: () => void;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="recording-controls">
  <div class="status-display">
    <span class="status-text">{$appStatus}</span>
    {#if $isRecording}
      <div class="recording-indicator">
        <div class="recording-dot"></div>
        <span class="recording-time">{formatTime($recordingTime)}</span>
      </div>
    {/if}
  </div>

  <div class="control-buttons">
    <button 
      class="button start-btn" 
      class:recording={$isRecording}
      disabled={!$canStartRecording}
      on:click={onStartRecording}
    >
      {#if $isRecording}
        Recording...
      {:else}
        Start Recording
      {/if}
    </button>

    <button 
      class="button pause-btn" 
      class:paused={$isPaused}
      disabled={!$canPauseResume}
      on:click={onPauseResume}
    >
      {#if $isPaused}
        Resume
      {:else}
        Pause
      {/if}
    </button>

    <button 
      class="button stop-btn" 
      disabled={!$canStopRecording}
      on:click={onStopRecording}
    >
      Stop Recording
    </button>
  </div>
</div>

<style lang="scss">
  .recording-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .status-display {
    text-align: center;
    
    .status-text {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--color-text);
    }
  }

  .recording-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    
    .recording-dot {
      width: 12px;
      height: 12px;
      background-color: #ef4444;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    .recording-time {
      font-family: monospace;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--color-text);
    }
  }

  .control-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.start-btn {
      background-color: #10b981;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #059669;
      }
      
      &.recording {
        background-color: #ef4444;
        
        &:hover:not(:disabled) {
          background-color: #dc2626;
        }
      }
    }
    
    &.pause-btn {
      background-color: #f59e0b;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #d97706;
      }
      
      &.paused {
        background-color: #10b981;
        
        &:hover:not(:disabled) {
          background-color: #059669;
        }
      }
    }
    
    &.stop-btn {
      background-color: #6b7280;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #4b5563;
      }
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
