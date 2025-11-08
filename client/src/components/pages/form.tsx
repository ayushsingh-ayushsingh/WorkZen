import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { client } from "@/lib/hono-client";
import { toast } from "sonner";

export default function TestForm() {
  const formSchema = z.object({
    "text-input-0": z.string(),
    "number-input-0": z.string().optional(),
    "email-input-0": z.string(),
    "radio-0": z.string(),
    "textarea-0": z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "text-input-0": "",
      "number-input-0": "",
      "email-input-0": "",
      "radio-0": "",
      "textarea-0": "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const res = await client.api.form.$post({
      json: {
        number: values["number-input-0"],
        email: values["email-input-0"],
        text: values["text-input-0"],
        textarea: values["textarea-0"],
        option: values["radio-0"],
      },
    });
    if (!res.ok) {
      toast.error("Error occured!");
    }
    toast.success("Profile updated successfully!");
  }

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Form</CardTitle>
          <CardDescription>Fill in the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onReset={onReset}
            className="space-y-8"
          >
            <div className="grid grid-cols-12 gap-4">
              <Controller
                control={form.control}
                name="text-input-0"
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel className="flex w-auto!">Text</FieldLabel>

                    <Input
                      key="text-input-0"
                      placeholder=""
                      type="text"
                      className=""
                      {...field}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="number-input-0"
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel className="flex w-auto!">Number</FieldLabel>

                    <Input
                      key="number-input-0"
                      placeholder=""
                      type="number"
                      className=""
                      {...field}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="email-input-0"
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel className="flex w-auto!">Email</FieldLabel>

                    <Input
                      key="email-input-0"
                      placeholder=""
                      type="email"
                      className=""
                      {...field}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="radio-0"
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel className="flex w-auto!">
                      Radio Group
                    </FieldLabel>

                    <RadioGroup
                      key="radio-0"
                      id="radio-0"
                      className="w-full"
                      value={field.value}
                      name={field.name}
                      onValueChange={field.onChange}
                    >
                      <div
                        key="option1"
                        className="flex items-center has-data-[state=checked]:border-primary w-full space-x-3 border-0 p-0"
                      >
                        <RadioGroupItem value="option1" id="radio-0-option1" />
                        <div className="grid gap-2 leading-none">
                          <FieldLabel
                            htmlFor="radio-0-option1"
                            className="font-medium"
                          >
                            Option 1
                          </FieldLabel>
                          <p className="text-sm text-muted-foreground">
                            Option 1 Description
                          </p>
                        </div>
                      </div>

                      <div
                        key="option2"
                        className="flex items-center has-data-[state=checked]:border-primary w-full space-x-3 border-0 p-0"
                      >
                        <RadioGroupItem value="option2" id="radio-0-option2" />
                        <div className="grid gap-2 leading-none">
                          <FieldLabel
                            htmlFor="radio-0-option2"
                            className="font-medium"
                          >
                            Option 2
                          </FieldLabel>
                          <p className="text-sm text-muted-foreground">
                            Option 2 Description
                          </p>
                        </div>
                      </div>
                    </RadioGroup>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="textarea-0"
                render={({ field, fieldState }) => (
                  <Field
                    className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel className="flex w-auto!">Text Area</FieldLabel>

                    <Textarea
                      key="textarea-0"
                      id="textarea-0"
                      placeholder=""
                      className=""
                      {...field}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button
                key="reset-button-0"
                id="reset-button-0"
                name=""
                className="col-span-6"
                type="reset"
                variant="outline"
              >
                Reset
              </Button>
              <Button
                key="submit-button-0"
                id="submit-button-0"
                name=""
                className="col-span-6"
                type="submit"
                variant="default"
              >
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
