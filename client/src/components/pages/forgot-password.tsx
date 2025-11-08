import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/ui/modeToggle";

const formSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export default function ForgotPassword() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ForgotPasswordForm />
      </div>
      <ModeToggle />
    </div>
  );
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { error } = await authClient.forgetPassword({
        email: values.email,
      });

      if (error) {
        toast.error(
          error.message || "Failed to send reset link. Please try again."
        );
      } else {
        toast.success("Password reset link sent successfully!");
        form.reset();
        navigate("/login");
      }
    } catch (err) {
      console.error("Password reset failed:", err);
      toast.error("An unexpected error occurred.");
    }
    setIsLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <Link
                  to="/"
                  className="flex items-center gap-0 text-sm text-muted-foreground w-min p-0"
                >
                  <ArrowLeft className="size-4" />
                  <span>Home</span>
                </Link>

                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Forgot Password</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter your registered email to receive a password reset
                    link.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="me@email.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>

                <div className="text-center text-sm flex gap-2 justify-center">
                  <span>Return to</span>
                  <Link to="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                  <span>or</span>
                  <Link to="/signup" className="underline underline-offset-4">
                    Signup
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
              alt="Reset password illustration"
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
