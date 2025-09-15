<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Textarea } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { tauriService } from '$lib/tauriService';
  import type { TauriNote } from '$lib/types';

  let notes = $state<TauriNote[]>([]);

  async function loadNotes() {
    const result = await tauriService.loadNotes();
    if (result.success) {
      notes = result.notes;
    }
  }

  async function deleteNote(noteId: string) {
    // TODO: add confirmation
    try {
      // TODO: Seems like the return type might be messed up here
      const result = await tauriService.deleteNote(noteId);
      if (result.success) {
        notes = notes.filter((note) => note.id !== noteId);
      } else {
        console.error(`Failed to delete note: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
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
    <Card>
      <CardHeader>
        <div class="flex items-start justify-between">
          <div>
            <CardTitle class="text-2xl font-bold">{note.firstName} {note.lastName}</CardTitle>
            <CardDescription>Recorded: {new Date(note.createdAt).toLocaleString()}</CardDescription>
          </div>
          <Button variant="destructive" class="cursor-pointer" size="sm" onclick={() => deleteNote(note.id)}>
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea>{note.medicalNote}</Textarea>
      </CardContent>
    </Card>
  {/each}
</div>
