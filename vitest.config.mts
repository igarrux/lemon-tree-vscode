import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.test.ts'],
		exclude: ['out/**/*', 'node_modules/**/*'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: [
				'src/**/*.test.ts',
				'src/infrastructure/vscode/extension.ts',
				'src/infrastructure/vscode/activate-translation-decorators.ts',
				'src/types/lemon-tree-config.type.ts',
				'src/_util/index.ts'
			],
			reporter: ['text', 'html']
		}
	},
	
});
