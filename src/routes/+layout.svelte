<script lang="ts">
  import './layout.css';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';

  let { children } = $props();
</script>

<div class="min-h-screen bg-slate-50 font-sans text-slate-900">
  {#key $page.url.pathname}
    <main in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
      {@render children()}
    </main>
  {/key}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
