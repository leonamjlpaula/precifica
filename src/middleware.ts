import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession() lê o JWT do cookie sem roundtrip de rede — adequado para decisões de roteamento.
  // Server components usam getUser() para validação segura com o servidor.
  const { data: { session } } = await supabase.auth.getSession()

  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/custos-fixos') ||
    request.nextUrl.pathname.startsWith('/materiais') ||
    request.nextUrl.pathname.startsWith('/procedimentos') ||
    request.nextUrl.pathname.startsWith('/comparativo-vrpo') ||
    request.nextUrl.pathname.startsWith('/historico') ||
    request.nextUrl.pathname.startsWith('/exportar') ||
    request.nextUrl.pathname.startsWith('/primeiros-passos')

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
