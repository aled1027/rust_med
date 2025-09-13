<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Separator } from '$lib/components/ui/separator';

	// Form state
	let formData = $state({
		firstName: '',
		lastName: '',
		dateOfBirth: '',
		noteType: 'soap' as 'soap' | 'full'
	});

	let errors = $state<Record<string, string>>({});
	let isRecording = $state(false);

	// Computed validation
	let valid = $derived(() => {
		return formData.firstName.trim() !== '' && 
		       formData.lastName.trim() !== '' && 
		       formData.dateOfBirth !== '';
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

	function handleRecord() {
		if (!validateForm()) {
			return;
		}
		
		isRecording = true;
		// TODO: Implement actual recording functionality
		console.log('Starting recording with:', {
			firstName: formData.firstName,
			lastName: formData.lastName,
			dateOfBirth: formData.dateOfBirth,
			noteType: formData.noteType
		});
	}

	function handleStopRecording() {
		isRecording = false;
		// TODO: Implement stop recording functionality
		console.log('Stopping recording');
	}
</script>

<svelte:head>
	<title>Record Medical Note - Medical Note Generator</title>
	<meta name="description" content="Record a new medical note for a patient" />
</svelte:head>

<div class="container mx-auto max-w-2xl py-8 px-4">
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
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

			<!-- Recording Section -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Recording</h3>
				
				{#if !isRecording}
					<div class="text-center space-y-4">
						<p class="text-sm text-muted-foreground">
							Click the record button to start recording the patient visit
						</p>
						<Button
							onclick={handleRecord}
							size="lg"
							class="w-full md:w-auto"
							disabled={!valid()}
						>
							<svg
								class="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<circle cx="12" cy="12" r="10" />
								<circle cx="12" cy="12" r="6" fill="white" />
							</svg>
							Start Recording
						</Button>
					</div>
				{:else}
					<div class="text-center space-y-4">
						<div class="flex items-center justify-center space-x-2">
							<div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
							<p class="text-sm font-medium">Recording in progress...</p>
						</div>
						<p class="text-xs text-muted-foreground">
							Patient: {formData.firstName} {formData.lastName} | Note Type: {formData.noteType === 'soap' ? 'SOAP Note' : 'Full Note'}
						</p>
						<Button
							onclick={handleStopRecording}
							variant="destructive"
							size="lg"
							class="w-full md:w-auto"
						>
							<svg
								class="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<rect x="6" y="6" width="12" height="12" rx="2" />
							</svg>
							Stop Recording
						</Button>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
</div>
