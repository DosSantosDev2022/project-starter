#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

(async () => {
	const inquirer = (await import("inquirer")).default;

	console.log("Bem-vindo ao Project Starter!");

	// Perguntas iniciais
	const initialQuestions = [
		{
			type: "list",
			name: "projectType",
			message: "Qual tipo de projeto você deseja criar?",
			choices: ["Next.js", "Vite.js"],
		},
		{
			type: "input",
			name: "projectName",
			message: "Qual será o nome do projeto?",
			validate: (input) =>
				input.trim() ? true : "O nome do projeto não pode estar vazio.",
		},
	];

	const { projectType, projectName } = await inquirer.prompt(initialQuestions);

	try {
		const projectPath = path.join(process.cwd(), projectName);

		if (projectType === "Next.js") {
			console.log("Criando um projeto Next.js...");
			execSync(`npx create-next-app@latest --use-pnpm ${projectName} --ts`, {
				stdio: "inherit",
			});

			console.log("Criando estrutura de pastas...");
			const srcPath = path.join(projectPath, "src");
			const folders = [
				"@types",
				"assets/fonts",
				"assets/images",
				"hooks",
				"lib",
				"utils",
				"components/ui",
				"components/global",
				"components/pages",
				"components/layout",
				"services",
				"store",
				"styles",
				"providers",
				"actions",
				"app/api",
				"app/(pages)",
			];

			folders.forEach((folder) =>
				fs.mkdirSync(path.join(srcPath, folder), { recursive: true }),
			);

			// Movendo o arquivo global.css para styles
			const globalCSSPath = path.join(srcPath, "app/globals.css");
			const stylesPath = path.join(srcPath, "styles");

			if (!fs.existsSync(stylesPath)) {
				fs.mkdirSync(stylesPath, { recursive: true });
			}

			if (fs.existsSync(globalCSSPath)) {
				fs.renameSync(globalCSSPath, path.join(stylesPath, "globals.css"));
			} else {
				console.warn(`Aviso: O arquivo ${globalCSSPath} não foi encontrado.`);
			}
		} else if (projectType === "Vite.js") {
			console.log("Criando um projeto Vite.js...");
			execSync(`pnpm create vite ${projectName} --template react-ts`, {
				stdio: "inherit",
			});

			console.log("Instalando dependências iniciais...");
			execSync(`cd ${projectName} && pnpm install`, { stdio: "inherit" });

			console.log("Criando estrutura de pastas...");
			const srcPath = path.join(projectPath, "src");
			const folders = [
				"assets/fonts",
				"assets/images",
				"hooks",
				"lib",
				"utils",
				"components/ui",
				"components/global",
				"components/pages",
				"components/layout",
				"services",
				"store",
				"providers",
				"pages",
			];

			folders.forEach((folder) =>
				fs.mkdirSync(path.join(srcPath, folder), { recursive: true }),
			);

			// Limpando arquivos desnecessários
			const filesToRemove = ["App.css", "index.css"];
			filesToRemove.forEach((file) => {
				const filePath = path.join(srcPath, file);
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
			});
		}

		// Função para instalar dependências
		const installDependencies = () => {
			console.log("Instalando dependências...");

			const dependencies = [
				"react-icons",
				"react-hook-form",
				"@hookform/resolvers",
				"zod",
				"zustand",
				"uuid",
				"tailwind-merge",
				"tailwind-scrollbar",
				"date-fns",
				"framer-motion",
			];

			const devDependencies = [
				"@biomejs/biome",
				"husky",
				"lint-staged",
				"commitlint",
				"@commitlint/config-conventional",
			];

			execSync(`pnpm install ${dependencies.join(" ")}`, {
				stdio: "inherit",
				cwd: projectPath,
			});
			execSync(`pnpm install --save-dev ${devDependencies.join(" ")}`, {
				stdio: "inherit",
				cwd: projectPath,
			});
		};

		// Função para instalar bibliotecas de teste
		const installTestingLibraries = () => {
			console.log("Instalando bibliotecas de teste...");
			const testingLibraries = [
				"@testing-library/dom",
				"@testing-library/jest-dom",
				"@testing-library/react",
				"@testing-library/user-event",
				"vitest",
			];
			execSync(`pnpm install --save-dev ${testingLibraries.join(" ")}`, {
				stdio: "inherit",
				cwd: projectPath,
			});
		};

		installDependencies();
		installTestingLibraries();
    
		// Função para configurar Biome

		const configureBiome = () => {
			console.log("Configurando Biome Js...");
			execSync("pnpm biome init", { stdio: "inherit", cwd: projectPath });

			const biomeConfig = {
				$schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
				vcs: {
					enabled: false,
					clientKind: "git",
					useIgnoreFile: false,
				},
				files: {
					ignoreUnknown: false,
					ignore: ["node_modules"],
				},
				formatter: {
					enabled: true,
					indentStyle: "tab",
					indentWidth: 2,
					lineWidth: 75,
				},
				organizeImports: {
					enabled: true,
				},
				linter: {
					enabled: true,
					rules: {
						recommended: true,
						a11y: {
							noRedundantRoles: "warn",
							useAltText: "warn",
						},
					},
				},
				javascript: {
					formatter: {
						arrowParentheses: "always",
						bracketSameLine: false,
						bracketSpacing: true,
						quoteStyle: "single",
						jsxQuoteStyle: "single",
						semicolons: "asNeeded",
						quoteProperties: "asNeeded",
					},
				},
			};
			fs.writeFileSync(
				path.join(projectPath, "biome.json"),
				JSON.stringify(biomeConfig, null, 2),
			);
			console.log("Arquivo biome.json configurado com sucesso! 🚀.");
		};
    configureBiome();
    
		// Função para configurar Husky
		const setupHusky = () => {
			console.log("Configurando Husky...");

			execSync("pnpm exec husky init", { stdio: "inherit", cwd: projectPath });

			const preCommitFilePath = path.join(projectPath, ".husky", "pre-commit");
			const commitMsgFilePath = path.join(projectPath, ".husky", "commit-msg");

			if (fs.existsSync(preCommitFilePath)) {
				fs.writeFileSync(preCommitFilePath, "npx lint-staged\n", { flag: "w" });
				console.log('Comando "npx lint-staged" adicionado ao hook pre-commit.');
			} else {
				console.error("Erro: Arquivo pre-commit não encontrado.");
			}

			if (!fs.existsSync(commitMsgFilePath)) {
				fs.writeFileSync(
					commitMsgFilePath,
					"npx --no-install commitlint --edit $1\n",
				);
				console.log('Arquivo "commit-msg" criado.');
			}
		};
		setupHusky();

		console.log("Projeto configurado com sucesso! 🚀");
	} catch (error) {
		console.error("Erro ao criar o projeto:", error.message);
	}
})();
