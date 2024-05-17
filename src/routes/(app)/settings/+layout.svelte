<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import { onMount } from "svelte";
	import { LogOut } from "lucide-svelte";
	import SidebarButton from "$lib/components/SidebarButton.svelte";
	import { Separator } from "$lib/components/ui/separator";

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
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-1">
					<h2 class="text-lg font-semibold text-muted-foreground">General</h2>
					<SidebarButton path="/settings/account">Account</SidebarButton>
				</div>

				<Separator />

				<div class="flex flex-col gap-1">
					<h2 class="text-lg font-semibold text-muted-foreground">Provider</h2>
					<SidebarButton path="/settings/provider/openai">OpenAI</SidebarButton>
					<SidebarButton path="/settings/provider/mistral">Mistral</SidebarButton>
					<SidebarButton path="/settings/provider/groq">Groq</SidebarButton>
				</div>

				<Separator />

				<div class="flex flex-col gap-1">
					<h2 class="text-lg font-semibold text-muted-foreground">Chat</h2>
					<SidebarButton path="/settings/chat/general">General</SidebarButton>
					<SidebarButton path="/settings/chat/lds">Live Data Sources</SidebarButton>
				</div>

				<Separator />

				<div class="flex flex-col gap-1">
					<h2 class="text-lg font-semibold text-muted-foreground">Data</h2>

					<SidebarButton path="/settings/data">Export Data</SidebarButton>
				</div>
			</div>

			<SidebarButton path="/logout">
				<LogOut />
				Logout
			</SidebarButton>
		</div>
	</CollapsibleSidebar>
	<div
		class="col-span-1 h-full max-h-full min-h-0 overflow-y-auto p-4 px-8 md:col-span-2 lg:col-span-3"
	>
		<slot />
	</div>
</div>
