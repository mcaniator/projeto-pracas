"use client";

import { categoriesJSONSchema, questionType } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  type: z.string(),
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
      char_limit: z.coerce.number(),
    }),
    z.object({
      id_field: z.coerce.number(),
      min: z.coerce.number(),
      max: z.coerce.number(),
    }),
    z.object({
      option_limit: z.coerce.number(),
      total_options: z.coerce.number(),
      visual_preference: z.coerce.number(),
    }),
  ]),
});

const questionType: questionType[] = [
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

export function QuestionForm({
  categories,
}: {
  categories: categoriesJSONSchema[];
}) {
  const [currentSelection, setCurrentSelection] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: {
        name: "teste",
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
          name="question.category_id"
          render={({ field }) => (
            <FormItem>
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
                        ? categories.find((type) => type.id === field.value)
                            ?.name
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
                      {categories.map((type) => (
                        <CommandItem
                          value={type.name}
                          key={type.id}
                          onSelect={() => {
                            form.setValue("question.category_id", type.id);
                          }}
                        >
                          {type.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        {/* Question input */}
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

        {/* Question type selector */}
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
            render={({ field }) => (
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

        {/* {currentSelection == "numeric" && (
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
        {currentSelection == "option" && <p>oi</p>} */}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
