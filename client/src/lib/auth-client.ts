import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});

export const signInWithGoogle = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
  return data;
};

export const signInWithGithub = async () => {
  const data = await authClient.signIn.social({
    provider: "github",
  });
  return data;
};
