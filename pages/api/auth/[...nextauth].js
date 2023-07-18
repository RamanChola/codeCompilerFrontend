import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "email", type: "email" },
          password: {  label: "password", type: "password" }
        },
        async authorize(credentials, req) {
        // const baseUrl = process.env.NEXTAUTH_URL;
        const baseUrl = `${process.env.BACKEND_URL}/api/users`;
          const res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          })
          const user = await res.json()
          // If no error and we have user data, return it
          if (res.ok && user) {
            return user
          } else {
            // Return null if user data could not be retrieved
            throw new Error('Invalid Creds') 
          }
        }
      })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      user && (token.user = user);
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  }
});