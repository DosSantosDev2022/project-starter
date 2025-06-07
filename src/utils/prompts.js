const prompts = require('prompts');
const inquirer = require('inquirer'); // Use require para inquirer também

async function getInitialQuestions() {
  return inquirer.prompt([
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
      validate: (input) =>
        input.trim() ? true : 'O nome do projeto não pode estar vazio.',
    },
  ]);
}

async function getPrismaQuestion() {
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'usePrisma',
      message: 'Deseja instalar e configurar o Prisma?',
      default: false,
    },
  ]);
}

async function getNextAuthQuestion(projectType) {
  if (projectType !== 'Next.js') {
    return { useNextAuth: false }; // NextAuth é específico para Next.js
  }
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'useNextAuth',
      message: 'Deseja configurar autenticação com NextAuth?',
      default: false,
    },
  ]);
}

async function getLibraryQuestions() {
  return prompts({
    type: 'multiselect',
    name: 'selectedLibraries',
    message: 'Quais bibliotecas você deseja instalar?',
    choices: [
      { title: 'React Hook Form', value: 'react-hook-form' },
      { title: 'Zod', value: 'zod' },
      { title: '@hookform/resolvers', value: '@hookform/resolvers' },
      { title: 'Zustand', value: 'zustand' },
      { title: 'uuid', value: 'uuid' },
      { title: 'date-fns', value: 'date-fns' },
      { title: 'Framer Motion', value: 'framer-motion' },
      { title: 'Tailwind Merge', value: 'tailwind-merge' },
      { title: 'Tailwind Scrollbar', value: 'tailwind-scrollbar' },
      { title: 'bcryptjs', value: 'bcryptjs' },
      { title: 'react-icons', value: 'react-icons' },
    ],
    hint: '- Espaço para selecionar. Enter para confirmar',
  });
}

async function getDevToolsQuestions() {
  return prompts({
    type: 'multiselect',
    name: 'selectedDevTools',
    message: 'Quais ferramentas de desenvolvimento você deseja instalar?',
    choices: [
      { title: 'Biome', value: '@biomejs/biome' },
      { title: 'Husky', value: 'husky' },
      { title: 'Lint-staged', value: 'lint-staged' },
      { title: 'Commitlint', value: 'commitlint' },
      {
        title: '@commitlint/config-conventional',
        value: '@commitlint/config-conventional',
      },
    ],
    hint: '- Espaço para selecionar. Enter para confirmar',
  });
}

async function getTestQuestions() {
  return prompts({
    type: 'confirm',
    name: 'installTests',
    message: 'Deseja instalar bibliotecas de testes (Vitest + Testing Library)?',
    initial: true,
  });
}

module.exports = {
  getInitialQuestions,
  getPrismaQuestion,
  getNextAuthQuestion,
  getLibraryQuestions,
  getDevToolsQuestions,
  getTestQuestions,
};