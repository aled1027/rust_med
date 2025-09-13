import type { RecordingState, TauriNote } from '$lib/types';

export class AppState {
	// Application state
	appStatus = $state('Ready');
	recordingTime = $state(0);
	notes = $state<TauriNote[]>([]);
	recordingState = $state<RecordingState>('not-ready');

	// Microphone
	availableMicrophones = $state<MediaDeviceInfo[]>([]);
	selectedMicrophoneId = $state('');

	// Error
	errorMessage = $state('');

	reset() {
		this.recordingTime = 0;
		this.errorMessage = '';
		this.recordingState = 'not-ready';
		this.appStatus = 'Ready';
	}
}

// Create a singleton instance
export const appState = new AppState();
