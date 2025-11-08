import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { UserRound, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  image: z.any().optional(),
  name: z.string().min(3, "Name must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
});

export default function CreateOrganizationForm() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", image: null },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await authClient.getSession();
      if (data?.user) {
        setUser(data.user);
        form.setValue("name", data.user.name || "");
        setPreview(data.user.image || null);
      }
    };
    fetchUser();
  }, [form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true);
    try {
      let imageBase64: string | undefined;

      if (values.image && values.image[0]) {
        const file = values.image[0];
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
        ];
        if (!validTypes.includes(file.type)) {
          toast.error("Invalid file type");
          return;
        }

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        imageBase64 = base64;
      } else if (preview) {
        imageBase64 = preview;
      }

      const metadata = { someKey: "someValue" };
      const { data, error } = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
        logo: imageBase64,
        metadata,
        keepCurrentActiveOrganization: false,
      });
      if (data) {
        toast.success("Organization created successfully!");
        navigate("/dashboard");
      }
      if (error) {
        toast.error(`Error: ${error.message}`);
        toast.error(`Check Organization Name and Slug.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Create Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-3">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-48 h-48 rounded-full object-cover"
                    />
                  ) : user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-48 h-48 rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="w-20 h-20 text-muted-foreground" />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization logo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/jpg"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () =>
                                setPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            } else {
                              setPreview(null);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your name" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Organization Slug" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Create Organization"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex justify-center py-10">
              <Loader className="animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
