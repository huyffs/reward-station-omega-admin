<script lang="ts">
	export let href: string;
	export let image: string | undefined;
	export let text: string;
</script>

<a {href} class="card bg-initial card-hover overflow-hidden w-48">
	<header>
		{#if image}
			<img src={image} alt={text} class="bg-black/50 w-full aspect-square object-cover" />
		{:else}
			<div
				class="snap-center shrink-0 card w-40 h-40 mx-auto flex justify-center items-center text-9xl"
			>
				🏞️
			</div>
		{/if}
	</header>
	<section class="p-4 text-center">{text}</section>
</a>
