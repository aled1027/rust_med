<script lang="ts">
  import { appService } from "$lib/services/appService";
  import { browser } from "$app/environment";
  import { appState } from "$lib/stores/app.svelte";

  let notes = $state<any[]>([]);

  async function loadNotes() {
    if (browser) {
      const result = await appService.loadNotes();
      if (result.success) {
        notes = result.notes;
      } else {
        console.error(result.error);
      }
    }
  }

  async function saveANote() {
    if (browser) {
      appState.patientInfo.firstName = "John";
      appState.patientInfo.lastName = "Doe";
      appState.patientInfo.dateOfBirth = "1990-01-01";
      appState.selectedNoteType = "soap";
      appState.transcript = "This is a test transcript";
      appState.medicalNote = "This is a test medical note";
      await appService.saveNote();
    }
  }
</script>

<h1>Notes</h1>
<div class="grid">
  <button class="button" onclick={loadNotes}>Load Notes</button>
  <button class="button" onclick={saveANote}>Save a Note</button>
</div>

<ul>
  {#each notes as note}
    <li>{note.first_name} {note.last_name} {note.dob} {note.note_type}</li>
  {/each}
</ul>
