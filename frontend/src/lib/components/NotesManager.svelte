<script lang="ts">
  import {
    appState,
    updateStatus,
    showError,
  } from "$lib/stores/app";

  let notes: any[] = [];
  let selectedNoteData: any = null;

  // Event callbacks
  let onNotesUpdate: ((notes: any[]) => void) | null = null;
  let onNoteSelected: ((note: any) => void) | null = null;

  function onNotesUpdateCallback(callback: (notes: any[]) => void) {
    onNotesUpdate = callback;
  }

  function onNoteSelectedCallback(callback: (note: any) => void) {
    onNoteSelected = callback;
  }

  async function loadNotes() {
    try {
      // Load notes from localStorage (replace with actual Tauri API calls)
      const storedNotes = localStorage.getItem("medicalNotes");
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        appState.savedNotes = notes;

        if (onNotesUpdate) {
          onNotesUpdate(notes);
        }
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
      showError("Failed to load saved notes");
    }
  }

  async function saveNote(
    patientInfo: any,
    noteType: string,
    transcript: string,
    medicalNote: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const newNote = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        patientInfo,
        noteType,
        transcript,
        medicalNote,
        date: new Date().toISOString().split("T")[0],
      };

      notes.unshift(newNote); // Add to beginning of array
      appState.savedNotes = [...notes];

      // Save to localStorage (replace with actual Tauri API calls)
      localStorage.setItem("medicalNotes", JSON.stringify(notes));

      if (onNotesUpdate) {
        onNotesUpdate(notes);
      }

      updateStatus("Note saved successfully!");
      return { success: true };
    } catch (error) {
      console.error("Failed to save note:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to save note: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  function selectNote(noteId: string) {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      selectedNoteData = note;
      appState.selectedNote = note;

      if (onNoteSelected) {
        onNoteSelected(note);
      }
    }
  }

  function deleteNote(noteId: string): { success: boolean; error?: string } {
    try {
      const noteIndex = notes.findIndex((n) => n.id === noteId);
      if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        appState.savedNotes = [...notes];

        // Update localStorage
        localStorage.setItem("medicalNotes", JSON.stringify(notes));

        if (onNotesUpdate) {
          onNotesUpdate(notes);
        }

        // Clear selection if deleted note was selected
        if (selectedNoteData && selectedNoteData.id === noteId) {
          selectedNoteData = null;
          appState.selectedNote = null;

          if (onNoteSelected) {
            onNoteSelected(null);
          }
        }

        updateStatus("Note deleted successfully!");
        return { success: true };
      } else {
        return { success: false, error: "Note not found" };
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to delete note: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  function groupNotesByDate() {
    const groups: any[] = [];
    const today = new Date().toISOString().split("T")[0];

    // Group notes by date
    const dateGroups = notes.reduce((acc: any, note: any) => {
      const date = note.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(note);
      return acc;
    }, {});

    // Convert to array format and add metadata
    Object.entries(dateGroups).forEach(
      ([date, notesForDate]: [string, any]) => {
        groups.push({
          date,
          notes: notesForDate,
          isToday: date === today,
          displayDate: formatDisplayDate(date),
        });
      }
    );

    // Sort by date (newest first)
    groups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return groups;
  }

  function formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  function exportNotes(): string {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        notes: notes,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Failed to export notes:", error);
      showError("Failed to export notes");
      return "";
    }
  }

  function importNotes(importData: string): {
    success: boolean;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(importData);
      if (parsed.notes && Array.isArray(parsed.notes)) {
        notes = parsed.notes;
        appState.savedNotes = [...notes];

        // Update localStorage
        localStorage.setItem("medicalNotes", JSON.stringify(notes));

        if (onNotesUpdate) {
          onNotesUpdate(notes);
        }

        updateStatus("Notes imported successfully!");
        return { success: true };
      } else {
        return { success: false, error: "Invalid import format" };
      }
    } catch (error) {
      console.error("Failed to import notes:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to import notes: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  // Expose methods for parent components
  export {
    loadNotes,
    saveNote,
    selectNote,
    deleteNote,
    groupNotesByDate,
    exportNotes,
    importNotes,
    onNotesUpdateCallback,
    onNoteSelectedCallback,
  };
</script>

<!-- This component doesn't render UI, it just provides notes management functionality -->
