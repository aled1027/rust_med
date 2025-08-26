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

export type RecordingState = "not-ready" | "ready" | "recording" | "paused" | "stopped";
