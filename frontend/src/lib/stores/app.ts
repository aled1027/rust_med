// Application state using Svelte 5 runes
export const appState = {
    // Application state
    appStatus: $state('Ready'),
    isRecording: $state(false),
    isPaused: $state(false),
    recordingTime: $state(0),
    showTranscript: $state(false),
    showMedicalNote: $state(false),

    // Patient information
    patientInfo: $state({
        firstName: '',
        lastName: '',
        dateOfBirth: '2000-12-31'
    }),

    selectedNoteType: $state('soap'),

    // Results
    transcript: $state(''),
    medicalNote: $state(''),
    lastTranscript: $state(''),
    lastMedicalNote: $state(''),

    // Microphone
    availableMicrophones: $state<MediaDeviceInfo[]>([]),
    selectedMicrophoneId: $state(''),

    // Notes
    savedNotes: $state<any[]>([]),
    selectedNote: $state<any>(null),

    // Error
    errorMessage: $state(''),

    // Derived values
    get canSave() {
        return this.lastTranscript && this.lastMedicalNote;
    },

    get canStartRecording() {
        return !this.isRecording && this.patientInfo.firstName && this.patientInfo.lastName;
    },

    get canPauseResume() {
        return this.isRecording;
    },

    get canStopRecording() {
        return this.isRecording;
    }
};

// Utility functions
export function updateStatus(status: string) {
    appState.appStatus = status;
}

export function showError(message: string) {
    appState.errorMessage = message;
    setTimeout(() => appState.errorMessage = '', 5000);
}

export function clearError() {
    appState.errorMessage = '';
}

export function clearResults() {
    appState.transcript = '';
    appState.medicalNote = '';
    appState.showTranscript = false;
    appState.showMedicalNote = false;
}

export function clearPatientInfo() {
    appState.patientInfo = {
        firstName: '',
        lastName: '',
        dateOfBirth: '2000-12-31'
    };
}

export function reset() {
    appState.isRecording = false;
    appState.isPaused = false;
    appState.recordingTime = 0;
    clearResults();
    clearError();
    updateStatus('Ready');
}

// Validation functions
export function validatePatientInfo(): boolean {
    return !!(appState.patientInfo.firstName && appState.patientInfo.lastName);
}

export function getPatientInfo() {
    return appState.patientInfo;
}

export function getSelectedNoteType() {
    return appState.selectedNoteType;
}
