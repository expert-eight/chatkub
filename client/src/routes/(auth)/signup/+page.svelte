<script lang="ts">
    import { goto } from "$app/navigation";
    import { Loader2 } from "lucide-svelte";
    import { authService } from "$lib/services/authService";
    import authStore from "$lib/stores/authStore";
    import { onMount } from "svelte";
    import { RECAPTCHA_SITEKEY } from "$lib/config";
    
    let username = "";
    let email = "";
    let phone = "";
    let password = "";
    let confirmPassword = "";
    let token = ""; // reCAPTCHA token
    
    // Redirect if already logged in
    onMount(() => {
      if ($authStore.user) {
        goto('/');
      }
  
      // Initialize reCAPTCHA
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITEKEY, { action: 'register' })
          .then((t: string) => {
            token = t;
          });
      });
    });
    
    async function handleRegister() {
      if (!username || !email || !phone || !password || !confirmPassword) {
        return;
      }
  
      // Get fresh reCAPTCHA token
      token = await window.grecaptcha.execute(RECAPTCHA_SITEKEY, { action: 'register' });
      
      const success = await authService.register({
        username,
        email,
        phone,
        password,
        confirmPassword,
        token
      });
      
      if (success) {
        goto('/');
      }
    }
  </script>
  
  <svelte:head>
    <script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITEKEY}`}></script>
  </svelte:head>
  
  <div class="min-h-screen bg-[#0D0A08] flex flex-col justify-center items-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <h1 class="text-[#FF9447] font-bold text-4xl mb-2">SpeTopup</h1>
        <p class="text-white/70">สมัครสมาชิกเพื่อใช้งาน</p>
      </div>
      
      <!-- Registration Form -->
      <div class="bg-gradient-to-r from-[#171310] to-[#2A211A] rounded-xl p-6 shadow-lg shadow-black/20 mb-6">
        <h2 class="text-white text-xl font-bold mb-6">สมัครสมาชิก</h2>
        
        <form class="space-y-4" on:submit|preventDefault={handleRegister}>
          <div>
            <label for="username" class="block text-white/80 text-sm font-medium mb-2">ชื่อผู้ใช้</label>
            <input 
              type="text" 
              id="username" 
              bind:value={username}
              class="w-full bg-[#0D0A08] text-white border border-[#3A3A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FF9447]/50 focus:border-transparent"
              placeholder="ชื่อผู้ใช้"
              disabled={$authStore.loading}
              required
            >
          </div>
          
          <div>
            <label for="email" class="block text-white/80 text-sm font-medium mb-2">อีเมล</label>
            <input 
              type="email" 
              id="email" 
              bind:value={email}
              class="w-full bg-[#0D0A08] text-white border border-[#3A3A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FF9447]/50 focus:border-transparent"
              placeholder="อีเมล"
              disabled={$authStore.loading}
              required
            >
          </div>
          
          <div>
            <label for="phone" class="block text-white/80 text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
            <input 
              type="tel" 
              id="phone" 
              bind:value={phone}
              class="w-full bg-[#0D0A08] text-white border border-[#3A3A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FF9447]/50 focus:border-transparent"
              placeholder="เบอร์โทรศัพท์"
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
          
          <div>
            <label for="confirmPassword" class="block text-white/80 text-sm font-medium mb-2">ยืนยันรหัสผ่าน</label>
            <input 
              type="password" 
              id="confirmPassword" 
              bind:value={confirmPassword}
              class="w-full bg-[#0D0A08] text-white border border-[#3A3A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FF9447]/50 focus:border-transparent"
              placeholder="ยืนยันรหัสผ่าน"
              disabled={$authStore.loading}
              required
            >
          </div>
          
          <div>
            <button 
              type="submit" 
              class="w-full bg-[#FF9447] hover:bg-[#FF9447]/90 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center"
              disabled={!username || !email || !phone || !password || !confirmPassword || $authStore.loading}
            >
              {#if $authStore.loading}
                <Loader2 class="w-5 h-5 mr-2 animate-spin" />
                กำลังสมัครสมาชิก...
              {:else}
                สมัครสมาชิก
              {/if}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Login Link -->
      <div class="text-center">
        <p class="text-white/70">
          มีบัญชีอยู่แล้ว? 
          <a href="/signin" class="text-[#FF9447] hover:underline">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
    </div>
  </div>