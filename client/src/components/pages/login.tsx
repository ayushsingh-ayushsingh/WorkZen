import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GithubIcon, ArrowLeft, Loader, EyeOff, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithGithub, signInWithGoogle } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/ui/modeToggle";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
      <ModeToggle />
    </div>
  );
}

const formSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must not exceed 64 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(false);

  if (isPageLoading) {
    return (
      <div className="max-w-screen max-h-screen z-10 flex items-center justify-center">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  const session = async () => {
    const { data } = await authClient.getSession();
    if (data) {
      navigate("/");
    }
  };

  session();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: true,
        callbackURL: "http://localhost:5173/dashboard",
      });

      if (error) {
        toast.error(error.message || "Invalid credentials");
      } else if (data) {
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8 flex flex-col gap-6"
            >
              {/* Back to home */}
              <Link
                to={"/"}
                className="flex items-center gap-0 text-sm text-muted-foreground w-min p-0"
              >
                <ArrowLeft className="size-4" />
                <span>Home</span>
              </Link>

              {/* Title */}
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
                </p>
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="me@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  const [showPassword, setShowPassword] = useState(false);

                  return (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin" /> : "Login"}
              </Button>

              {/* Divider */}
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              {/* Social login */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full cursor-pointer h-14"
                  onClick={async () => {
                    setIsPageLoading(true);
                    await signInWithGoogle();
                    setIsPageLoading(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full cursor-pointer h-14"
                  onClick={async () => {
                    setIsPageLoading(true);
                    await signInWithGithub();
                    setIsPageLoading(false);
                  }}
                >
                  <GithubIcon strokeWidth={2.5} />
                  <span className="sr-only">Login with Google</span>
                </Button>
              </div>

              {/* Footer link */}
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>

          {/* Side image */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.jpg"
              width={1000}
              height={1000}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.9] dark:saturate-90"
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer credits */}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        <span className="hidden md:block">
          Crafted with ❤️ by{" "}
          <a
            href="https://github.com/ayushsingh-ayushsingh"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ayush Singh
          </a>{" "}
          | &copy; {new Date().getFullYear()} All rights reserved.
        </span>
        <span className="block md:hidden">
          Crafted with ❤️ by{" "}
          <a
            href="https://github.com/ayushsingh-ayushsingh"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ayush Singh
          </a>
        </span>
      </div>
    </div>
  );
}
