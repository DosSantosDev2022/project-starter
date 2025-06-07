const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function setupPrisma(projectPath) {
  console.log('Instalando e configurando Prisma...');

  execSync('pnpm install prisma @prisma/client', {
    stdio: 'inherit',
    cwd: projectPath,
  });

  execSync('npx prisma init', {
    stdio: 'inherit',
    cwd: projectPath,
  });

  const envPath = path.join(projectPath, '.env');
  if (fs.existsSync(envPath)) {
    fs.writeFileSync(
      envPath,
      'DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"\n',
      { flag: 'w' } // 'w' sobrescreve, 'a' adiciona. Aqui queremos sobrescrever para garantir a URL padrão.
    );
    console.log(".env atualizado com DATABASE_URL padrão.");
  } else {
    console.warn("Aviso: Arquivo .env não encontrado. Crie-o manualmente se necessário.");
    fs.writeFileSync(envPath, 'DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"\n');
  }

  const schemaPath = path.join(projectPath, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const schemaContent = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String?   // Adicionado para login com credenciais
  emailVerified DateTime? // Para controle de verificação de e-mail
  image         String?   // Para fotos de perfil (Google Provider)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
`.trim();
    fs.writeFileSync(schemaPath, schemaContent, { flag: 'w' });
    console.log("Modelo 'User' atualizado no schema.prisma com campos para NextAuth.");
  } else {
    console.error("Erro: Arquivo schema.prisma não encontrado. O Prisma pode não ter sido inicializado corretamente.");
  }

  // Set up Prisma Client in the lib/prisma.ts file
  const libPath = path.join(projectPath, 'src', 'lib');
  if (!fs.existsSync(libPath)) {
    fs.mkdirSync(libPath, { recursive: true }); // Garante que o diretório exista
  }

  const prismaTSPath = path.join(libPath, 'prisma.ts');
  const prismaClientCode = `
import { PrismaClient } from '@prisma/client'
 
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;
`.trim();
  fs.writeFileSync(prismaTSPath, prismaClientCode);
  console.log("Arquivo lib/prisma.ts configurado com sucesso!");
}

function setupNextAuth(projectPath) {
  console.log('Instalando NextAuth.js...');

  execSync('pnpm install next-auth @next-auth/prisma-adapter', {
    stdio: 'inherit',
    cwd: projectPath,
  });

  // lib/auth.ts
  const libAuthPath = path.join(projectPath, 'src', 'lib', 'auth.ts');
  const authFileContent = `
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import db from '@/lib/prisma' // Ajuste para importar o default
import { compare } from 'bcryptjs'

import type { AuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    // Login com e-mail e senha
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Usuário não encontrado ou senha não configurada.')
        }

        // 🚫 Verifica se o e-mail foi verificado (opcional, pode ser removido)
        if (!user.emailVerified) {
          throw new Error('Você precisa verificar seu e-mail antes de fazer login.')
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        )

        if (!isPasswordValid) {
          throw new Error('Senha incorreta')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          // Adapte estes campos conforme o seu modelo User no Prisma
          // surname: user.surname as string, // Se você tiver um campo 'surname'
        }
      },
    }),

    // Login com Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // token.surname = user.surname ?? null // Adapte conforme o seu modelo
      } else if (token?.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
          select: { id: true /* surname: true */ }, // Adapte os campos
        })
        if (dbUser) {
          token.id = dbUser.id
          // token.surname = dbUser.surname
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        // session.user.surname = token.surname as string // Adapte conforme o seu modelo
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  // pages: {
  //   signIn: '/auth/signin', // Exemplo de página de login customizada
  // },
}
`.trim();
  fs.writeFileSync(libAuthPath, authFileContent);
  console.log("Arquivo src/lib/auth.ts criado com configuração básica do NextAuth.");

  // app/api/auth/[...nextauth]/route.ts
  const authRoutePath = path.join(
    projectPath,
    'src',
    'app',
    'api',
    'auth',
    '[...nextauth]'
  );
  fs.mkdirSync(authRoutePath, { recursive: true });

  const authRouteContent = `
import { authOptions } from '@/lib/auth'
import NextAuth from 'next-auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
`.trim();
  fs.writeFileSync(path.join(authRoutePath, 'route.ts'), authRouteContent);
  console.log("Rota src/app/api/auth/[...nextauth]/route.ts criada.");

  // Criação do arquivo .env.local
  const envLocalPath = path.join(projectPath, '.env.local');
  const envContent = `
# NEXTAUTH ENV VARS
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret_long_random_string # Gere uma string longa e aleatória
NEXT_PUBLIC_URL=http://localhost:3000
`.trim();

  // Garante que o .env.local exista ou adicione as variáveis
  if (!fs.existsSync(envLocalPath)) {
    fs.writeFileSync(envLocalPath, envContent);
  } else {
    fs.appendFileSync(envLocalPath, '\n' + envContent); // Adiciona ao final se já existir
  }
  console.log("✅ Arquivo .env.local atualizado com variáveis de ambiente para o NextAuth.");
}

module.exports = {
  setupPrisma,
  setupNextAuth,
};