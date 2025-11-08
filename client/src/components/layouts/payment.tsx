import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { client } from "@/lib/hono-client";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  amount: z
    .number("Please enter a valid amount")
    .positive("Amount must be greater than 0"),
});

export default function PaymentTest() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 100 },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const userRes = await authClient.getSession();

      const res = await client.api["create-order"].$post({
        json: {
          userId: userRes.data?.user.id,
          amount: values.amount,
          currency: "INR",
          receipt: "receipt#1",
          notes: ["Note - 01", "Note - 02"],
        },
      });

      if (!res.ok) throw new Error("Failed to create order");

      const order = await res.json();

      const options = {
        amount: order[0].amount,
        currency: order[0].currency,
        order_id: order[0].orderId,
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        name: "My Company",
        description: "Test Transaction",
        callback_url: "http://localhost:5173/dashboard",
        prefill: {
          name: userRes.data?.user.name,
          email: userRes.data?.user.email,
          contact: "9876543210",
        },
        theme: { color: "#4F46E5" },
      };

      // @ts-ignore (Razorpay not typed in TS)
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment initialization failed!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 h-full">
      <div className="w-full max-w-sm md:max-w-2xl">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div>
                  <h1 className="text-2xl font-bold text-center my-2">Make a Payment</h1>
                  <p className="text-center text-muted-foreground text-sm">
                    Enter an amount and test the Razorpay Checkout flow
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (INR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className={cn("w-full")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
