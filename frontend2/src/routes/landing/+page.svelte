<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Star, ArrowRight, Mail, Phone, MapPin } from 'lucide-svelte';
</script>

<svelte:head>
	<title>NexusFlow - Streamline Your Workflow</title>
	<meta
		name="description"
		content="Transform your productivity with NexusFlow - the all-in-one platform for modern teams."
	/>
</svelte:head>

<!-- Navigation -->
<nav
	class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center space-x-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
					<span class="text-lg font-bold text-primary-foreground">N</span>
				</div>
				<span class="text-xl font-bold">NexusFlow</span>
			</div>
			<div class="hidden items-center space-x-8 md:flex">
				<a href="#features" class="text-sm font-medium transition-colors hover:text-primary"
					>Features</a
				>
				<a href="#testimonials" class="text-sm font-medium transition-colors hover:text-primary"
					>Testimonials</a
				>
				<a href="#pricing" class="text-sm font-medium transition-colors hover:text-primary"
					>Pricing</a
				>
				<a href="#contact" class="text-sm font-medium transition-colors hover:text-primary"
					>Contact</a
				>
			</div>
			<div class="flex items-center space-x-4">
				<Button variant="ghost" size="sm">Sign In</Button>
				<Button size="sm">Get Started</Button>
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section
	class="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 sm:py-32"
>
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
				Streamline Your
				<span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
					Workflow
				</span>
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
				Transform your productivity with NexusFlow - the all-in-one platform that brings your team
				together, streamlines processes, and accelerates growth.
			</p>
			<div class="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
				<Button size="lg" class="px-8 py-6 text-lg">
					Start Free Trial
					<ArrowRight class="ml-2 h-5 w-5" />
				</Button>
				<Button variant="outline" size="lg" class="px-8 py-6 text-lg">Watch Demo</Button>
			</div>
			<p class="mt-4 text-sm text-muted-foreground">
				No credit card required • 14-day free trial • Cancel anytime
			</p>
		</div>
	</div>
</section>

