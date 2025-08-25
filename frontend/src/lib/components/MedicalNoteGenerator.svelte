<script lang="ts">
  import { onMount } from "svelte";
  import RecordingManager from "./RecordingManager.svelte";
  import TranscriptionManager from "./TranscriptionManager.svelte";
  import NotesManager from "./NotesManager.svelte";
  import {
    appState,
    updateStatus,
    showError,
    clearResults,
    clearPatientInfo,
    reset,
  } from "$lib/stores/app.svelte";

  let recordingManager: any;
  let transcriptionManager: any;
  let notesManager: any;

  onMount(async () => {
    await initialize();
  });

  async function initialize() {
    try {
      // Load saved notes
      await notesManager.loadNotes();

      // Setup transcription event listeners
      setupTranscriptionListeners();

      // Setup notes event listeners
      setupNotesListeners();

      updateStatus("Ready");
      console.log("Medical Note Generator initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);
      showError("Failed to initialize application");
    }
  }

  function setupTranscriptionListeners() {
    // Listen for transcription progress updates
    transcriptionManager.onTranscriptionProgressCallback(
      (message: string, isText = false) => {
        if (isText) {
          // This is the actual transcription text
          appState.transcript = message;
          appState.lastTranscript = message;
        } else {
          // This is a progress message
          appState.transcript = message;
        }
      }
    );

    // Listen for note generation progress
    transcriptionManager.onNoteGenerationProgressCallback((message: string) => {
      appState.medicalNote = message;
      if (!message.includes("Generating")) {
        appState.lastMedicalNote = message;
      }
    });

    // Listen for note generation streaming
    transcriptionManager.onNoteGenerationStreamCallback(
      (streamedNote: string) => {
        appState.medicalNote = streamedNote;
      }
    );

    // Listen for note generation completion
    transcriptionManager.onNoteGenerationCompleteCallback(
      (finalNote: string) => {
        appState.medicalNote = finalNote;
        appState.lastMedicalNote = finalNote;
        updateStatus("Medical note generated successfully!");
      }
    );
  }

  function setupNotesListeners() {
    // Listen for notes updates
    notesManager.onNotesUpdateCallback((notes: any[]) => {
      // Handle notes updates if needed
      console.log("Notes updated:", notes.length);
    });

    // Listen for note selection
    notesManager.onNoteSelectedCallback((note: any) => {
      if (note) {
        // Display selected note
        appState.transcript = note.transcript;
        appState.medicalNote = note.medicalNote;
        appState.lastTranscript = note.transcript;
        appState.lastMedicalNote = note.medicalNote;

        // Update patient info
        appState.patientInfo = note.patientInfo;
        appState.selectedNoteType = note.noteType;
      }
    });
  }

  async function handleStartRecording() {
    try {
      // Validate patient info first
      if (!$patientInfo.firstName || !$patientInfo.lastName) {
        showError("Please enter patient first and last name");
        return;
      }

      updateStatus("Initializing recording...");
      clearResults();

      // Clear last results
      appState.lastTranscript = "";
      appState.lastMedicalNote = "";

      await recordingManager.startRecording();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to start recording: ${errorMessage}`);
      appState.isRecording = false;
    }
  }

  async function handlePauseResumeRecording() {
    try {
      if ($isPaused) {
        // Resume recording
        updateStatus("Resuming recording...");
        recordingManager.resumeRecording();
      } else {
        // Pause recording
        updateStatus("Pausing recording...");
        recordingManager.pauseRecording();
      }
    } catch (error) {
      console.error("Error in handlePauseResumeRecording:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to pause/resume recording: ${errorMessage}`);
    }
  }

  async function handleStopRecording() {
    try {
      updateStatus("Stopping recording...");

      recordingManager.stopRecording();

      // Process the recorded audio
      await processRecording();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to stop recording: ${errorMessage}`);
      appState.isRecording = false;
    }
  }

  async function processRecording() {
    try {
      updateStatus("Converting audio to WAV format...");

      // Process and convert audio
      const convertedBlob = await recordingManager.processRecordedAudio();

      // For now, we'll use the transcription manager directly
      // In a real app, you'd check for Tauri APIs here
      await handleTranscription(convertedBlob);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to process recording: ${errorMessage}`);
    }
  }

  async function handleTranscription(convertedBlob: Blob) {
    try {
      updateStatus("Transcribing audio...");

      const noteType = appState.selectedNoteType;
      const result = await transcriptionManager.saveAndTranscribe(
        convertedBlob,
        noteType
      );

      if (result.success) {
        // The transcript is already shown via events, just store it
        appState.lastTranscript = result.transcript || "";

        if (result.medicalNote) {
          // Note generation succeeded - the note is already shown via events
          appState.lastMedicalNote = result.medicalNote;
          updateStatus("Medical note generated successfully!");
        } else if (result.noteError) {
          // Transcription succeeded but note generation failed
          appState.medicalNote = `Error generating note: ${result.noteError}`;
          updateStatus("Transcription completed (note generation failed)");
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Transcription failed: ${errorMessage}`);
      appState.transcript = `Transcription failed: ${errorMessage}`;
      appState.medicalNote =
        "Audio saved successfully, but transcription service failed.";
    }
  }

  async function handleSaveNote() {
    try {
      // Validate patient info
      if (!$patientInfo.firstName || !$patientInfo.lastName) {
        showError("Please enter patient first and last name");
        return;
      }

      // Check if we have both transcript and medical note
      if (!$lastTranscript || !$lastMedicalNote) {
        showError("No note to save. Please record and generate a note first.");
        return;
      }

      updateStatus("Saving note...");

      const result = await notesManager.saveNote(
        $patientInfo,
        $selectedNoteType,
        $lastTranscript,
        $lastMedicalNote
      );

      if (result.success) {
        updateStatus("Note saved successfully!");
        clearResults();
        clearPatientInfo();
        lastTranscript.set("");
        lastMedicalNote.set("");
      } else {
        throw new Error(result.error || "Failed to save note");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to save note: ${errorMessage}`);
    }
  }

  function handleCopyNote() {
    if ($medicalNote) {
      navigator.clipboard
        .writeText($medicalNote)
        .then(() => {
          updateStatus("Note copied to clipboard!");
        })
        .catch(() => {
          showError("Failed to copy note to clipboard");
        });
    }
  }

  function handleReset() {
    reset();
    recordingManager.reset();
    transcriptionManager.clearResults();
  }

  // Expose methods for parent components
  export {
    handleStartRecording,
    handlePauseResumeRecording,
    handleStopRecording,
    handleSaveNote,
    handleCopyNote,
    handleReset,
  };
</script>

<!-- This component doesn't render UI, it just provides coordination functionality -->
