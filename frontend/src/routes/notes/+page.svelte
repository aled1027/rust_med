<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Record Medical Note - Medical Note Generator</title>
	<meta name="description" content="Record a new medical note for a patient" />
</svelte:head>

<div class="container mx-auto max-w-2xl space-y-6 px-4 py-8">
	<h2 class="text-2xl font-bold">Medical Notes</h2>
	<Card>
		<CardHeader>
			<CardTitle class="text-2xl font-bold">Note 1</CardTitle>
			<CardDescription>This is a note.</CardDescription>
		</CardHeader>
	</Card>
</div>
