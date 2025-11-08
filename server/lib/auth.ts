import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import * as schema from "../db/schema";
import { openAPI } from "better-auth/plugins";
import { Resend } from "resend";
import VerifyEmail from "../email/verify-email";
import { organization } from "better-auth/plugins"
import ForgotPasswordEmail from "../email/reset-password";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  plugins: [openAPI(), organization() ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      resend.emails.send({
        from: `Ayush Singh <onboarding@resend.dev>`,
        to: user.email,
        subject: "Verify your email",
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }: any) => {
      resend.emails.send({
        from: `Ayush Singh <onboarding@resend.dev>`,
        to: user.email,
        subject: "Reset your password",
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url + process.env.CLIENT_URL! + "/reset-password",
          userEmail: user.email,
        }),
      });
    },
    // requireEmailVerification: true,
  },
  trustedOrigins: [process.env.CLIENT_URL!, process.env.SERVER_URL!],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
