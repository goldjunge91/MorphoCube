import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Parameter, InsertParameter } from "@shared/schema";

interface CreateParameterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (parameter: InsertParameter, attributes: string[]) => void;
  editingParameter?: Parameter;
}

const formSchema = z.object({
  name: z.string().min(1, "Parameter name is required"),
  color: z.string(),
});

export default function CreateParameterDialog({
  open,
  onOpenChange,
  onSubmit,
  editingParameter,
}: CreateParameterDialogProps) {
  const [attributes, setAttributes] = useState<string[]>(["", ""]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingParameter?.name || "",
      color: editingParameter?.color || "blue",
    },
  });

  const addAttribute = () => {
    setAttributes([...attributes, ""]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = value;
    setAttributes(newAttributes);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Filter out empty attributes and trim whitespace
      const validAttributes = attributes
        .map(attr => attr.trim())
        .filter(attr => attr.length > 0);

      if (validAttributes.length === 0) {
        // Show error if no valid attributes
        form.setError("name", { 
          message: "At least one attribute is required" 
        });
        return;
      }

      await onSubmit(
        {
          name: values.name,
          color: values.color,
          userId: 0, // This will be set on the server
        },
        validAttributes
      );
      
      // Reset form and close dialog only after successful submission
      form.reset();
      setAttributes(["", ""]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create parameter:", error);
      toast({
        title: "Error",
        description: "Failed to create parameter. Please try again.",
        variant: "destructive"
      });
    }
  };

  const colors = [
    { name: "blue", bg: "bg-blue-500" },
    { name: "purple", bg: "bg-purple-500" },
    { name: "green", bg: "bg-green-500" },
    { name: "red", bg: "bg-red-500" },
    { name: "amber", bg: "bg-amber-500" },
    { name: "indigo", bg: "bg-indigo-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingParameter ? "Edit Parameter" : "Create New Parameter"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parameter Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter parameter name"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex space-x-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className={`w-8 h-8 rounded-full ${color.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color.name}-500 ${
                          field.value === color.name
                            ? `ring-2 ring-offset-2 ring-${color.name}-500`
                            : ""
                        }`}
                        onClick={() => form.setValue("color", color.name)}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Attributes</FormLabel>
              <div className="space-y-2 mt-2">
                {attributes.map((attribute, index) => (
                  <div key={index} className="flex items-center">
                    <Input
                      placeholder="Enter attribute name"
                      value={attribute}
                      onChange={(e) => updateAttribute(index, e.target.value)}
                      className="flex-1"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2 text-gray-400 hover:text-gray-500"
                      onClick={() => removeAttribute(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-primary hover:text-primary-dark font-medium flex items-center"
                onClick={addAttribute}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add another attribute</span>
              </Button>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingParameter ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
