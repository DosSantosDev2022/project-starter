const { execSync } = require('child_process');

async function installDependencies(projectPath, getQuestionsFn, dependencyType) {
  const { selectedLibraries, selectedDevTools, installTests } = await getQuestionsFn();
  let librariesToInstall = [];
  let installMessage = '';

  if (getQuestionsFn.name === 'getLibraryQuestions' && selectedLibraries.length > 0) {
    librariesToInstall = selectedLibraries;
    installMessage = 'Instalando bibliotecas selecionadas...';
  } else if (getQuestionsFn.name === 'getDevToolsQuestions' && selectedDevTools.length > 0) {
    librariesToInstall = selectedDevTools;
    installMessage = 'Instalando ferramentas de desenvolvimento...';
  } else if (getQuestionsFn.name === 'getTestQuestions' && installTests) {
    librariesToInstall = [
      '@testing-library/dom',
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      'vitest',
    ];
    installMessage = 'Instalando bibliotecas de teste...';
  } else {
    console.log(`Nenhuma ${dependencyType.replace('dependencies', 'biblioteca ou ferramenta')} selecionada para instalação.`);
    return;
  }

  if (librariesToInstall.length > 0) {
    console.log(installMessage);
    const installCommand = dependencyType === 'devDependencies'
      ? `pnpm install --save-dev ${librariesToInstall.join(' ')}`
      : `pnpm install ${librariesToInstall.join(' ')}`;
    execSync(installCommand, {
      stdio: 'inherit',
      cwd: projectPath,
    });
  }
}

module.exports = {
  installDependencies,
};