import { defineConfig } from 'vite'
import baseConfig from './vite.config'

// Production-specific optimizations
export default defineConfig({
  ...baseConfig,
  mode: 'production',
  build: {
    ...baseConfig.build,
    
    // More aggressive minification for production
    minify: 'esbuild',
    
    // Disable source maps for production (optional)
    sourcemap: false,
    
    // More aggressive tree shaking
    rollupOptions: {
      ...baseConfig.build?.rollupOptions,
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false
      },
      
      output: {
        ...baseConfig.build?.rollupOptions?.output,
        
        // More aggressive chunk splitting for production
        manualChunks: {
          // Core React libraries
          'react-core': ['react', 'react-dom'],
          
          // Router and navigation
          'router': ['@tanstack/react-router'],
          
          // UI component libraries
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle'
          ],
          
          // Icons and visual components
          'ui-visual': ['lucide-react', 'next-themes'],
          
          // Form handling
          'forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Drag and drop
          'dnd': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities'
          ],
          
          // Data management
          'data': [
            'dexie',
            'zustand',
            '@tanstack/react-virtual'
          ],
          
          // Utilities and helpers
          'utils': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'date-fns',
            'cmdk',
            'sonner',
            'vaul'
          ],
          
          // Development tools (only in development)
          ...(process.env.NODE_ENV === 'development' && {
            'devtools': [
              '@tanstack/react-devtools',
              '@tanstack/react-router-devtools'
            ]
          })
        }
      }
    }
  },
  
  // Production-specific optimizations
  esbuild: {
    // Remove console.log in production
    drop: ['console', 'debugger'],
    
    // Optimize for modern browsers
    target: 'es2020'
  }
})