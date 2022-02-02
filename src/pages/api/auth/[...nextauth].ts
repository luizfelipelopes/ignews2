import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {params: {scope: 'read:user'}}
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn({user}) {

      const { email } = user;
      console.log(email, user.email);

      try {

        await fauna.query(
          // IF
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            //create
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            // else
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )

        )

        return true;

      } catch (error) {
        console.log(error);
        return false;
      }

    }
  }
})