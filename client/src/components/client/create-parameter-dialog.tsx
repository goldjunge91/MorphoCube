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
import { MorphoParameter } from "@/types/parameter";
import { useToast } from "@/hooks/use-toast";

interface CreateParameterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateParameter: (parameter: Omit<MorphoParameter, "id" | "created_at" | "updated_at">) => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Parametername ist erforderlich" }),
  description: z.string().optional(),
  color: z.string().optional(),
});

export default function CreateParameterDialog({
  open,
  onOpenChange,
  onCreateParameter,
}: CreateParameterDialogProps) {
  const [attributes, setAttributes] = useState<string[]>(["", ""]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "blue",
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

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Filter out empty attributes and trim whitespace
    const validAttributes = attributes
      .map(attr => attr.trim())
      .filter(attr => attr.length > 0);

    if (validAttributes.length === 0) {
      toast({
        title: "Fehler",
        description: "Mindestens ein Attribut ist erforderlich",
        variant: "destructive"
      });
      return;
    }

    // Erstelle die Attribut-Objekte mit den entsprechenden Eigenschaften
    const attributeObjects = validAttributes.map((name, index) => ({
      name,
      order: index,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // Erstelle den Parameter mit den neuen Attributen
    onCreateParameter({
      name: values.name,
      description: values.description,
      color: values.color,
      order: 0, // Wird in der übergeordneten Komponente überschrieben
      morphological_box_id: "", // Wird in der übergeordneten Komponente überschrieben
      attributes: attributeObjects.map((attr, index) => ({
        id: `temp_${index}`, // Temporäre ID, wird in der übergeordneten Komponente überschrieben
        name: attr.name,
        order: attr.order,
        parameter_id: "", // Wird in der übergeordneten Komponente überschrieben
        created_at: attr.created_at,
        updated_at: attr.updated_at,
      })),
    });

    // Formular zurücksetzen und Dialog schließen
    form.reset();
    setAttributes(["", ""]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Parameter erstellen</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parametername</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name des Parameters eingeben"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Beschreibung des Parameters"
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
                  <FormLabel>Farbe</FormLabel>
                  <div className="flex space-x-2">
                    {["blue", "purple", "green", "amber", "red", "indigo"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full bg-${color}-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 ${field.value === color
                            ? `ring-2 ring-offset-2 ring-${color}-500`
                            : ""
                          }`}
                        onClick={() => form.setValue("color", color)}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Attribute</FormLabel>
              <div className="space-y-2 mt-2">
                {attributes.map((attribute, index) => (
                  <div key={index} className="flex items-center">
                    <Input
                      placeholder="Name des Attributs eingeben"
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
                <span>Weiteres Attribut hinzufügen</span>
              </Button>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                Erstellen
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
