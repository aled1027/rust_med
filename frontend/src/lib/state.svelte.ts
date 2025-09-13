import type { TauriNote } from '$lib/types';

export class AppState {
  // Application state
  notes = $state<TauriNote[]>([]);
}

// Create a singleton instance
export const appState = new AppState();
