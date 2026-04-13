import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server components não podem setar cookies — ignorado (middleware cuida disso)
          }
        },
      },
    }
  )
}

// Lê o userId direto do JWT no cookie — sem roundtrip de rede.
// Adequado para pages que só precisam do userId para buscar dados.
// O middleware já validou a sessão para fins de roteamento.
export const getAuthUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user.id ?? null
})

// Valida com o servidor Supabase — usar apenas quando necessário por segurança.
export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
