import type { PatientInfo, TauriNote } from "$lib/types";



export class AppState {
    // Application state
    appStatus = $state('Ready');
    isRecording = $state(false);
    isPaused = $state(false);
    recordingTime = $state(0);
    notes = $state<TauriNote[]>([]);

    // Patient information
    // TODO: move this info to the form. It doesn't need to be in "global" state
    patientInfo = $state<PatientInfo>({
        firstName: '',
        lastName: '',
        dateOfBirth: '2000-12-31'
    });
    selectedNoteType = $state('soap');


    // Results
    // TODO: this can also be moved into component state
    transcript = $state('');
    medicalNote = $state('');
    lastTranscript = $state('');
    lastMedicalNote = $state('');

    // Microphone
    availableMicrophones = $state<MediaDeviceInfo[]>([]);
    selectedMicrophoneId = $state('');

    // Error
    errorMessage = $state('');

    // Derived values
    get canSave() {
        return this.lastTranscript && this.lastMedicalNote;
    }

    get canStartRecording() {
        return !this.isRecording && this.patientInfo.firstName && this.patientInfo.lastName;
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

    clearResults() {
        this.transcript = '';
        this.medicalNote = '';
    }

    clearPatientInfo() {
        this.patientInfo = {
            firstName: '',
            lastName: '',
            dateOfBirth: '2000-12-31'
        };
    }

    reset() {
        this.isRecording = false;
        this.isPaused = false;
        this.recordingTime = 0;
        this.clearResults();
        this.clearError();
        this.updateStatus('Ready');
    }

    // Validation methods
    validatePatientInfo(): boolean {
        return !!(this.patientInfo.firstName && this.patientInfo.lastName);
    }

    getPatientInfo(): PatientInfo {
        return this.patientInfo;
    }

    getSelectedNoteType(): string {
        return this.selectedNoteType;
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

export function clearResults() {
    appState.clearResults();
}

export function clearPatientInfo() {
    appState.clearPatientInfo();
}

export function reset() {
    appState.reset();
}

export function validatePatientInfo(): boolean {
    return appState.validatePatientInfo();
}

export function getPatientInfo() {
    return appState.getPatientInfo();
}

export function getSelectedNoteType() {
    return appState.getSelectedNoteType();
}
