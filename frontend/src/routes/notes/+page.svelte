<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/custom/table';
  import * as Dialog from '$lib/components/ui/dialog';
  import { tauriService } from '$lib/tauriService';
  import type { TauriNote } from '$lib/types';
  import { Trash2, Eye } from 'lucide-svelte';

  let notes = $state<TauriNote[]>([]);
  let selectedNote = $state<TauriNote | null>(null);
  let isDialogOpen = $state(false);

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
        // Close dialog if the deleted note was selected
        if (selectedNote?.id === noteId) {
          isDialogOpen = false;
          selectedNote = null;
        }
      } else {
        console.error(`Failed to delete note: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  function openNoteDetail(note: TauriNote) {
    selectedNote = note;
    isDialogOpen = true;
  }

  function closeDialog() {
    isDialogOpen = false;
    selectedNote = null;
  }

  onMount(async () => {
    await loadNotes();
  });
</script>

<svelte:head>
  <title>Medical Notes - Medical Note Generator</title>
  <meta name="description" content="View all medical notes" />
</svelte:head>

<div class="container mx-auto max-w-6xl space-y-6 px-4 py-8">
  <h2 class="text-2xl font-bold">Medical Notes</h2>
  
  {#if notes.length === 0}
    <Card>
      <CardContent class="flex flex-col items-center justify-center py-12">
        <p class="text-muted-foreground">No medical notes found.</p>
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Patient Name</TableHeader>
              <TableHeader>Date of Birth</TableHeader>
              <TableHeader>Note Type</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader class="w-[100px]">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {#each notes as note (note.id)}
              <TableRow class="cursor-pointer hover:bg-muted/50" on:click={() => openNoteDetail(note)}>
                <TableCell class="font-medium">{note.firstName} {note.lastName}</TableCell>
                <TableCell>{new Date(note.dateOfBirth).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {note.noteType === 'soap' ? 'SOAP Note' : 'Full Note'}
                  </span>
                </TableCell>
                <TableCell>{new Date(note.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onclick={(e) => {
                        e.stopPropagation();
                        openNoteDetail(note);
                      }}
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onclick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- Note Detail Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content class="w-[400px] sm:w-[540px]">
    <Dialog.Header>
      <Dialog.Title>{selectedNote?.firstName} {selectedNote?.lastName}</Dialog.Title>
    </Dialog.Header>
    
    {#if selectedNote}
      <div class="space-y-6 py-6">
        <!-- Patient Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Patient Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-medium text-muted-foreground">First Name</div>
              <p class="text-sm">{selectedNote.firstName}</p>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Last Name</div>
              <p class="text-sm">{selectedNote.lastName}</p>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Date of Birth</div>
              <p class="text-sm">{new Date(selectedNote.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <div class="text-sm font-medium text-muted-foreground">Note Type</div>
              <p class="text-sm">
                <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {selectedNote.noteType === 'soap' ? 'SOAP Note' : 'Full Note'}
                </span>
              </p>
            </div>
            <div class="col-span-2">
              <div class="text-sm font-medium text-muted-foreground">Created</div>
              <p class="text-sm">{new Date(selectedNote.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <!-- Transcript -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">Transcript</h3>
          <Textarea 
            readonly 
            value={selectedNote.transcript} 
            class="min-h-[100px] resize-none"
          />
        </div>

        <!-- Medical Note -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">Medical Note</h3>
          <Textarea 
            readonly 
            value={selectedNote.medicalNote} 
            class="min-h-[200px] resize-none"
          />
        </div>
      </div>
    {/if}

    <Dialog.Footer>
      <Button variant="outline" onclick={closeDialog}>Close</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
