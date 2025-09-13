<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { tauriService } from '$lib/appService';
  import type { TauriNote } from '$lib/types';

  let notes = $state<TauriNote[]>([]);
  let deletingNoteId = $state<string | null>(null);

  async function loadNotes() {
    const result = await tauriService.loadNotes();
    if (result.success) {
      notes = result.notes;
    }
  }

  async function deleteNote(noteId: string) {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deletingNoteId = noteId;
      try {
        const result = await tauriService.deleteNote(noteId);
        if (result.success) {
          // Reload notes after successful deletion
          await loadNotes();
        } else {
          alert(`Failed to delete note: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Failed to delete note. Please try again.');
      } finally {
        deletingNoteId = null;
      }
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
        <div class="flex justify-between items-start">
          <div>
            <CardTitle class="text-2xl font-bold">{note.firstName} {note.lastName}</CardTitle>
            <CardDescription>Recorded: {new Date(note.createdAt).toLocaleString()}</CardDescription>
          </div>
          <Button
            variant="destructive"
            class="cursor-pointer"
            size="sm"
            onclick={() => deleteNote(note.id)}
            disabled={deletingNoteId === note.id}
          >
            {deletingNoteId === note.id ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <textarea class="w-full h-full" readonly>{note.medicalNote}</textarea>
      </CardContent>
    </Card>
  {/each}
</div>
