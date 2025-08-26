import type { PatientInfo, TauriNote } from "$lib/types";



export class AppState {
    // Application state
    appStatus = $state('Ready');
    isRecording = $state(false);
    isPaused = $state(false);
    recordingTime = $state(0);
    notes = $state<TauriNote[]>([]);

    // Microphone
    availableMicrophones = $state<MediaDeviceInfo[]>([]);
    selectedMicrophoneId = $state('');

    // Error
    errorMessage = $state('');

    get canStartRecording() {
        return !this.isRecording;
    }

    get canPauseResume() {
        return this.isRecording;
    }

    get canStopRecording() {
        return this.isRecording;
    }

    // Utility methods
    updateStatus(status: string) {
        this.appStatus = status;
    }

    showError(message: string) {
        this.errorMessage = message;
        setTimeout(() => this.errorMessage = '', 5000);
    }

    clearError() {
        this.errorMessage = '';
    }


    reset() {
        this.isRecording = false;
        this.isPaused = false;
        this.recordingTime = 0;
        this.clearError();
        this.updateStatus('Ready');
    }
}

// Create a singleton instance
export const appState = new AppState();

// Export utility functions for backward compatibility
export function updateStatus(status: string) {
    appState.updateStatus(status);
}

export function showError(message: string) {
    appState.showError(message);
}

export function clearError() {
    appState.clearError();
}


export function reset() {
    appState.reset();
}


