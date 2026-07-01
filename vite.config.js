import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Barcha domainlardan, chuqonon ngrok'dan keladigan so'rovlarga ruxsat beradi
    // Agar ngrok orqali ochganda qotib qolish yoki ulanmaslik muammosi bo'lsa, quyidagini ham qo'shishingiz mumkin:
    host: true,
  }
})