import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src'],
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyAppUI',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      // не бандлим react в библиотеку
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // вставит "use client"; в начало собранного файла
        banner: '"use client";',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },

  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },

  resolve: {
    alias: {
      // если нужно — измените или удалите
      '@': resolve(__dirname, 'src'),
    },
  },
})
