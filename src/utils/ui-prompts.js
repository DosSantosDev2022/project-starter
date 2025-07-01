// utils/ui-prompts.js
import inquirer from 'inquirer';

export async function getUiLibraryQuestion() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useUiLibrary',
      message: 'Deseja instalar uma biblioteca de UI (ex: Shadcn UI)?',
      default: false,
    },
    {
      type: 'list',
      name: 'selectedUiLibrary',
      message: 'Qual biblioteca de UI você gostaria de usar?',
      choices: [
        { name: 'Shadcn UI', value: 'shadcn' },
        // Adicionar outras opções de UI aqui no futuro
      ],
      when: (answers) => answers.useUiLibrary, // Só pergunta se 'useUiLibrary' for true
    },
  ]);
  return answers;
}