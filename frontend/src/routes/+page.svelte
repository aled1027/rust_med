<script lang="ts">
  import { onMount } from "svelte";
  import Menu from "$lib/components/Menu.svelte";
  import PatientInfoForm from "$lib/components/PatientInfoForm.svelte";
  import ResultsDisplay from "$lib/components/ResultsDisplay.svelte";
  import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
  import { appService } from "$lib/services/appService";

  onMount(async () => {
    await appService.initialize();
  });
</script>

<Menu />

<main class="flow">
  <div class="flow mx-auto w-max-narrow">
    <header>
      <h1 class="size-step-7 text-align-center w-fit mx-auto">
        Medical Note Generator
      </h1>
    </header>

    <section class="flow my-2xl">
      <h2 class="mx-auto w-fit">Start a New Note</h2>
      <PatientInfoForm />
    </section>
  </div>
</main>

<ErrorDisplay />

<footer></footer>
