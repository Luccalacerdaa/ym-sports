import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      // Usar nosso Service Worker customizado
      srcDir: 'public',
      filename: 'sw.js',
      strategies: 'injectManifest',
      injectManifest: {
        injectionPoint: undefined
      },
      manifest: {
        name: 'YM Sports - O melhor amigo do jogador',
        short_name: 'YM Sports',
        description: 'Eleve seu desempenho esportivo com treinos inteligentes, calendário de jogos, ranking regional e gamificação.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'icons/logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      // Desabilitar registro automático (vamos registrar manualmente)
      injectRegister: null
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
