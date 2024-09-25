<script lang="ts">
	export let images: string[];
</script>

<div class="flex flex-col gap-4">
	{#if images.length}
		<div class="flex flex-wrap justify-center gap-4">
			{#each images as img, i}
				<div class="card w-40 h-40 relative">
					<img src={img} alt="item {i}" class="w-full h-full object-cover" />
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="snap-center shrink-0 card w-40 h-40 mx-auto flex justify-center items-center text-9xl"
		>
			🏞️
		</div>
	{/if}
</div>
