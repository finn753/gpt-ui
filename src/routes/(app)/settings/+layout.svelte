<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import { onMount } from "svelte";
	import { BarChart3, CircleUserRound, FileText, KeyRound, LogOut } from "lucide-svelte";
	import SidebarButton from "$lib/components/SidebarButton.svelte";

	let sidebarOpened = false;

	function handleMobileSidebar() {
		if (window.innerWidth < 768) {
			sidebarOpened = false;
		}
	}

	onMount(() => {
		if (window.innerWidth >= 768) {
			sidebarOpened = true;
		}
	});
</script>

<svelte:window on:resize={() => handleMobileSidebar()} />

<div class="relative grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
	<CollapsibleSidebar
		class="z-10"
		title="Settings"
		bind:isOpen={sidebarOpened}
		on:open={() => handleMobileSidebar()}
	>
		<div class="flex h-full flex-col justify-between pb-4">
			<div class="flex flex-col gap-2">
				<SidebarButton path="/settings/account">
					<CircleUserRound />
					Account
				</SidebarButton>
				<SidebarButton path="/settings/integrations">
					<KeyRound />
					Integrations
				</SidebarButton>
				<SidebarButton path="/settings/lds">
					<BarChart3 />
					Live Data Sources
				</SidebarButton>
				<SidebarButton path="/settings/data">
					<FileText />
					Data
				</SidebarButton>
			</div>

			<SidebarButton path="/logout">
				<LogOut />
				Logout
			</SidebarButton>
		</div>
	</CollapsibleSidebar>
	<div class="col-span-1 h-full max-h-full overflow-y-auto min-h-0 p-4 px-8 md:col-span-2 lg:col-span-3">
		<slot />
	</div>
</div>
