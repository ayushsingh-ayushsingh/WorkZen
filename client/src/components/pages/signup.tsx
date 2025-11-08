import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signInWithGithub, signInWithGoogle } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Eye, EyeOff, GithubIcon, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ui/modeToggle";

export default function Signup() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
      <ModeToggle />
    </div>
  );
}

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Full name must be at least 3 characters long")
    .max(30, "Full name must not exceed 30 characters"),
  email: z.email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must not exceed 64 characters"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must not exceed 64 characters"),
});

export function SignupForm({
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
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }
    try {
      const signUpRes = await authClient.signUp.email({
        name: values.username,
        email: values.email,
        password: values.password,
      });

      if (!signUpRes.error) {
        toast.success("Signup successful!");
      } else {
        toast.error(
          (signUpRes.error.message as string) ||
            "Signup failed. Please try again."
        );
      }

      const loginRes = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: true,
        callbackURL: "http://localhost:5173/create-organization",
      });

      if (loginRes.error) {
        toast.error(loginRes.error.message || "Invalid credentials");
      } else if (loginRes.data) {
        toast.success("Login successful!");
        navigate("/dashboard/create-organization");
      }
    } catch (err) {
      toast.error("An unexpected error occured!");
      console.error("Signup failed:", err);
    }
    setIsLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <Link
                  to={"/"}
                  className="flex items-center gap-0 text-sm text-muted-foreground w-min p-0"
                >
                  <ArrowLeft className="size-4" />
                  <span>Home</span>
                </Link>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-muted-foreground text-balance">
                    Create account with email
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    const [showPassword, setShowPassword] = useState(false);

                    return (
                      <FormItem>
                        <FormLabel>Create Password</FormLabel>
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => {
                    const [showPassword, setShowPassword] = useState(false);

                    return (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader className="animate-spin" /> : "Signup"}
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
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
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </Form>
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
