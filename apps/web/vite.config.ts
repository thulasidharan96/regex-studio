import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
	return {
		base: "./",
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "."),
				"@thulasidharan96/regex-core": path.resolve(
					__dirname,
					"../../packages/regex-core/src/index.ts",
				),
				"@thulasidharan96/regex-parser": path.resolve(
					__dirname,
					"../../packages/regex-parser/src/index.ts",
				),
				"@thulasidharan96/regex-compiler": path.resolve(
					__dirname,
					"../../packages/regex-compiler/src/index.ts",
				),
				"@thulasidharan96/regex-debugger": path.resolve(
					__dirname,
					"../../packages/regex-debugger/src/index.ts",
				),
				"@thulasidharan96/regex-analyzer": path.resolve(
					__dirname,
					"../../packages/regex-analyzer/src/index.ts",
				),
				"@thulasidharan96/regex-exporters": path.resolve(
					__dirname,
					"../../packages/regex-exporters/src/index.ts",
				),
				"@thulasidharan96/templates": path.resolve(
					__dirname,
					"../../packages/templates/src/index.ts",
				),
				"@thulasidharan96/storage": path.resolve(
					__dirname,
					"../../packages/storage/src/index.ts",
				),
				"@thulasidharan96/stores": path.resolve(
					__dirname,
					"../../packages/stores/src/index.ts",
				),
				"@thulasidharan96/ui": path.resolve(
					__dirname,
					"../../packages/ui/src/index.ts",
				),
			},
		},
		server: {
			// HMR is disabled in AI Studio via DISABLE_HMR env var.
			// Do not modifyâfile watching is disabled to prevent flickering during agent edits.
			hmr: process.env.DISABLE_HMR !== "true",
			// Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
			watch: process.env.DISABLE_HMR === "true" ? null : {},
		},
	};
});
