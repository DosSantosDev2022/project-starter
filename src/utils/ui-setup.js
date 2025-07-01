// utils/ui-setup.js
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
/**
 * Configura a Shadcn UI em um projeto Next.js.
 * @param {string} projectPath - O caminho absoluto para o diretório do projeto.
 */
export function setupShadcnUI(projectPath) {
  console.log('Configurando Shadcn UI...');

  try {
    // 1. Inicializa a Shadcn UI
    console.log('Executando npx shadcn-ui@latest init...');
    // A flag --yes aceita os defaults, ou você pode remover para o usuário configurar
    execSync('npx shadcn-ui@latest init --yes', { stdio: 'inherit', cwd: projectPath });
    console.log('Shadcn UI inicializada com sucesso.');

    // 2. Adiciona um componente de exemplo (opcional, mas bom para testar)
    // Para simplificar, não vamos adicionar um componente automaticamente aqui.
    // O usuário pode adicionar os componentes depois usando 'npx shadcn-ui add <componente>'

    console.log('Shadcn UI configurada. Para adicionar componentes, use: npx shadcn-ui add <componente>');

  } catch (error) {
    console.error(`Erro ao configurar Shadcn UI: ${error.message}`);
    // Opcional: relançar o erro ou lidar com ele de outra forma
    throw new Error(`Falha ao configurar Shadcn UI: ${error.message}`);
  }
}

/**
 * Funções wrapper para configurar diferentes bibliotecas de UI.
 * @param {string} uiLibrary - A biblioteca de UI selecionada (ex: 'shadcn').
 * @param {string} projectPath - O caminho absoluto para o diretório do projeto.
 * @param {string} projectType - O tipo de projeto (ex: 'Next.js', 'Vite').
 */
export function setupUiLibrary(uiLibrary, projectPath, projectType) {
  switch (uiLibrary) {
    case 'shadcn':
      // A Shadcn UI é mais focada em Next.js. Se for Vite, precisaria de uma lógica diferente.
      if (projectType === 'Next.js') {
        setupShadcnUI(projectPath);
      } else {
        console.warn('A Shadcn UI é otimizada para Next.js. Sua instalação pode não funcionar como esperado em projetos Vite.');
        // Considerar adicionar lógica para Vite ou simplesmente avisar/ignorar.
      }
      break;
    // Adicionar casos para outras bibliotecas de UI aqui
    // case 'material-ui':
    //   setupMaterialUI(projectPath);
    //   break;
    default:
      console.warn(`Biblioteca de UI '${uiLibrary}' não reconhecida ou não suportada.`);
  }
}