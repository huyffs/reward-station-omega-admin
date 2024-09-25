<script lang="ts">
	import { page } from '$app/stores';
	import type { Campaign } from '$lib/store/campaign_store';
	import type { Org } from '$lib/store/org_store';
	import type { Project } from '$lib/store/project_store';

	export let data: Campaign | Project | Org | undefined;
	export let type = '';
</script>

<div class="w-full flex flex-col justify-center items-center p-4">
	<div
		class="card p-10 lg:max-w-[30%] w-full h-full flex flex-row justify-center items-center mt-20 relative"
	>
		<div class="w-full flex flex-col justify-center ml-5">
			<h3>{data?.name}</h3>
			<a href="{$page.url.pathname}/{type}" class="mt-5">
				<h3>My {type}</h3>
			</a>
		</div>
		<div class="flex justify-end absolute top-4 right-4">
			<a href="{$page.url.pathname}/edit">Edit</a>
		</div>
	</div>
</div>
