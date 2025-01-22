#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const inquirer = (await import('inquirer')).default;

  console.log('Bem-vindo ao Project Starter!');

  // Perguntas iniciais
  const initialQuestions = [
    {
      type: 'list',
      name: 'projectType',
      message: 'Qual tipo de projeto você deseja criar?',
      choices: ['Next.js', 'Vite.js'],
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Qual será o nome do projeto?',
      validate: (input) => input.trim() ? true : 'O nome do projeto não pode estar vazio.',
    },
  ];

  const { projectType, projectName } = await inquirer.prompt(initialQuestions);

  // Comando para criar o projeto inicial
  try {
    if (projectType === 'Next.js') {
      console.log('Criando um projeto Next.js...');
      execSync(`npx create-next-app@latest --use-pnpm ${projectName} --ts`, { stdio: 'inherit' });

      console.log('Criando estrutura de pastas...');
      const srcPath = path.join(process.cwd(), projectName, 'src');
      const appPath = path.join(srcPath, 'app');

      const folders = [
        '@types',
        'assets/fonts',
        'assets/images',
        'hooks',
        'lib',
        'utils',
        'components/UI',
        'components/global',
        'components/pages',
        'components/layout',
        'services',
        'store',
        'styles',
        'providers',
        'actions',
        'app/api',
        'app/(pages)'
      ];

      folders.forEach((folder) => {
        const fullPath = path.join(srcPath, folder);
        fs.mkdirSync(fullPath, { recursive: true });
      });

      // Movendo o arquivo global.css para styles
      const stylesPath = path.join(srcPath, 'styles');
      const globalCSSPath = path.join(process.cwd(), projectName, 'src/app/', 'globals.css');
      fs.renameSync(globalCSSPath, path.join(stylesPath, 'globals.css'));

      // Garante que a pasta src/styles existe antes de mover o arquivo
      if (!fs.existsSync(stylesPath)) {
        fs.mkdirSync(stylesPath, { recursive: true });
      }

      if (fs.existsSync(globalCSSPath)) {
        fs.renameSync(globalCSSPath, newGlobalCSSPath);
      } else {
        console.warn(`Aviso: O arquivo ${globalCSSPath} não foi encontrado.`);
      }

      // Limpando a pasta public
      const publicPath = path.join(process.cwd(), projectName, 'public');
      fs.readdirSync(publicPath).forEach((file) => {
        fs.unlinkSync(path.join(publicPath, file));
      });
    } else if (projectType === 'Vite.js') {
      console.log('Criando um projeto Vite.js...');
      execSync(`pnpm create vite ${projectName} --template react-ts`, { stdio: 'inherit' });

      console.log('Instalando dependências iniciais...');
      const projectPath = path.join(process.cwd(), projectName);
      execSync(`cd ${projectName} && pnpm install`, { stdio: 'inherit' });

      console.log('Criando estrutura de pastas...');
      const srcPath = path.join(projectPath, 'src');
      const folders = [
        'assets/fonts',
        'assets/images',
        'hooks',
        'lib',
        'utils',
        'components/UI',
        'components/global',
        'components/pages',
        'components/layout',
        'services',
        'store',
        'providers',
        'pages',
      ];

      folders.forEach((folder) => {
        const fullPath = path.join(srcPath, folder);
        fs.mkdirSync(fullPath, { recursive: true });
      });

      // Limpando arquivos desnecessários
      const publicPath = path.join(projectPath, 'public');
      fs.readdirSync(publicPath).forEach((file) => {
        fs.unlinkSync(path.join(publicPath, file));
      });

      const filesToRemove = ['App.css', 'index.css'];
      filesToRemove.forEach((file) => {
        const filePath = path.join(srcPath, file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    // Perguntar quais dependências instalar
    console.log('Selecione as bibliotecas que deseja instalar:');
    const dependencies = [
      'React Icons',
      'React hook form',
      'hookform/resolvers',
      'zod',
      'zustand',
      'uuid',
      'tailwind-merge',
      'tailwind-scrollbar',
      'date-fns',
      'framer-motion',
      'lib-scss (apenas para Vite.js)',
    ];

    const { selectedDependencies } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedDependencies',
        message: 'Selecione as bibliotecas desejadas:',
        choices: dependencies,
      },
    ]);

    console.log('Instalando dependências selecionadas...');
    const installCommands = selectedDependencies.map((dep) => {
      if (dep === 'lib-scss (apenas para Vite.js)') return 'npx lib-scss';
      return `pnpm install ${dep.toLowerCase().replace(/\s/g, '-')}`;
    });

    installCommands.forEach((cmd) => {
      execSync(cmd, { stdio: 'inherit', cwd: path.join(process.cwd(), projectName) });
    });

    console.log('Projeto criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar o projeto:', error.message);
  }
})();
