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
				"@regex-studio/regex-core": path.resolve(
					__dirname,
					"../../packages/regex-core/src/index.ts",
				),
				"@regex-studio/regex-parser": path.resolve(
					__dirname,
					"../../packages/regex-parser/src/index.ts",
				),
				"@regex-studio/regex-compiler": path.resolve(
					__dirname,
					"../../packages/regex-compiler/src/index.ts",
				),
				"@regex-studio/regex-debugger": path.resolve(
					__dirname,
					"../../packages/regex-debugger/src/index.ts",
				),
				"@regex-studio/regex-analyzer": path.resolve(
					__dirname,
					"../../packages/regex-analyzer/src/index.ts",
				),
				"@regex-studio/regex-exporters": path.resolve(
					__dirname,
					"../../packages/regex-exporters/src/index.ts",
				),
				"@regex-studio/templates": path.resolve(
					__dirname,
					"../../packages/templates/src/index.ts",
				),
				"@regex-studio/storage": path.resolve(
					__dirname,
					"../../packages/storage/src/index.ts",
				),
				"@regex-studio/stores": path.resolve(
					__dirname,
					"../../packages/stores/src/index.ts",
				),
				"@regex-studio/ui": path.resolve(
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
