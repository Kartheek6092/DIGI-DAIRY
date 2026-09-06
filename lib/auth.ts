import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "../services/auth.service";
import { connectDB } from "./db";
import { AppError } from "./AppError";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          
          // Get IP and UserAgent from request headers (v5 passes req to authorize)
          // In App Router, req is the Request object or similar, but the exact shape might vary in v5.
          // For simplicity, we just pass undefined if not easily accessible here.
          
          const user = await authService.login(
            credentials.email as string, 
            credentials.password as string
          );
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            rememberMe: credentials.rememberMe === "true"
          };
        } catch (error) {
          if (error instanceof AppError) {
            // NextAuth expects us to throw an error if authorization fails
            throw new Error(error.message);
          }
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        
        // If not remember me, set expiration to 24 hours from now
        if ((user as any).rememberMe === false) {
          token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
});
