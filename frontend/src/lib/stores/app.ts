import { writable, derived } from 'svelte/store';

// Application state stores
export const appStatus = writable('Ready');
export const isRecording = writable(false);
export const isPaused = writable(false);
export const recordingTime = writable(0);
export const showTranscript = writable(false);
export const showMedicalNote = writable(false);

// Patient information stores
export const patientInfo = writable({
    firstName: '',
    lastName: '',
    dateOfBirth: '2000-12-31'
});

export const selectedNoteType = writable('soap');

// Results stores
export const transcript = writable('');
export const medicalNote = writable('');
export const lastTranscript = writable('');
export const lastMedicalNote = writable('');

// Microphone stores
export const availableMicrophones = writable<MediaDeviceInfo[]>([]);
export const selectedMicrophoneId = writable('');

// Notes stores
export const savedNotes = writable<any[]>([]);
export const selectedNote = writable<any>(null);

// Error store
export const errorMessage = writable('');

// Derived stores
export const canSave = derived(
    [lastTranscript, lastMedicalNote],
    ([$lastTranscript, $lastMedicalNote]) =>
        $lastTranscript && $lastMedicalNote
);

export const canStartRecording = derived(
    [patientInfo, isRecording],
    ([$patientInfo, $isRecording]) =>
        !$isRecording && $patientInfo.firstName && $patientInfo.lastName
);

export const canPauseResume = derived(
    [isRecording],
    ([$isRecording]) => $isRecording
);

export const canStopRecording = derived(
    [isRecording],
    ([$isRecording]) => $isRecording
);

// Utility functions
export function updateStatus(status: string) {
    appStatus.set(status);
}

export function showError(message: string) {
    errorMessage.set(message);
    setTimeout(() => errorMessage.set(''), 5000);
}

export function clearError() {
    errorMessage.set('');
}

export function clearResults() {
    transcript.set('');
    medicalNote.set('');
    showTranscript.set(false);
    showMedicalNote.set(false);
}

export function clearPatientInfo() {
    patientInfo.set({
        firstName: '',
        lastName: '',
        dateOfBirth: '2000-12-31'
    });
}

export function reset() {
    isRecording.set(false);
    isPaused.set(false);
    recordingTime.set(0);
    clearResults();
    clearError();
    updateStatus('Ready');
}

// Validation functions
export function validatePatientInfo(): boolean {
    const info = get(patientInfo) as { firstName: string; lastName: string; dateOfBirth: string };
    return !!(info.firstName && info.lastName);
}

export function getPatientInfo() {
    return get(patientInfo);
}

export function getSelectedNoteType() {
    return get(selectedNoteType);
}

// Helper function to get store value
function get<T>(store: any): T {
    let value: T | undefined;
    store.subscribe((val: T) => { value = val; })();
    return value as T;
}
