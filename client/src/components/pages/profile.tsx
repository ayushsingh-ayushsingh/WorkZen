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
import { hc } from "hono/client";
import type { AppType } from "../../../../server";
import { UserRound, Loader } from "lucide-react";

const client = hc<AppType>("/");

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  image: z.any().optional(),
});

export default function ProfileUpdateForm() {
  const [user, setUser] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orgData, setOrgData] = useState<any>();

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
      }
      const organization = await client.api.organization.$post({
        json: {
          orgId: data?.session.activeOrganizationId,
        },
      });
      const orgData = await organization.json();
      setOrgData(orgData);
    };
    fetchUser();
  }, []);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return toast.error("User not authenticated");
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
      }

      const response = await client.api.profile.$post({
        json: {
          userId: user.id,
          name: values.name,
          image: imageBase64,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Profile updated successfully!");
      setUser(data.user);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Update Profile
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
                      <FormLabel>Profile Image</FormLabel>
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
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your name" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input value={user.email} placeholder="Email" disabled />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      value={orgData?.data?.[0]?.name || ""}
                      placeholder="Organization name"
                      disabled
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Organization Slug</FormLabel>
                  <FormControl>
                    <Input
                      value={orgData?.data?.[0]?.slug || ""}
                      placeholder="Organization slug"
                      disabled
                    />
                  </FormControl>
                </FormItem>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Update Profile"
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
      <div>
        
      </div>
    </div>
  );
}
