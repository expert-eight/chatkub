import type { LayoutLoad } from './$types';
import { auth } from '$lib/stores/authStore';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ data }) => {
    if (data.user && data.token) {
        auth.setAuth(data.user, data.token);
        
        // Save to localStorage in browser
        if (browser) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
    }
    
    return {
        user: data.user
    };
};
