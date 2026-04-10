import { defineConfig } from 'vitest/config';
import { builtinModules } from 'node:module';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: 'index',
        },
        rollupOptions: {
            external: [
                ...builtinModules,
                ...builtinModules.map((m) => `node:${m}`),
            ],
        },
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        target: 'node20',
        minify: false,
    },
    plugins: [
        dts({ rollupTypes: true }),
    ],
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            include: ['src'],
        },
    },
});
