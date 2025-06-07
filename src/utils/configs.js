const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function configureBiome(projectPath) {
  console.log('Configurando Biome Js...');
  execSync('pnpm biome init', { stdio: 'inherit', cwd: projectPath });

  const biomeConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    vcs: {
      enabled: false,
      clientKind: 'git',
      useIgnoreFile: false,
    },
    files: {
      ignoreUnknown: false,
      ignore: ['node_modules', 'dist', 'build'], // Adicionei 'dist' e 'build'
    },
    formatter: {
      enabled: true,
      indentStyle: 'tab',
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
          noRedundantRoles: 'warn',
          useAltText: 'warn',
        },
        'suspicious/noDebugger': 'error',
        'suspicious/noConsoleLog': 'error',
        'complexity/noForEach': 'warn',
        'style/useBlockStatements': 'error',
        'style/useCamelCase': 'warn',
        'style/noVar': 'error',
        'nursery/noUselessFragments': 'warn',
      },
    },
    javascript: {
      formatter: {
        arrowParentheses: 'always',
        bracketSameLine: false,
        bracketSpacing: true,
        quoteStyle: 'single',
        jsxQuoteStyle: 'single',
        semicolons: 'asNeeded',
        quoteProperties: 'asNeeded',
      },
    },
    typescript: {
      formatter: {
        semicolons: 'asNeeded',
      },
    },
    jsx: {
      formatter: {
        quoteStyle: 'single',
      },
    },
  };
  fs.writeFileSync(
    path.join(projectPath, 'biome.json'),
    JSON.stringify(biomeConfig, null, 2)
  );

  console.log('Arquivo biome.json configurado com sucesso! 🚀');
}

function configurePackageJson(projectPath) {
  console.log('Configurando scripts do Biome, Vitest e lint-staged no package.json...');

  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Adiciona os scripts necessários
  packageJson.scripts = {
    ...packageJson.scripts,
    format: 'npx @biomejs/biome format --write ./src',
    lint: 'npx @biomejs/biome lint ./src',
    'lint-fix': 'npx @biomejs/biome lint --write ./src',
    check: 'npx @biomejs/biome check --write ./src',
    prepare: 'husky',
    test: 'vitest',
    'test:ui': 'vitest --ui',
    'test:coverage': 'vitest run --coverage',
  };

  // Adiciona a configuração do commitlint
  packageJson.commitlint = {
    extends: ['@commitlint/config-conventional'],
  };

  // Adiciona a configuração do lint-staged
  packageJson['lint-staged'] = {
    '*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}': [
      'biome check --write --no-errors-on-unmatched',
      'biome format --write --no-errors-on-unmatched',
      'biome lint --write --no-errors-on-unmatched',
    ],
  };

  // Escreve as alterações de volta ao package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('package.json atualizado com scripts do Biome, Vitest e lint-staged.');
}

function setupHusky(projectPath) {
  console.log('Configurando Husky...');

  execSync('pnpm exec husky init', { stdio: 'inherit', cwd: projectPath });

  const preCommitFilePath = path.join(projectPath, '.husky', 'pre-commit');
  const commitMsgFilePath = path.join(projectPath, '.husky', 'commit-msg');

  if (fs.existsSync(preCommitFilePath)) {
    fs.writeFileSync(preCommitFilePath, 'npx lint-staged\n', { flag: 'w' });
    console.log('Comando "npx lint-staged" adicionado ao hook pre-commit.');
  } else {
    console.error('Erro: Arquivo pre-commit não encontrado. O Husky pode não ter sido inicializado corretamente.');
  }

  if (!fs.existsSync(commitMsgFilePath)) {
    fs.writeFileSync(
      commitMsgFilePath,
      'npx --no-install commitlint --edit $1\n'
    );
    console.log('Arquivo "commit-msg" criado.');
  }
}

module.exports = {
  configureBiome,
  configurePackageJson,
  setupHusky,
};