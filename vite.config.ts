import {defineConfig, UserConfig} from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/

export default defineConfig((): UserConfig => {
	return {
		build: {
			outDir: "lib",
			sourcemap: true,
			minify: "esbuild",
			lib: {
				entry: "src/library.ts",
				formats: ["es"],
				fileName: "index",
			},
		},

		plugins: [
			dts({
				insertTypesEntry: true,
				rollupTypes: true,
				exclude: ["node_modules"],
			}),
		],
	};
});
