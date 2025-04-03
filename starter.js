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
        "providers",
        "actions",
        "app/api",
        "app/(pages)",
      ];

      folders.forEach((folder) =>
        fs.mkdirSync(path.join(srcPath, folder), { recursive: true })
      );

    } else if (projectType === "Vite.js") {
      console.log("Criando um projeto Vite.js...");
      execSync(`pnpm create vite ${projectName} --template react-ts`, {
        stdio: "inherit",
      });

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
        fs.mkdirSync(path.join(srcPath, folder), { recursive: true })
      );

      // Limpando arquivos desnecessários
      const filesToRemove = ["App.css", "index.css"];
      filesToRemove.forEach((file) => {
        const filePath = path.join(srcPath, file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    // Perguntar quais dependências instalar
    const dependenciesChoices = [
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

    const { selectedDependencies } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedDependencies",
        message: "Selecione as dependências que deseja instalar:",
        choices: dependenciesChoices,
      },
    ]);

    // Perguntar quais dependências de desenvolvimento instalar
    const devDependenciesChoices = [
      "@biomejs/biome",
      "husky",
      "lint-staged",
      "commitlint",
      "@commitlint/config-conventional",
      "@testing-library/dom",
      "@testing-library/jest-dom",
      "@testing-library/react",
      "@testing-library/user-event",
      "vitest",
    ];

    const { selectedDevDependencies } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedDevDependencies",
        message: "Selecione as dependências de desenvolvimento que deseja instalar:",
        choices: devDependenciesChoices,
      },
    ]);

    // Instalar dependências selecionadas
    if (selectedDependencies.length > 0) {
      console.log("Instalando dependências...");
      execSync(`cd ${projectName} && pnpm install ${selectedDependencies.join(" ")}`, {
        stdio: "inherit",
      });
    }

    // Instalar dependências de desenvolvimento selecionadas
    if (selectedDevDependencies.length > 0) {
      console.log("Instalando dependências de desenvolvimento...");
      execSync(`cd ${projectName} && pnpm install --save-dev ${selectedDevDependencies.join(" ")}`, {
        stdio: "inherit",
      });
    }

    // Função para configurar Biome
    const configureBiome = () => {
      if (selectedDevDependencies.includes("@biomejs/biome")) {
        console.log("Configurando Biome Js...");
        execSync("cd " + projectName + " && pnpm biome init", { stdio: "inherit" });

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
          JSON.stringify(biomeConfig, null, 2)
        );
        console.log("Arquivo biome.json configurado com sucesso! 🚀.");
      }
    };
    configureBiome();

    // Função para configurar Husky
    const setupHusky = () => {
      if (selectedDevDependencies.includes("husky")) {
        console.log("Configurando Husky...");

        execSync("cd " + projectName + " && pnpm exec husky init", { stdio: "inherit" });

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
            "npx --no-install commitlint --edit $1\n"
          );
          console.log('Arquivo "commit-msg" criado.');
        }
      }
    };
    setupHusky();

    console.log("Projeto configurado com sucesso! 🚀");
  } catch (error) {
    console.error("Erro ao criar o projeto:", error.message);
  }
})();