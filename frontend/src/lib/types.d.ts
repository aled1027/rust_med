export interface TauriNoteIn {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    noteType: string;
    transcript: string;
    medicalNote: string;
}

export interface TauriNote extends TauriNoteIn {
    id: string;
    createdAt: string;
}

// TODO: patient info can be removed after the storage is moved from appState to the form
export interface PatientInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
}