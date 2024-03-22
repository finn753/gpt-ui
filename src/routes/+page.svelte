<script lang="ts">
	import Auth from 'supabase-ui-svelte'

	export let data
	let supabaseClient = data.supabase
	$: supabaseClient = data.supabase
</script>

<Auth {supabaseClient}/>