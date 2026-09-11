import { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authenticator } from "@otplib/preset-default";
import { db } from "./db";
import { decryptSecret } from "./crypto";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: `next-auth.session.token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // Chỉ bật Secure khi chạy production thật sự trên HTTPS
        secure:
          process.env.NODE_ENV === "production" &&
          Boolean(process.env.NEXTAUTH_URL?.startsWith("https://")),
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "OTP", type: "text", required: false },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.deletedAt) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        // 2-FA: chặn phiên đăng nhập cho tới khi OTP hợp lệ (verify ngay trong authorize)
        if (user.twoFactorEnabled) {
          if (!credentials.token || !user.twoFactorSecret) return null;
          const otpValid = authenticator.check(
            credentials.token,
            decryptSecret(user.twoFactorSecret)
          );
          if (!otpValid) return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.twoFactorEnabled = Boolean(token.twoFactorEnabled);
      }
      return session;
    },
  },
};
