import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "login",
      name: "Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await convex.mutation(api.users.login, {
          username: credentials.username,
          password: credentials.password,
        });

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.username, // NextAuth requires email field, we use username
          role: user.role,
          image: user.avatar,
        };
      },
    }),
    CredentialsProvider({
      id: "register",
      name: "Register",
      credentials: {
        name: { label: "Name", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.username || !credentials?.password || !credentials?.phone) return null;

        try {
          const userId = await convex.mutation(api.users.register, {
            name: credentials.name,
            username: credentials.username,
            password: credentials.password,
            phone: credentials.phone,
          });

          return {
            id: userId,
            name: credentials.name,
            email: credentials.username, // NextAuth requires email field
            role: "customer",
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
