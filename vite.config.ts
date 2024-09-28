import {ConfigEnv, defineConfig, UserConfig} from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	return ({
		build: {
			outDir: "lib",
			sourcemap: true,
			minify: "esbuild",
			lib: {
				entry: "src/index.ts",
				formats: ["es"],
				fileName: "index",
			},
			rollupOptions: {
				external: ["reflect-metadata"],
			},
		},

		plugins: [
			dts({
				insertTypesEntry: true,
				rollupTypes: true,
				exclude: ["node_modules"],
			}),
		]
	});
});
