// Application state using Svelte 5 runes
interface PatientInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
}

interface Note {
    id?: string;
    type: string;
    transcript: string;
    medicalNote: string;
    patientInfo: PatientInfo;
    timestamp: Date;
}

export class AppState {
    // Application state
    appStatus = $state('Ready');
    isRecording = $state(false);
    isPaused = $state(false);
    recordingTime = $state(0);
    showTranscript = $state(false);
    showMedicalNote = $state(false);

    // Patient information
    patientInfo = $state<PatientInfo>({
        firstName: '',
        lastName: '',
        dateOfBirth: '2000-12-31'
    });

    selectedNoteType = $state('soap');

    // Results
    transcript = $state('');
    medicalNote = $state('');
    lastTranscript = $state('');
    lastMedicalNote = $state('');

    // Microphone
    availableMicrophones = $state<MediaDeviceInfo[]>([]);
    selectedMicrophoneId = $state('');

    // Notes
    savedNotes = $state<Note[]>([]);
    selectedNote = $state<Note | null>(null);

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
        this.showTranscript = false;
        this.showMedicalNote = false;
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