<!-- Features Section -->
<section id="features" class="bg-muted/30 py-20 sm:py-32">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to succeed</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				Powerful features designed to help your team work more efficiently and achieve better
				results.
			</p>
		</div>
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<Card class="p-6">
				<CardHeader class="pb-4">
					<CardTitle>Task Management</CardTitle>
					<CardDescription>
						Organize, prioritize, and track your team's work with intuitive project management
						tools.
					</CardDescription>
				</CardHeader>
			</Card>
			<Card class="p-6">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Star class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Team Collaboration</CardTitle>
					<CardDescription>
						Seamless communication and file sharing to keep everyone on the same page.
					</CardDescription>
				</CardHeader>
			</Card>
			<Card class="p-6">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<ArrowRight class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Automation</CardTitle>
					<CardDescription>
						Automate repetitive tasks and workflows to focus on what matters most.
					</CardDescription>
				</CardHeader>
			</Card>
			<Card class="p-6">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Mail class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Analytics & Reports</CardTitle>
					<CardDescription>
						Get insights into your team's performance with detailed analytics and reports.
					</CardDescription>
				</CardHeader>
			</Card>
			<Card class="p-6">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<Phone class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Integrations</CardTitle>
					<CardDescription>
						Connect with your favorite tools and services for a unified workspace.
					</CardDescription>
				</CardHeader>
			</Card>
			<Card class="p-6">
				<CardHeader class="pb-4">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<MapPin class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Security First</CardTitle>
					<CardDescription>
						Enterprise-grade security to keep your data safe and compliant.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section id="testimonials" class="py-20 sm:py-32">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Loved by teams worldwide</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				See what our customers have to say about their experience with NexusFlow.
			</p>
		</div>
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<Card class="p-6">
				<CardContent class="pt-6">
					<div class="mb-4 flex items-center space-x-1">
						{#each Array(5) as _, i}
							<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" key={i} />
						{/each}
					</div>
					<blockquote class="mb-4 text-muted-foreground">
						"NexusFlow has completely transformed how our team works. The automation features alone
						have saved us 10+ hours per week."
					</blockquote>
					<div class="flex items-center space-x-3">
						<Avatar class="h-10 w-10">
							<AvatarFallback>SC</AvatarFallback>
						</Avatar>
						<div>
							<div class="font-semibold">Sarah Chen</div>
							<div class="text-sm text-muted-foreground">CTO, TechCorp</div>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card class="p-6">
				<CardContent class="pt-6">
					<div class="mb-4 flex items-center space-x-1">
						{#each Array(5) as _, i}
							<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" key={i} />
						{/each}
					</div>
					<blockquote class="mb-4 text-muted-foreground">
						"The collaboration features are incredible. Our remote team feels more connected than
						ever before."
					</blockquote>
					<div class="flex items-center space-x-3">
						<Avatar class="h-10 w-10">
							<AvatarFallback>MJ</AvatarFallback>
						</Avatar>
						<div>
							<div class="font-semibold">Marcus Johnson</div>
							<div class="text-sm text-muted-foreground">Product Manager, InnovateLab</div>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card class="p-6">
				<CardContent class="pt-6">
					<div class="mb-4 flex items-center space-x-1">
						{#each Array(5) as _}
							<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
						{/each}
					</div>
					<blockquote class="mb-4 text-muted-foreground">
						"Setup was a breeze, and the ROI was immediate. We couldn't be happier with our
						decision."
					</blockquote>
					<div class="flex items-center space-x-3">
						<Avatar class="h-10 w-10">
							<AvatarFallback>ER</AvatarFallback>
						</Avatar>
						<div>
							<div class="font-semibold">Elena Rodriguez</div>
							<div class="text-sm text-muted-foreground">CEO, StartupXYZ</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-primary py-20 text-primary-foreground sm:py-32">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
				Ready to transform your workflow?
			</h2>
			<p class="mt-4 text-lg opacity-90">
				Join thousands of teams who are already working smarter with NexusFlow.
			</p>
			<div class="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
				<Button size="lg" variant="secondary" class="px-8 py-6 text-lg">
					Start Free Trial
					<ArrowRight class="ml-2 h-5 w-5" />
				</Button>
				<Button
					size="lg"
					variant="outline"
					class="border-primary-foreground px-8 py-6 text-lg text-primary-foreground hover:bg-primary-foreground hover:text-primary"
				>
					Contact Sales
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Contact Section -->
<section id="contact" class="bg-muted/30 py-20 sm:py-32">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mx-auto mb-16 max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Get in touch</h2>
			<p class="mt-4 text-lg text-muted-foreground">
				Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as
				possible.
			</p>
		</div>
		<div class="mx-auto max-w-2xl">
			<Card class="p-8">
				<form class="space-y-6">
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<label for="firstName" class="mb-2 block text-sm font-medium">First name</label>
							<Input id="firstName" type="text" placeholder="John" />
						</div>
						<div>
							<label for="lastName" class="mb-2 block text-sm font-medium">Last name</label>
							<Input id="lastName" type="text" placeholder="Doe" />
						</div>
					</div>
					<div>
						<label for="email" class="mb-2 block text-sm font-medium">Email</label>
						<Input id="email" type="email" placeholder="john@example.com" />
					</div>
					<div>
						<label for="company" class="mb-2 block text-sm font-medium">Company</label>
						<Input id="company" type="text" placeholder="Acme Inc." />
					</div>
					<div>
						<label for="message" class="mb-2 block text-sm font-medium">Message</label>
						<Textarea id="message" placeholder="Tell us about your project..." />
					</div>
					<Button type="submit" class="w-full">Send Message</Button>
				</form>
			</Card>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="border-t bg-background">
	<div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
			<div class="space-y-4">
				<div class="flex items-center space-x-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<span class="text-lg font-bold text-primary-foreground">N</span>
					</div>
					<span class="text-xl font-bold">NexusFlow</span>
				</div>
				<p class="text-sm text-muted-foreground">
					Streamline your workflow with the all-in-one platform for modern teams.
				</p>
			</div>
			<div class="space-y-4">
				<h3 class="font-semibold">Product</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="#features" class="text-muted-foreground transition-colors hover:text-primary"
							>Features</a
						>
					</li>
					<li>
						<a href="#pricing" class="text-muted-foreground transition-colors hover:text-primary"
							>Pricing</a
						>
					</li>
					<li>
						<a
							href="#integrations"
							class="text-muted-foreground transition-colors hover:text-primary">Integrations</a
						>
					</li>
					<li>
						<a href="#api" class="text-muted-foreground transition-colors hover:text-primary">API</a
						>
					</li>
				</ul>
			</div>
			<div class="space-y-4">
				<h3 class="font-semibold">Company</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="#about" class="text-muted-foreground transition-colors hover:text-primary"
							>About</a
						>
					</li>
					<li>
						<a href="#blog" class="text-muted-foreground transition-colors hover:text-primary"
							>Blog</a
						>
					</li>
					<li>
						<a href="#careers" class="text-muted-foreground transition-colors hover:text-primary"
							>Careers</a
						>
					</li>
					<li>
						<a href="#contact" class="text-muted-foreground transition-colors hover:text-primary"
							>Contact</a
						>
					</li>
				</ul>
			</div>
			<div class="space-y-4">
				<h3 class="font-semibold">Support</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="#help" class="text-muted-foreground transition-colors hover:text-primary"
							>Help Center</a
						>
					</li>
					<li>
						<a href="#docs" class="text-muted-foreground transition-colors hover:text-primary"
							>Documentation</a
						>
					</li>
					<li>
						<a href="#status" class="text-muted-foreground transition-colors hover:text-primary"
							>Status</a
						>
					</li>
					<li>
						<a href="#security" class="text-muted-foreground transition-colors hover:text-primary"
							>Security</a
						>
					</li>
				</ul>
			</div>
		</div>
		<Separator class="my-8" />
		<div class="flex flex-col items-center justify-between sm:flex-row">
			<p class="text-sm text-muted-foreground">© 2024 NexusFlow. All rights reserved.</p>
			<div class="mt-4 flex space-x-6 sm:mt-0">
				<a
					href="#privacy"
					class="text-sm text-muted-foreground transition-colors hover:text-primary"
					>Privacy Policy</a
				>
				<a href="#terms" class="text-sm text-muted-foreground transition-colors hover:text-primary"
					>Terms of Service</a
				>
			</div>
		</div>
	</div>
</footer>
