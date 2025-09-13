<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Separator } from '$lib/components/ui/separator';
	import { appService } from '$lib/appService';
	import { appState } from '$lib/state.svelte';
	import { onMount } from 'svelte';

	// Form state
	let formData = $state({
		firstName: '',
		lastName: '',
		dateOfBirth: '',
		noteType: 'soap' as 'soap' | 'full'
	});

	let errors = $state<Record<string, string>>({});
	let isProcessing = $state(false);

	// Computed validation
	let valid = $derived(() => {
		return (
			formData.firstName.trim() !== '' &&
			formData.lastName.trim() !== '' &&
			formData.dateOfBirth !== ''
		);
	});

	// Computed recording state
	let isRecording = $derived(() => appState.recordingState === 'recording');
	let isPaused = $derived(() => appState.recordingState === 'paused');
	let canRecord = $derived(() => appState.recordingState === 'ready' && valid());
	let canPauseResume = $derived(() => isRecording() || isPaused());

	// Initialize app service on mount
	onMount(async () => {
		await appService.initialize();
	});

	function validateForm() {
		errors = {};

		if (!formData.firstName.trim()) {
			errors.firstName = 'First name is required';
		}

		if (!formData.lastName.trim()) {
			errors.lastName = 'Last name is required';
		}

		if (!formData.dateOfBirth) {
			errors.dateOfBirth = 'Date of birth is required';
		} else {
			const birthDate = new Date(formData.dateOfBirth);
			const today = new Date();
			if (birthDate > today) {
				errors.dateOfBirth = 'Date of birth cannot be in the future';
			}
		}

		return Object.keys(errors).length === 0;
	}

	async function handleRecord() {
		if (!validateForm()) {
			return;
		}

		try {
			await appService.startRecording();
		} catch (error) {
			console.error('Failed to start recording:', error);
		}
	}

	async function handlePauseResume() {
		try {
			appService.pauseResumeRecording();
		} catch (error) {
			console.error('Failed to pause/resume recording:', error);
		}
	}

	async function handleStopRecording() {
		try {
			appService.stopRecording();
		} catch (error) {
			console.error('Failed to stop recording:', error);
		}
	}

	async function handleProcessRecording() {
		if (!validateForm()) {
			return;
		}

		isProcessing = true;
		try {
			const result = await appService.processRecording();
			
			if (!result.error) {
				// Create the note with the processed data
				await appService.createNote(
					formData.firstName,
					formData.lastName,
					formData.dateOfBirth,
					formData.noteType,
					result.transcript,
					result.medicalNote
				);
				
				// Reset form after successful processing
				formData = {
					firstName: '',
					lastName: '',
					dateOfBirth: '',
					noteType: 'soap'
				};
			}
		} catch (error) {
			console.error('Failed to process recording:', error);
		} finally {
			isProcessing = false;
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>Record Medical Note - Medical Note Generator</title>
	<meta name="description" content="Record a new medical note for a patient" />
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<Card>
		<CardHeader>
			<CardTitle class="text-2xl font-bold">Record Medical Note</CardTitle>
			<CardDescription>
				Enter patient information and select the type of note to generate
			</CardDescription>
		</CardHeader>

		<CardContent class="space-y-6">
			<!-- Patient Information Section -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Patient Information</h3>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="firstName" class="text-sm font-medium">
							First Name <span class="text-destructive">*</span>
						</Label>
						<Input
							id="firstName"
							type="text"
							placeholder="Enter first name"
							bind:value={formData.firstName}
							class={errors.firstName ? 'border-destructive' : ''}
							aria-invalid={!!errors.firstName}
							aria-describedby={errors.firstName ? 'firstName-error' : undefined}
						/>
						{#if errors.firstName}
							<p id="firstName-error" class="text-sm text-destructive" role="alert">
								{errors.firstName}
							</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="lastName" class="text-sm font-medium">
							Last Name <span class="text-destructive">*</span>
						</Label>
						<Input
							id="lastName"
							type="text"
							placeholder="Enter last name"
							bind:value={formData.lastName}
							class={errors.lastName ? 'border-destructive' : ''}
							aria-invalid={!!errors.lastName}
							aria-describedby={errors.lastName ? 'lastName-error' : undefined}
						/>
						{#if errors.lastName}
							<p id="lastName-error" class="text-sm text-destructive" role="alert">
								{errors.lastName}
							</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="dateOfBirth" class="text-sm font-medium">
						Date of Birth <span class="text-destructive">*</span>
					</Label>
					<Input
						id="dateOfBirth"
						type="date"
						bind:value={formData.dateOfBirth}
						class={errors.dateOfBirth ? 'border-destructive' : ''}
						aria-invalid={!!errors.dateOfBirth}
						aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
					/>
					{#if errors.dateOfBirth}
						<p id="dateOfBirth-error" class="text-sm text-destructive" role="alert">
							{errors.dateOfBirth}
						</p>
					{/if}
				</div>
			</div>

			<Separator />

			<!-- Note Type Selection Section -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Note Type</h3>
				<p class="text-sm text-muted-foreground">
					Select the type of medical note to generate from the recording
				</p>

				<RadioGroup bind:value={formData.noteType} class="space-y-3">
					<div class="flex items-center space-x-3">
						<RadioGroupItem value="soap" id="soap" />
						<Label for="soap" class="flex-1">
							<div>
								<div class="text-sm font-medium">SOAP Note</div>
								<div class="text-xs text-muted-foreground">
									Structured format with Subjective, Objective, Assessment, and Plan sections
								</div>
							</div>
						</Label>
					</div>

					<div class="flex items-center space-x-3">
						<RadioGroupItem value="full" id="full" />
						<Label for="full" class="flex-1">
							<div>
								<div class="text-sm font-medium">Full Note</div>
								<div class="text-xs text-muted-foreground">
									Comprehensive narrative note with detailed documentation
								</div>
							</div>
						</Label>
					</div>
				</RadioGroup>
			</div>

			<Separator />

			<!-- Microphone Selection -->
			{#if appState.availableMicrophones.length > 0}
				<div class="space-y-2">
					<Label for="microphone" class="text-sm font-medium">Microphone</Label>
					<select
						id="microphone"
						bind:value={appState.selectedMicrophoneId}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each appState.availableMicrophones as microphone}
							<option value={microphone.deviceId}>
								{microphone.label || `Microphone ${microphone.deviceId.slice(0, 8)}`}
							</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Status Display -->
			{#if appState.appStatus !== 'Ready'}
				<div class="rounded-md bg-muted p-3">
					<p class="text-sm font-medium">{appState.appStatus}</p>
				</div>
			{/if}

			<!-- Error Display -->
			{#if appState.errorMessage}
				<div class="rounded-md bg-destructive/10 p-3">
					<p class="text-sm text-destructive">{appState.errorMessage}</p>
				</div>
			{/if}

			<!-- Recording Section -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Recording</h3>

				{#if appState.recordingState === 'ready'}
					<div class="space-y-4 text-center">
						<p class="text-sm text-muted-foreground">
							Click the record button to start recording the patient visit
						</p>
						<Button onclick={handleRecord} size="lg" class="w-full md:w-auto" disabled={!canRecord()}>
							<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<circle cx="12" cy="12" r="10" />
								<circle cx="12" cy="12" r="6" fill="white" />
							</svg>
							Start Recording
						</Button>
					</div>
				{:else if isRecording() || isPaused()}
					<div class="space-y-4 text-center">
						<div class="flex items-center justify-center space-x-2">
							<div class="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
							<p class="text-sm font-medium">
								{isRecording() ? 'Recording in progress...' : 'Recording paused...'}
							</p>
						</div>
						<p class="text-xs text-muted-foreground">
							Patient: {formData.firstName} {formData.lastName} | Note Type: {formData.noteType === 'soap'
								? 'SOAP Note'
								: 'Full Note'}
						</p>
						<p class="text-sm font-medium">Duration: {formatTime(appState.recordingTime)}</p>
						
						<div class="flex gap-2 justify-center">
							<Button
								onclick={handlePauseResume}
								variant="outline"
								size="lg"
								disabled={!canPauseResume()}
							>
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									{#if isPaused()}
										<path d="M8 5v14l11-7z"/>
									{:else}
										<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
									{/if}
								</svg>
								{isPaused() ? 'Resume' : 'Pause'}
							</Button>
							<Button
								onclick={handleStopRecording}
								variant="destructive"
								size="lg"
							>
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<rect x="6" y="6" width="12" height="12" rx="2" />
								</svg>
								Stop Recording
							</Button>
						</div>
					</div>
				{:else if appState.recordingState === 'stopped'}
					<div class="space-y-4 text-center">
						<p class="text-sm text-muted-foreground">
							Recording completed. Process the audio to generate the medical note.
						</p>
						<Button
							onclick={handleProcessRecording}
							size="lg"
							class="w-full md:w-auto"
							disabled={isProcessing}
						>
							{#if isProcessing}
								<svg class="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Processing...
							{:else}
								<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
								Process Recording
							{/if}
						</Button>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
</div>
