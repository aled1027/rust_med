<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
  import { tauriService } from '$lib/appService';
  import type { TauriNote } from '$lib/types';

  let notes = $state<TauriNote[]>([]);

  async function loadNotes() {
    const result = await tauriService.loadNotes();
    if (result.success) {
      notes = result.notes;
    }
  }

  onMount(async () => {
    await loadNotes();
  });
</script>

<svelte:head>
  <title>Medical Notes - Medical Note Generator</title>
  <meta name="description" content="View all medical notes" />
</svelte:head>

<div class="container mx-auto max-w-2xl space-y-6 px-4 py-8">
  <h2 class="text-2xl font-bold">Medical Notes</h2>
  {#each notes as note}
    <Card key={note.id}>
      <CardHeader>
        <CardTitle class="text-2xl font-bold">{note.firstName} {note.lastName}</CardTitle>
        <CardDescription>Recorded: {new Date(note.createdAt).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <textarea class="w-full h-full" readonly>{note.medicalNote}</textarea>
      </CardContent>
    </Card>
  {/each}
</div>
