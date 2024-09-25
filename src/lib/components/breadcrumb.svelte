<script lang="ts">
	import { page } from '$app/stores';
	import { derivedById } from '$lib/store/async_store';
	import { useCampaignStore, type Campaign } from '$lib/store/campaign_store';
	import { orgStore, type Org } from '$lib/store/org_store';
	import { useProjectStore, type Project } from '$lib/store/project_store';
	import { rewardStore, type Reward } from '$lib/store/reward_store';
	import type { Readable } from 'svelte/store';

	const parts = $page.url.pathname.substring(1).split('/');

	let org: Readable<Org | undefined> | undefined;
	let project: Readable<Project | undefined> | undefined;
	let campaign: Readable<Campaign | undefined> | undefined;
	let reward: Readable<Reward | undefined> | undefined;

	let paths = buildPath();

	if ($page.params.orgId) {
		org = derivedById(orgStore, $page.params.orgId);
		org.subscribe(() => {
			paths = buildPath();
		});
		if ($page.params.projectId) {
			const projectStore = useProjectStore($page.params.orgId);
			project = derivedById(projectStore, $page.params.projectId);
			project.subscribe(() => {
				paths = buildPath();
			});
		}
		if ($page.params.campaignId) {
			const campaignStore = useCampaignStore($page.params.orgId, $page.params.projectId);
			campaign = derivedById(campaignStore, $page.params.campaignId);
			campaign.subscribe(() => {
				paths = buildPath();
			});
		}
	} else if ($page.params.rewardId) {
		reward = derivedById(rewardStore, $page.params.rewardId);
		reward.subscribe(() => {
			paths = buildPath();
		});
	}

	function buildPath() {
		const paths: string[][] = [];
		let pathname = '';
		let prevPart = '';
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			pathname += '/' + part;
			let label = part;
			if (!i) {
				label = '🏡';
			} else if (prevPart === 'orgs' && org && $org) {
				label = $org.name;
			} else if (prevPart === 'projects' && project && $project) {
				label = $project.name;
			} else if (prevPart === 'campaigns' && campaign && $campaign) {
				label = $campaign.name;
			} else if (prevPart === 'rewards' && reward && $reward) {
				label = $reward.name;
			}
			paths.push([pathname, label]);
			prevPart = part;
		}
		return paths;
	}
</script>

<header>
	<ol class="breadcrumb m-4">
		{#each paths.slice(0, -1) as item}
			<li class="crumb capitalize"><a class="anchor" href={item[0]}>{item[1]}</a></li>
			<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		{/each}
		<li class="crumb capitalize">{paths[paths.length - 1][1]}</li>
	</ol>
</header>
