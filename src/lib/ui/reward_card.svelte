<script lang="ts">
	export let image: string | undefined;
	export let title: string;
	let cls = '';
	export { cls as class };
</script>

<div class="card bg-initial overflow-hidden w-56 flex flex-col {cls}">
	<header>
		{#if image}
			<img src={image} alt={title} class="bg-black/50 w-full aspect-square object-cover" />
		{:else}
			<div
				class="snap-center shrink-0 card w-40 h-40 mx-auto flex justify-center items-center text-9xl"
			>
				🏞️
			</div>
		{/if}
	</header>
	<main class="flex-1 flex flex-col">
		<header class="p-4 pt-2 flex-auto">
			<h4 class="h4 text-center">{title}</h4>
			<slot name="head" />
		</header>
		<section class="p-4 flex flex-col">
			<slot />
		</section>
	</main>
</div>
