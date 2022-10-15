import {build} from "esbuild";

/**
 * Build the library.
 * @param devMode - Dev mode.
 */
function buildLibrary(devMode: boolean = false): void
{
	// Compilation de l'application.
	build({
		entryPoints: ["src/index.ts"],
		outfile: "lib/index.js",
		bundle: true,
		minify: true,
		sourcemap: true,
		format: "esm",
		loader: {
			".ts": "ts",
		},
		watch: devMode ? {
			// Affichage suite à une recompilation.
			onRebuild(error, result) {
				console.log(new Date());
				if (!error && result.errors.length == 0)
					console.log("Successfully built.");
				else
					console.error("Error!");
			}
		} : false,
	})
		// Fonction lancée pour une compilation réussie.
		.then(() => { console.log(new Date()); console.log("Success."); })
		// Fonction lancée pour une compilation échouée.
		.catch((e) => console.error(e.message));
}

// @ts-ignore
buildLibrary(process.argv?.[2] == "dev");
