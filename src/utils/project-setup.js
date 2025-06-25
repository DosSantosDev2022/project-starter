import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function createProject(projectType, projectName, projectPath) {
  if (projectType === 'Next.js') {
    console.log('Criando um projeto Next.js...');
    execSync(`npx create-next-app@latest --use-pnpm ${projectName} --ts`, {
      stdio: 'inherit',
    });
  } else if (projectType === 'Vite.js') {
    console.log('Criando um projeto Vite.js...');
    execSync(`pnpm create vite ${projectName} --template react-ts`, {
      stdio: 'inherit',
    });
    // Instalar dependências iniciais para Vite, pois create-vite não faz por padrão
    console.log('Instalando dependências iniciais para Vite...');
    execSync(`cd ${projectName} && pnpm install`, { stdio: 'inherit' });
  }
}

function setupProjectStructure(projectType, projectPath) {
  console.log('Criando estrutura de pastas...');
  const srcPath = path.join(projectPath, 'src');

  let folders = [];
  if (projectType === 'Next.js') {
    folders = [
      '@types',
      'assets/fonts',
      'assets/images',
      'hooks',
      'lib',
      'utils',
      'components/ui',
      'components/global',
      'components/pages',
      'components/layout',
      'services',
      'store',
      'styles',
      'providers',
      'actions',
      'app/api',
      'app/(pages)',
    ];
  } else if (projectType === 'Vite.js') {
    folders = [
      'assets/fonts',
      'assets/images',
      'hooks',
      'lib',
      'utils',
      'components/ui',
      'components/global',
      'components/pages',
      'components/layout',
      'services',
      'store',
      'providers',
      'pages',
    ];
  }

  folders.forEach((folder) =>
    fs.mkdirSync(path.join(srcPath, folder), { recursive: true })
  );

  // Lógica específica do Next.js: mover global.css
  if (projectType === 'Next.js') {
    const globalCSSPath = path.join(srcPath, 'app/globals.css');
    const stylesPath = path.join(srcPath, 'styles');

    if (!fs.existsSync(stylesPath)) {
      fs.mkdirSync(stylesPath, { recursive: true });
    }

    if (fs.existsSync(globalCSSPath)) {
      fs.renameSync(globalCSSPath, path.join(stylesPath, 'globals.css'));
    } else {
      console.warn(`Aviso: O arquivo ${globalCSSPath} não foi encontrado.`);
    }
  } else if (projectType === 'Vite.js') {
    // Limpando arquivos desnecessários no Vite
    const filesToRemove = ["App.css", "index.css"];
    filesToRemove.forEach((file) => {
      const filePath = path.join(srcPath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Removido: ${filePath}`);
      }
    });
  }
}

export {
  createProject,
  setupProjectStructure,
};