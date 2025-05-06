#!/usr/bin/env node
const prompts = require("prompts");
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

	// Pergunta opcional: Prisma
	const prismaQuestion = [
		{
			type: "confirm",
			name: "usePrisma",
			message: "Deseja instalar e configurar o Prisma?",
			default: false,
		},
	];

	const { usePrisma } = await inquirer.prompt(prismaQuestion);

	const nextAuthQuestion = [
		{
			type: "confirm",
			name: "useNextAuth",
			message: "Deseja configurar autenticação com NextAuth?",
			default: false,
		},
	];

	const { useNextAuth } = await inquirer.prompt(nextAuthQuestion);

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
			execSync(`cd ${projectName} && pnpm install, { stdio: "inherit" }`);

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

		const installLibraries = async () => {
			console.log("📦 Selecionando bibliotecas a serem instaladas...");

			const { selectedLibraries } = await prompts({
				type: "multiselect",
				name: "selectedLibraries",
				message: "Quais bibliotecas você deseja instalar?",
				choices: [
					{ title: "React Hook Form", value: "react-hook-form" },
					{ title: "Zod", value: "zod" },
					{ title: "@hookform/resolvers", value: "@hookform/resolvers" },
					{ title: "Zustand", value: "zustand" },
					{ title: "uuid", value: "uuid" },
					{ title: "date-fns", value: "date-fns" },
					{ title: "Framer Motion", value: "framer-motion" },
					{ title: "Tailwind Merge", value: "tailwind-merge" },
					{ title: "Tailwind Scrollbar", value: "tailwind-scrollbar" },
					{ title: "bcryptjs", value: "bcryptjs" },
					{ title: "react-icons", value: "react-icons" },
				],
				hint: "- Espaço para selecionar. Enter para confirmar",
			});

			if (selectedLibraries.length > 0) {
				console.log("Instalando bibliotecas selecionadas...");
				execSync(`pnpm install ${selectedLibraries.join(" ")}`, {
					stdio: "inherit",
					cwd: projectPath,
				});
			} else {
				console.log("Nenhuma biblioteca selecionada para instalação.");
			}
		};

		const installDevTools = async () => {
			const { selectedDevTools } = await prompts({
				type: "multiselect",
				name: "selectedDevTools",
				message: "Quais ferramentas de desenvolvimento você deseja instalar?",
				choices: [
					{ title: "Biome", value: "@biomejs/biome" },
					{ title: "Husky", value: "husky" },
					{ title: "Lint-staged", value: "lint-staged" },
					{ title: "Commitlint", value: "commitlint" },
					{
						title: "@commitlint/config-conventional",
						value: "@commitlint/config-conventional",
					},
				],
				hint: "- Espaço para selecionar. Enter para confirmar",
			});

			if (selectedDevTools.length > 0) {
				console.log("Instalando ferramentas de desenvolvimento...");
				execSync(`pnpm install --save-dev ${selectedDevTools.join(" ")}`, {
					stdio: "inherit",
					cwd: projectPath,
				});
			} else {
				console.log("Nenhuma ferramenta de desenvolvimento selecionada.");
			}
		};

		const installTestingLibraries = async () => {
			const { installTests } = await prompts({
				type: "confirm",
				name: "installTests",
				message:
					"Deseja instalar bibliotecas de testes (Vitest + Testing Library)?",
				initial: true,
			});

			if (installTests) {
				const testingLibraries = [
					"@testing-library/dom",
					"@testing-library/jest-dom",
					"@testing-library/react",
					"@testing-library/user-event",
					"vitest",
				];
				console.log("Instalando bibliotecas de teste...");
				execSync(`pnpm install --save-dev ${testingLibraries.join(" ")}`, {
					stdio: "inherit",
					cwd: projectPath,
				});
			} else {
				console.log("Instalação de bibliotecas de teste ignorada.");
			}
		};

		await installLibraries();
		await installDevTools();
		await installTestingLibraries();

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

			// Função para configurar scripts do Biome e lint-staged no package.json

			console.log("Arquivo biome.json configurado com sucesso! 🚀.");
		};
		configureBiome();

		const configurePackageJson = () => {
			console.log(
				"Configurando scripts do Biome e lint-staged no package.json...",
			);

			const packageJsonPath = path.join(projectPath, "package.json");
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

			// Adiciona os scripts necessários
			packageJson.scripts = {
				...packageJson.scripts,
				format: "npx @biomejs/biome format --write ./src",
				lint: "npx @biomejs/biome lint ./src",
				"lint-fix": "npx @biomejs/biome lint --write ./src",
				check: "npx @biomejs/biome check --write ./src",
				prepare: "husky",
				test: "vitest",
			};

			// Adiciona a configuração do commitlint
			packageJson.commitlint = {
				extends: ["@commitlint/config-conventional"],
			};

			// Adiciona a configuração do lint-staged
			packageJson["lint-staged"] = {
				"*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": [
					"biome check --write --no-errors-on-unmatched",
					"biome format --write --no-errors-on-unmatched",
					"biome lint --write --no-errors-on-unmatched",
				],
			};

			// Escreve as alterações de volta ao package.json
			fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
			console.log(
				"package.json atualizado com scripts do Biome e lint-staged.",
			);
		};
		configurePackageJson();

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

		// Função para configurar Prisma
		const setupPrisma = () => {
			console.log("Instalando e configurando Prisma...");

			execSync("pnpm install prisma @prisma/client", {
				stdio: "inherit",
				cwd: projectPath,
			});

			execSync("npx prisma init", {
				stdio: "inherit",
				cwd: projectPath,
			});

			const envPath = path.join(projectPath, ".env");
			if (fs.existsSync(envPath)) {
				fs.writeFileSync(
					envPath,
					'DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"\n',
					{ flag: "w" },
				);
				console.log(".env atualizado com DATABASE_URL padrão.");
			}

			const schemaPath = path.join(projectPath, "prisma", "schema.prisma");
			if (fs.existsSync(schemaPath)) {
				const schemaContent = `
							generator client {
							provider = "prisma-client-js"
						}

						datasource db {
							provider = "postgresql"
							url      = env("DATABASE_URL")
						}

						model User {
							id        String   @id @default(uuid())
							name      String
							email     String   @unique
							createdAt DateTime @default(now())
						}
					
					`.trim();
				fs.writeFileSync(schemaPath, schemaContent, { flag: "w" });
				console.log("Modelo base 'User' criado no schema.prisma.");
			}

			// Set up Prisma Client in the lib/prisma.ts file
			const libPath = path.join(projectPath, "src", "lib");
			if (!fs.existsSync(libPath)) {
				fs.mkdirSync(libPath);
			}

			const prismaTSPath = path.join(libPath, "prisma.ts");
			const prismaClientCode = `
			   import { PrismaClient } from '@prisma/client'
					
					const globalForPrisma = global as unknown as { prisma: PrismaClient };

					const db = globalForPrisma.prisma || new PrismaClient()

					if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

					export default db;
			`;
			fs.writeFileSync(prismaTSPath, prismaClientCode);
			console.log("Arquivo lib/prisma.ts configurado com sucesso!");
		};
		// Função para configurar next auth
		const setupNextAuth = () => {
			console.log("Instalando NextAuth.js...");

			execSync("pnpm install next-auth @next-auth/prisma-adapter", {
				stdio: "inherit",
				cwd: projectPath,
			});

			// lib/auth.ts
			const libAuthPath = path.join(projectPath, "src", "lib", "auth.ts");
			const authFileContent = `
			    import { PrismaAdapter } from '@next-auth/prisma-adapter'
				import CredentialsProvider from 'next-auth/providers/credentials'
				import GoogleProvider from 'next-auth/providers/google'

				import { db } from '@/lib/prisma'
				import { compare } from 'bcryptjs'

				import type { AuthOptions } from 'next-auth'
				import type { Adapter } from 'next-auth/adapters'

				export const authOptions: AuthOptions = {
					adapter: PrismaAdapter(db) as Adapter,
					providers: [
						// Login com e-mail e senha
						CredentialsProvider({
							name: 'Credentials',
							credentials: {
								email: { label: 'Email', type: 'email' },
								password: { label: 'Senha', type: 'password' },
							},
							async authorize(credentials) {
								if (!credentials?.email || !credentials?.password) {
									throw new Error('Email e senha são obrigatórios')
								}

								const user = await db.user.findUnique({
									where: { email: credentials.email },
								})

								if (!user || !user.password) {
									throw new Error('Usuário não encontrado')
								}

								// 🚫 Verifica se o e-mail foi verificado
								if (!user.emailVerified) {
									throw new Error('Você precisa verificar seu e-mail antes de fazer login.')
								}

								const isPasswordValid = await compare(
									credentials.password,
									user.password,
								)

								if (!isPasswordValid) {
									throw new Error('Senha incorreta')
								}

								return {
									id: user.id,
									name: user.name,
									email: user.email,
									surname: user.surname as string
								}
							},
						}),

						// Login com Google
						GoogleProvider({
							clientId: process.env.GOOGLE_CLIENT_ID as string,
							clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
						}),
					],
					callbacks: {
						async jwt({ token, user }) {
							// Se for o primeiro login, user estará presente
							if (user) {
								token.id = user.id
								token.surname = user.surname ?? null
							} else if (token?.email) {
								// Se user não estiver presente (JWT sendo reutilizado), buscamos manualmente
								const dbUser = await db.user.findUnique({
									where: { email: token.email as string },
									select: { id: true, surname: true }, // 👈 só os campos que precisamos
								})
					
								if (dbUser) {
									token.id = dbUser.id
									token.surname = dbUser.surname
								}
							}
					
							return token
						},
					
						async session({ session, token }) {
							if (session.user && token) {
								session.user.id = token.id as string
								session.user.surname = token.surname as string
							}
							return session
						},
					},
					secret: process.env.NEXTAUTH_SECRET,
					session: {
						strategy: 'jwt',
					},
				}
			
			`.trim();
			fs.writeFileSync(libAuthPath, authFileContent);
			console.log(
				"Arquivo src/lib/auth.ts criado com configuração básica do NextAuth.",
			);

			// app/api/auth/[...nextauth]/route.ts
			const authRoutePath = path.join(
				projectPath,
				"src",
				"app",
				"api",
				"auth",
				"[...nextauth]",
			);
			fs.mkdirSync(authRoutePath, { recursive: true });

			const authRouteContent = `
				import { authOptions } from '@/lib/auth'
				import NextAuth from 'next-auth'

				const handler = NextAuth(authOptions)

				export { handler as GET, handler as POST }
				`.trim();
			fs.writeFileSync(path.join(authRoutePath, "route.ts"), authRouteContent);
			console.log("Rota src/app/api/auth/[...nextauth]/route.ts criada.");

			// Criação do arquivo .env.local
			const envPath = path.join(projectPath, ".env.local");
			const envContent = `
				# NEXTAUTH ENV VARS
				GOOGLE_CLIENT_ID=your_google_client_id
				GOOGLE_CLIENT_SECRET=your_google_client_secret
				NEXTAUTH_SECRET=your_nextauth_secret
				NEXT_PUBLIC_URL=http://localhost:3000
				
				`.trim();

			fs.writeFileSync(envPath, envContent, { flag: "a" });
			console.log(
				"✅ Arquivo .env.local criado com variáveis de ambiente para o NextAuth.",
			);
		};

		if (usePrisma) {
			setupPrisma();
		}

		if (useNextAuth && projectType === "Next.js") {
			setupNextAuth();
		}

		// Rodar o script de formatação no final
		console.log("Executando pnpm lint...");
		execSync("pnpm lint", { stdio: "inherit", cwd: projectPath });

		// Rodar o script de formatação no final
		console.log("Executando pnpm format...");
		execSync("pnpm format", { stdio: "inherit", cwd: projectPath });

		console.log("Projeto configurado com sucesso! 🚀");
	} catch (error) {
		console.error("Erro ao criar o projeto:", error.message);
	}
})();
