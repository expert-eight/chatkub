<script lang="ts">
	import { goto } from '$app/navigation';
	import authStore from '$lib/stores/authStore';
	import { authService } from '$lib/services/authService';
</script>

<div class="min-h-screen bg-[#0D0A08] flex flex-col items-center justify-center p-4">
	<div class="text-center mb-8">
		<h1 class="text-[#FF9447] font-bold text-4xl mb-2">SpeTopup</h1>
		<p class="text-white/70">ระบบเติมเงินเกมออนไลน์</p>
	</div>

	<div class="w-full max-w-md space-y-4">
		{#if $authStore.user}
			<div class="bg-gradient-to-r from-[#171310] to-[#2A211A] rounded-xl p-6 shadow-lg shadow-black/20">
				<div class="text-center">
					<p class="text-white mb-2">ยินดีต้อนรับ</p>
					<p class="text-[#FF9447] font-semibold text-lg mb-4">
						{$authStore.user.Member.full_name || $authStore.user.username}
					</p>
					<button
						on:click={() => authService.logout()}
						class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
					>
						ออกจากระบบ
					</button>
				</div>
			</div>
		{:else}
			<div class="bg-gradient-to-r from-[#171310] to-[#2A211A] rounded-xl p-6 shadow-lg shadow-black/20">
				<div class="text-center space-y-4">
					<button
						on:click={() => goto('/signin')}
						class="w-full bg-[#FF9447] hover:bg-[#FF9447]/90 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300"
					>
						เข้าสู่ระบบ
					</button>
					<button
						on:click={() => goto('/signup')}
						class="w-full bg-transparent border border-[#FF9447] text-[#FF9447] hover:bg-[#FF9447]/10 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
					>
						สมัครสมาชิก
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>