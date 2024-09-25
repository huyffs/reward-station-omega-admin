<script lang="ts">
	import { initializeNotifications } from '$lib/util/notif';
	import '../app.postcss';
	import { Modal, Toast, autoModeWatcher, initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	initializeNotifications();
</script>

<svelte:head
	>{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}</svelte:head
>

<div class="app h-full">
	<Toast zIndex="z-[1999]" />
	<Modal />
	<slot />
</div>
