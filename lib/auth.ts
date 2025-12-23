import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { query, queryOne, User, generateUUID } from './db'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from './email'

// Extender tipos de NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }
  interface User {
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Autenticación con email y contraseña
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos')
        }

        const user = await queryOne<User>(
          'SELECT * FROM users WHERE email = $1',
          [credentials.email.toLowerCase()]
        )

        if (!user) {
          throw new Error('Usuario no encontrado')
        }

        if (!user.password_hash) {
          throw new Error('Esta cuenta usa inicio de sesión por email')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash)

        if (!isValid) {
          throw new Error('Contraseña incorrecta')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
        }
      },
    }),
    // Magic Link (solo si está configurado Resend)
    ...(process.env.RESEND_API_KEY ? [
      EmailProvider({
        server: {
          host: 'smtp.resend.com',
          port: 465,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY,
          },
        },
        from: process.env.RESEND_FROM_EMAIL || 'noreply@localhost',
      }),
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Si es magic link, crear usuario si no existe
      if (account?.provider === 'email') {
        const existingUser = await queryOne<User>(
          'SELECT id FROM users WHERE email = $1',
          [user.email!.toLowerCase()]
        )

        if (!existingUser) {
          // Crear nuevo usuario con trial
          await createUserWithTrial(user.email!.toLowerCase(), null, user.name || null)
          
          // Enviar email de bienvenida
          await sendWelcomeEmail(user.email!, user.name || 'Usuario')
        }
      }

      return true
    },
    async jwt({ token, user }) {
      // Primera vez que se crea el token (login)
      if (user) {
        token.id = user.id
        token.role = user.role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      // Pasar datos del token a la sesión
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || 'user'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Función para verificar contraseñas
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Función interna para crear usuario con trial (sin dependencia de stored procedures)
async function createUserWithTrial(
  email: string, 
  passwordHash: string | null, 
  fullName: string | null
): Promise<string> {
  const userId = generateUUID()
  const subscriptionId = generateUUID()

  // Crear usuario
  await query(
    `INSERT INTO users (id, email, password_hash, full_name, role, email_verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [userId, email, passwordHash, fullName, 'user', false]
  )

  // Crear suscripción trial (solo para plan starter)
  await query(
    `INSERT INTO subscriptions (id, user_id, plan_id, status, trial_start, trial_end, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '14 days', NOW(), NOW())`,
    [subscriptionId, userId, 'starter', 'trialing']
  )

  // Crear límites de uso
  await query(
    `INSERT INTO usage_limits (user_id, projects_count, storage_used, models_3d_count, last_reset_date)
     VALUES ($1, $2, $3, $4, NOW())`,
    [userId, 0, 0, 0]
  )

  return userId
}

// Función para registrar nuevo usuario
export async function registerUser(
  email: string, 
  password: string, 
  fullName?: string,
  plan: string = 'starter'
): Promise<string> {
  const existingUser = await queryOne<User>(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  )

  if (existingUser) {
    throw new Error('El email ya está registrado')
  }

  const passwordHash = await hashPassword(password)
  const userId = generateUUID()
  const subscriptionId = generateUUID()

  // Crear usuario
  await query(
    `INSERT INTO users (id, email, password_hash, full_name, role, email_verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [userId, email.toLowerCase(), passwordHash, fullName || null, 'user', false]
  )

  // Crear suscripción según el plan
  // Solo starter tiene trial
  const hasTrial = plan === 'starter'
  
  if (hasTrial) {
    // Plan Starter con trial de 14 días
    await query(
      `INSERT INTO subscriptions (id, user_id, plan_id, status, trial_start, trial_end, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '14 days', NOW(), NOW())`,
      [subscriptionId, userId, plan, 'trialing']
    )
  } else {
    // Otros planes sin trial - estado pending hasta que paguen
    await query(
      `INSERT INTO subscriptions (id, user_id, plan_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [subscriptionId, userId, plan, 'pending']
    )
  }

  // Crear límites de uso
  await query(
    `INSERT INTO usage_limits (user_id, projects_count, storage_used, models_3d_count, last_reset_date)
     VALUES ($1, $2, $3, $4, NOW())`,
    [userId, 0, 0, 0]
  )

  // Enviar email de bienvenida
  await sendWelcomeEmail(email, fullName || 'Usuario')

  return userId
}

// Función para obtener usuario por ID
export async function getUserById(userId: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE id = $1', [userId])
}

// Función para obtener usuario por email
export async function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
}
