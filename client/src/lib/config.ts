import { env } from "$env/dynamic/public";

export const API_URL = env.PUBLIC_API_URL || 'http://localhost:5000';
export const RECAPTCHA_SITEKEY = env.PUBLIC_RECAPTCHA_SITEKEY || '6LcPG4ApAAAAAKKhH_DJLbZZEGD_TQwLLOQONqpL';