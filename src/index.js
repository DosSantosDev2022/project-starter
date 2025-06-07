#!/usr/bin/env node

const { execSync } = require('child_process');
const { getInitialQuestions, getPrismaQuestion, getNextAuthQuestion, getLibraryQuestions, getDevToolsQuestions, getTestQuestions } = require('./utils/prompts');
const { createProject, setupProjectStructure } = require('./utils/project-setup');
const { installDependencies } = require('./utils/install');
const { configureBiome, configurePackageJson, setupHusky } = require('./utils/configs');
const { setupPrisma, setupNextAuth } = require('./utils/auth-db-setup');


(async () => {
  console.log('Bem-vindo ao Project Starter!');

  try {
    // 1. Coleta de informações iniciais
    const { projectType, projectName } = await getInitialQuestions();
    const { usePrisma } = await getPrismaQuestion();
    const { useNextAuth } = await getNextAuthQuestion(projectType); // Passa projectType se NextAuth só for para Next.js

    const projectPath = path.join(process.cwd(), projectName);

    // 2. Criação e estrutura do projeto
    await createProject(projectType, projectName, projectPath);
    await setupProjectStructure(projectType, projectPath);

    // 3. Instalação de bibliotecas
    await installDependencies(projectPath, getLibraryQuestions, 'dependencies');
    await installDependencies(projectPath, getDevToolsQuestions, 'devDependencies');
    await installDependencies(projectPath, getTestQuestions, 'devDependencies');


    // 4. Configuração de ferramentas
    if (await getDevToolsQuestions().then(res => res.selectedDevTools.includes('@biomejs/biome'))) {
        configureBiome(projectPath);
    }
    configurePackageJson(projectPath);
    
    if (await getDevToolsQuestions().then(res => res.selectedDevTools.includes('husky'))) {
        setupHusky(projectPath);
    }

    // 5. Configuração de Banco de Dados e Autenticação
    if (usePrisma) {
      setupPrisma(projectPath);
    }
    if (useNextAuth && projectType === 'Next.js') {
      setupNextAuth(projectPath);
    }

    // 6. Finalização
    console.log('Executando pnpm lint...');
    execSync('pnpm lint', { stdio: 'inherit', cwd: projectPath });

    console.log('Executando pnpm format...');
    execSync('pnpm format', { stdio: 'inherit', cwd: projectPath });

    console.log('Projeto configurado com sucesso! 🚀');
  } catch (error) {
    console.error('Erro ao criar o projeto:', error.message);
    process.exit(1); // Sai com erro
  }
})();