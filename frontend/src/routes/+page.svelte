<script lang="ts">
	import { useAuth } from '$lib/hooks/use-auth.svelte.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ArrowRight, Stethoscope, FileText, Mic } from 'lucide-svelte';
	import { onMount } from 'svelte';

	// Get authentication context
	const auth = useAuth();

	// Reactive state from auth context
	let isAuthenticated = $derived(auth.state.isAuthenticated);

	// Animation state
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Medical Note Generator</title>
	<meta
		name="description"
		content="Transform patient visits into structured medical notes with AI-powered transcription and SOAP note generation."
	/>
</svelte:head>

<!-- Hero Section -->
<section
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/10"
>
	<!-- Background Pattern -->
	<div class="bg-grid-pattern absolute inset-0 opacity-5"></div>

	<!-- Floating Elements -->
	<div
		class="animate-float absolute top-20 left-10 h-20 w-20 rounded-full bg-primary/10 blur-xl"
	></div>
	<div
		class="animate-float-delayed absolute right-10 bottom-20 h-32 w-32 rounded-full bg-primary/5 blur-2xl"
	></div>
	<div
		class="animate-float-slow absolute top-1/2 left-1/4 h-16 w-16 rounded-full bg-accent/10 blur-lg"
	></div>

	<div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-5xl text-center">
			<!-- Main Heading -->
			<div class="mb-8">
				<h1 class="mb-6 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
					Medical Note
					<span
						class="animate-gradient bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
					>
						Generator
					</span>
				</h1>
				<p class="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
					Transform patient visits into structured medical notes with AI-powered transcription and
					SOAP note generation.
				</p>
			</div>

			<!-- Feature Icons -->
			<div class="mb-12 flex items-center justify-center gap-8 opacity-60">
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Mic class="h-5 w-5" />
					<span>Record</span>
				</div>
				<div class="h-1 w-1 rounded-full bg-muted-foreground"></div>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<FileText class="h-5 w-5" />
					<span>Transcribe</span>
				</div>
				<div class="h-1 w-1 rounded-full bg-muted-foreground"></div>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Stethoscope class="h-5 w-5" />
					<span>Generate</span>
				</div>
			</div>

			<!-- CTA Button -->
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button
					href="/profile"
					variant="default"
					size="lg"
					class="group rounded-xl px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
					aria-label="Get Started"
				>
					Get Started
					<ArrowRight
						class="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
					/>
				</Button>

				{#if isAuthenticated}
					<Button
						href="/notes"
						variant="outline"
						size="lg"
						class="rounded-xl px-8 py-6 text-lg font-semibold"
						aria-label="View Notes"
					>
						View Notes
					</Button>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
		}
	}

	@keyframes float-delayed {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-30px) rotate(-180deg);
		}
	}

	@keyframes float-slow {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-15px) rotate(90deg);
		}
	}

	@keyframes gradient {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	.animate-float-delayed {
		animation: float-delayed 8s ease-in-out infinite;
	}

	.animate-float-slow {
		animation: float-slow 10s ease-in-out infinite;
	}

	.animate-gradient {
		background-size: 200% 200%;
		animation: gradient 3s ease infinite;
	}

	.bg-grid-pattern {
		background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
