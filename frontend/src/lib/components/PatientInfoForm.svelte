<script lang="ts">
  import { patientInfo, selectedNoteType } from "$lib/stores/app";

  function updateFirstName(event: Event) {
    const target = event.target as HTMLInputElement;
    patientInfo.update((info) => ({ ...info, firstName: target.value }));
  }

  function updateLastName(event: Event) {
    const target = event.target as HTMLInputElement;
    patientInfo.update((info) => ({ ...info, lastName: target.value }));
  }

  function updateDateOfBirth(event: Event) {
    const target = event.target as HTMLInputElement;
    patientInfo.update((info) => ({ ...info, dateOfBirth: target.value }));
  }

  function updateNoteType(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedNoteType.set(target.value);
  }
</script>

<form class="patient-info-form" on:submit|preventDefault>
  <div class="form-group">
    <label for="first-name">Patient First Name</label>
    <input
      type="text"
      id="first-name"
      placeholder="Enter first name"
      value={$patientInfo.firstName}
      on:input={updateFirstName}
      required
    />
  </div>

  <div class="form-group">
    <label for="last-name">Patient Last Name</label>
    <input
      type="text"
      id="last-name"
      placeholder="Enter last name"
      value={$patientInfo.lastName}
      on:input={updateLastName}
      required
    />
  </div>

  <div class="form-group">
    <label for="dob">Patient Date of Birth</label>
    <input
      type="date"
      id="dob"
      value={$patientInfo.dateOfBirth}
      on:change={updateDateOfBirth}
      required
    />
  </div>

  <div class="form-group">
    <label for="note-type">Note Type</label>
    <select
      id="note-type"
      value={$selectedNoteType}
      on:change={updateNoteType}
      required
    >
      <option value="soap">SOAP Note</option>
      <option value="full">Full Note</option>
    </select>
  </div>
</form>
