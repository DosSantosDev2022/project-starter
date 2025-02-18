
# Project Starter

O **Project Starter** é um script Node.js que facilita a criação de novos projetos em **Next.js** ou **Vite.js** com configurações personalizadas. Ele cria a estrutura básica de pastas, instala dependências selecionadas e prepara o ambiente de desenvolvimento com as bibliotecas que você mais usa.

## Funcionalidades

- Criação de projetos **Next.js** ou **Vite.js** com suporte a **TypeScript**.
- Estrutura de pastas personalizada, com diretórios para fontes, imagens, hooks, serviços, componentes, e muito mais.
- Instalação das bibliotecas mais comuns, como **React Icons**, **React Hook Form**, **Zod**, **Zustand**, **Tailwind CSS** e outras.
- Integração com **pnpm** para instalar as dependências de forma rápida e eficiente.
- Suporte para limpar arquivos desnecessários e organizar seu projeto automaticamente.

## Como Usar

###  Utilize nosso CLI para iniciar o seu projeto

Para utilizar nosso starter basta rodar o comando abaixo em seu terminal:

```bash
npx project-starter
```

O script irá guiá-lo por uma série de perguntas para configurar seu novo projeto. Você poderá escolher entre:

- **Tipo de Projeto**: **Next.js** ou **Vite.js**.
- **Nome do Projeto**: Digite o nome desejado para o projeto.
- **Dependências**: Selecione as bibliotecas que deseja instalar no projeto.

### 4. Dependências Suportadas

Durante a execução do script, você poderá escolher as bibliotecas para instalação, incluindo:

- **React Icons**
- **React Hook Form**
- **Hookform/Resolvers**
- **Zod**
- **Zustand**
- **UUID**
- **Tailwind Merge**
- **Tailwind Scrollbar**
- **Date-fns**
- **Framer Motion**
- **lib-scss (um package de configurações para scss)**
- **vitest**

### 5. Estrutura do Projeto

Após a execução do script, o projeto será criado com a seguinte estrutura de pastas:

```
src/
  assets/
    fonts/
    images/
  hooks/
  lib/
  utils/
  components/
    ui/
    global/
    pages/
    layout/
  services/
  store/
  providers/
  actions/
  app/
    api/
    (pages)
styles/
  globals.css
```

### 6. Instalação das Dependências

O script usa **pnpm** para instalar as dependências. Caso o **pnpm** não esteja instalado, será necessário instalá-lo primeiro:

```bash
npm install -g pnpm
```

O script garantirá que o `pnpm` seja usado para instalar as dependências corretamente.

## Contribuindo

Se você deseja contribuir com melhorias ou corrigir problemas, sinta-se à vontade para abrir uma **issue** ou **pull request**. Ficaremos felizes com a sua contribuição!

## Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido por Juliano Santos.** 😎
