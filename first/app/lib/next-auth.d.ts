import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      status: string
    }
  }

  interface User {
    status: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    status: string
  }
}
