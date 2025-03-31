<script>
    import { goto } from "$app/navigation";
    import { Facebook, Mail, Loader2 } from "lucide-svelte";
    import { authService } from "$lib/services/authService";
    import authStore from "$lib/stores/authStore";
    import { onMount } from "svelte";
    
    let username = "";
    let password = "";
    let rememberMe = false;
    
    // Redirect if already logged in
    onMount(() => {
        if ($authStore.user) {
            goto('/');
        }
    });
    
    async function handleLogin() {
        if (!username || !password) {
            return;
        }
        
        const success = await authService.login(username, password);
        if (success) {
            goto('/');
        }
    }
</script>

<div class="min-h-screen bg-[#0D0A08] flex flex-col justify-center items-center px-4 py-12">
    <div class="w-full max-w-md">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
            <h1 class="text-[#FF9447] font-bold text-4xl mb-2">SpeTopup</h1>
            <p class="text-white/70">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>
        
        <!-- Login Form -->
        <div class="bg-gradient-to-r from-[#171310] to-[#2A211A] rounded-xl p-6 shadow-lg shadow-black/20 mb-6">
            <h2 class="text-white text-xl font-bold mb-6">เข้าสู่ระบบ</h2>
            
            <form class="space-y-4" on:submit|preventDefault={handleLogin}>
                <div>
                    <label for="username" class="block text-white/80 text-sm font-medium mb-2">ชื่อผู้ใช้</label>
                    <input 
                        type="text" 
                        id="username" 
                        bind:value={username}
                        class="w-full bg-[#0D0A08] text-white border border-[#3A3A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FF9447]/50 focus:border-transparent"
                        placeholder="ชื่อผู้ใช้หรืออีเมล"
                        disabled={$authStore.loading}
                        required
                    >
                </div>
                
                <div>
                    <label for="password" class="block text-white/80 text-sm font-medium mb-2">รหัสผ่าน</label>
                    <input 
                        type="password" 
                        id="password" 
                        bind:value={password}
                        class="w-full bg-[#0D0A08] text-white border border-[#3A3A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FF9447]/50 focus:border-transparent"
                        placeholder="รหัสผ่าน"
                        disabled={$authStore.loading}
                        required
                    >
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input 
                            id="remember-me" 
                            type="checkbox" 
                            bind:checked={rememberMe}
                            class="h-4 w-4 text-[#FF9447] focus:ring-[#FF9447] border-gray-600 rounded"
                            disabled={$authStore.loading}
                        >
                        <label for="remember-me" class="ml-2 block text-sm text-white/70">
                            จดจำฉัน
                        </label>
                    </div>
                    
                    <div class="text-sm">
                        <a href="#" class="text-[#FF9447] hover:underline">
                            ลืมรหัสผ่าน?
                        </a>
                    </div>
                </div>
                
                <div>
                    <button 
                        type="submit" 
                        class="w-full bg-[#FF9447] hover:bg-[#FF9447]/90 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center"
                        disabled={!username || !password || $authStore.loading}
                    >
                        {#if $authStore.loading}
                            <Loader2 class="w-5 h-5 mr-2 animate-spin" />
                            กำลังเข้าสู่ระบบ...
                        {:else}
                            เข้าสู่ระบบ
                        {/if}
                    </button>
                </div>
            </form>
            
            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-[#3A3A3A]"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-gradient-to-r from-[#171310] to-[#2A211A] text-white/60">หรือเข้าสู่ระบบด้วย</span>
                    </div>
                </div>
                
                <div class="mt-6 grid grid-cols-4 gap-3">
                    <button class="flex justify-center items-center py-2 px-4 border border-[#3A3A3A] rounded-lg hover:bg-[#1877F2]/10 transition-all duration-300">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </button>
                    
                    <button class="flex justify-center items-center py-2 px-4 border border-[#3A3A3A] rounded-lg hover:bg-[#EA4335]/10 transition-all duration-300">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    </button>
                    
                    <button class="flex justify-center items-center py-2 px-4 border border-[#3A3A3A] rounded-lg hover:bg-[#00B900]/10 transition-all duration-300">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#00B900">
                            <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.843 2.572-5.992zm-18.988-2.595c.129 0 .234.105.234.234v4.153h2.287c.129 0 .233.104.233.233v.842c0 .129-.104.234-.233.234h-3.363c-.063 0-.119-.025-.161-.065l-.001-.001-.002-.002-.001-.001-.003-.003c-.04-.042-.065-.099-.065-.161v-5.229c0-.129.104-.234.234-.234h.841zm14.992 0c.129 0 .233.105.233.234v.842c0 .129-.104.234-.233.234h-2.287v.883h2.287c.129 0 .233.105.233.234v.842c0 .129-.104.234-.233.234h-2.287v.884h2.287c.129 0 .233.105.233.234v.842c0 .129-.104.234-.233.234h-3.363c-.063 0-.12-.025-.162-.065l-.003-.004-.003-.003c-.04-.042-.066-.099-.066-.161v-5.229c0-.062.025-.119.065-.161l.004-.004.003-.003c.042-.04.099-.066.162-.066h3.363zm-10.026.001c.129 0 .234.104.234.233v5.229c0 .128-.105.233-.234.233h-.84c-.129 0-.234-.105-.234-.233v-5.229c0-.129.105-.233.234-.233h.84zm2.075 0c.129 0 .234.104.234.233v5.229c0 .128-.105.233-.234.233h-.841c-.129 0-.233-.105-.233-.233v-5.229c0-.129.104-.233.233-.233h.841z"/>
                        </svg>
                    </button>
                    
                    <button class="flex justify-center items-center py-2 px-4 border border-[#3A3A3A] rounded-lg hover:bg-[#5865F2]/10 transition-all duration-300">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Register Link -->
        <div class="text-center">
            <p class="text-white/70">
                ยังไม่มีบัญชี? 
                <a href="/register" class="text-[#FF9447] hover:underline">
                    สมัครสมาชิก
                </a>
            </p>
        </div>
    </div>
</div>