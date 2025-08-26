import type { RecordingState, TauriNote } from "$lib/types";


export class AppState {
    // Application state
    appStatus = $state('Ready');
    recordingTime = $state(0);
    notes = $state<TauriNote[]>([]);
    recordingState = $state<RecordingState>("not-ready");

    // Microphone
    availableMicrophones = $state<MediaDeviceInfo[]>([]);
    selectedMicrophoneId = $state('');

    // Error
    errorMessage = $state('');

    // Utility methods
    updateStatus(status: string) {
        this.appStatus = status;
    }

    showError(message: string) {
        this.errorMessage = message;
        setTimeout(() => this.errorMessage = '', 5000);
    }

    reset() {
        this.recordingTime = 0;
        this.errorMessage = '';
        this.recordingState = "not-ready";
        this.updateStatus('Ready');
    }
}

// Create a singleton instance
export const appState = new AppState();

export function updateStatus(status: string) {
    // TODO: remove this. Legacy from older version
    appState.updateStatus(status);
}

export function showError(message: string) {
    // TODO: remove this. Legacy from older version
    appState.showError(message);
}


