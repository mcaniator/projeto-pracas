"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  type: z.enum(["text", "numeric", "option"]),
  question: z.object({
    name: z.string(),
    category_id: z.number(),
    active: z.boolean(),
    optional: z.boolean(),
  }),
  options: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .nullable(),
  field: z.union([
    z.object({
      char_limit: z.number(),
    }),
    z.object({
      id_field: z.number(),
      min: z.number(),
      max: z.number(),
    }),
    z.object({
      option_limit: z.number(),
      total_options: z.number(),
      visual_preference: z.number(),
    }),
  ]),
});

const questionType: {
  value: "text" | "numeric" | "option";
  label: string;
}[] = [
  {
    value: "text",
    label: "text",
  },
  {
    value: "numeric",
    label: "numeric",
  },
  {
    value: "option",
    label: "option",
  },
];

export function QuestionForm() {
  const [currentSelection, setCurrentSelection] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: {
        category_id: 1,
        active: true,
        optional: false,
      },
      options: null,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    fetch("http://localhost:3333/form_field", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success: ", data);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
    console.log(values);

    form.reset();
    setCurrentSelection("");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <FormField
          control={form.control}
          name="question.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pergunta</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? questionType.find(
                            (type) => type.value === field.value,
                          )?.label
                        : "Select language"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search framework..."
                      className="h-9"
                    />
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {questionType.map((type) => (
                        <CommandItem
                          value={type.label}
                          key={type.value}
                          onSelect={() => {
                            form.setValue("type", type.value);
                            setCurrentSelection(type.value);
                          }}
                        >
                          {type.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentSelection == "text" && (
          <FormField
            control={form.control}
            name="field.char_limit"
            render={(field) => (
              <FormItem>
                <FormLabel>Limite de caracteres</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {currentSelection == "numeric" && (
          <div>
            <FormField
              control={form.control}
              name="field.id_field"
              render={(field) => (
                <FormItem>
                  <FormLabel>id</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="field.min"
              render={(field) => (
                <FormItem>
                  <FormLabel>Valor mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="field.max"
              render={(field) => (
                <FormItem>
                  <FormLabel>Valor máximo</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {currentSelection == "option" && <p>oi</p>}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
