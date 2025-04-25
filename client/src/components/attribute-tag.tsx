import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Attribute } from "@shared/schema";

interface AttributeTagProps {
  attribute: Attribute;
  color: string;
  onDelete: (attributeId: number) => void;
}

export default function AttributeTag({ attribute, color, onDelete }: AttributeTagProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ATTRIBUTE",
    item: attribute,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Map color name to Tailwind classes
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      green: "bg-green-100 text-green-800",
      amber: "bg-amber-100 text-amber-800",
      red: "bg-red-100 text-red-800",
      indigo: "bg-indigo-100 text-indigo-800",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  // Map color name to button classes
  const getButtonClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-500 hover:text-blue-700",
      purple: "text-purple-500 hover:text-purple-700",
      green: "text-green-500 hover:text-green-700",
      amber: "text-amber-500 hover:text-amber-700",
      red: "text-red-500 hover:text-red-700",
      indigo: "text-indigo-500 hover:text-indigo-700",
    };
    return colorMap[color] || "text-gray-500 hover:text-gray-700";
  };

  return (
    <div
      ref={drag}
      className={cn(
        "py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1 cursor-grab",
        getColorClasses(color),
        isDragging && "opacity-50"
      )}
      data-attribute-id={attribute.id}
    >
      <span>{attribute.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-4 w-4 p-0 ml-1", getButtonClasses(color))}
        onClick={() => onDelete(attribute.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}