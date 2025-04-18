import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Puedes especificar el directorio de salida
    sourcemap: false, // Si deseas generar los mapas fuente
    minify: 'terser', // Usar terser para minificar el código
    target: 'esnext', // Definir el objetivo para la compatibilidad de JS
  },
});
