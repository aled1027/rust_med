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
	class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/10"
>
	<!-- Background Pattern -->
	<div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
	
	<!-- Floating Elements -->
	<div class="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float"></div>
	<div class="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float-delayed"></div>
	<div class="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-lg animate-float-slow"></div>

	<div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="mx-auto max-w-5xl text-center">
			<!-- Main Heading -->
			<div class="mb-8">
				<h1 class="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-6">
					Medical Note
					<span class="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
						Generator
					</span>
				</h1>
				<p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
					Transform patient visits into structured medical notes with AI-powered transcription and SOAP note generation.
				</p>
			</div>

			<!-- Feature Icons -->
			<div class="flex justify-center items-center gap-8 mb-12 opacity-60">
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Mic class="w-5 h-5" />
					<span>Record</span>
				</div>
				<div class="w-1 h-1 bg-muted-foreground rounded-full"></div>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<FileText class="w-5 h-5" />
					<span>Transcribe</span>
				</div>
				<div class="w-1 h-1 bg-muted-foreground rounded-full"></div>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Stethoscope class="w-5 h-5" />
					<span>Generate</span>
				</div>
			</div>

			<!-- CTA Button -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<Button
					href="/profile"
					variant="default"
					size="lg"
					class="group text-lg font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
					aria-label="Get Started"
				>
					Get Started
					<ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
				</Button>
				
				{#if isAuthenticated}
					<Button
						href="/notes"
						variant="outline"
						size="lg"
						class="text-lg font-semibold px-8 py-6 rounded-xl"
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
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-20px) rotate(180deg); }
	}
	
	@keyframes float-delayed {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-30px) rotate(-180deg); }
	}
	
	@keyframes float-slow {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-15px) rotate(90deg); }
	}
	
	@keyframes gradient {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
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