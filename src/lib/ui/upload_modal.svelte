<script lang="ts">
	import UploadForm, { type UploadKind, type UploadSection } from '$lib/form/upload_form.svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';

	export let section: UploadSection;
	export let kind: UploadKind;
	export let orgId: string | undefined = undefined;
	export let projectId: string | undefined = undefined;
	export let campaignId: string | undefined = undefined;
	export let taskId: string | undefined = undefined;
	export let rewardId: string | undefined = undefined;

	const modalStore = getModalStore();

	function onUploadFormDismiss(event: CustomEvent<string[] | undefined>) {
		$modalStore[0].response!(event.detail);
	}
</script>

<UploadForm
	{section}
	{kind}
	{orgId}
	{projectId}
	{campaignId}
	{taskId}
	{rewardId}
	on:dismiss={onUploadFormDismiss}
/>
