<script lang="ts">
	import { page } from '$app/stores';
	import type { Campaign } from '$lib/store/campaign_store';
	import type { Project } from '$lib/store/project_store';

	export let datas: Campaign[] | Project[] | undefined;
	export let title = '';
	export let type = '';
	export let displayCreate = true;
	export let href: string;
</script>

<div class="max-w-[60%] w-full h-full mt-[120px]">
	<h4 class="mb-8">{title}</h4>
	<section class="grid grid-cols-2 md:grid-cols-3 gap-4">
		{#if displayCreate}
			<a
				href="{$page.url.pathname}/new"
				class="btn variant-filled h-[210px] flex flex-col justify-center items-center"
			>
				<i class="fa-solid fa-plus text-xl mb-3" />
				<p class="text-base">Create a {type}</p>
			</a>
		{/if}
		{#if !datas || !datas.length}
			<div class="mt-4 text-center">
				<p class="mb-4 text-xl">No {type} yet, create one!</p>
			</div>
		{:else}
			{#each datas as data}
				<a
					href={href ? href : `${$page.url.pathname}/${data.id}`}
					class="btn variant-filled h-[210px]">{data.name}</a
				>
			{/each}
		{/if}
	</section>
</div>
