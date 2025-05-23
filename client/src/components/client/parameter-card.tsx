import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { MorphoParameter } from "@/types/parameter";

export interface ParameterCardProps {
  parameter: MorphoParameter;
  onUpdate: (updatedParameter: MorphoParameter) => void;
  onDelete: (parameterId: string) => void;
  isReadOnly?: boolean;
}

export default function ParameterCard({ parameter, isReadOnly = false, onUpdate, onDelete }: ParameterCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PARAMETER",
    item: parameter,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Map color name to Tailwind classes
  const getColorClasses = (color?: string) => {
    if (!color) return "bg-gray-50 border-l-4 border-gray-500";

    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 border-l-4 border-blue-500",
      purple: "bg-purple-50 border-l-4 border-purple-500",
      green: "bg-green-50 border-l-4 border-green-500",
      amber: "bg-amber-50 border-l-4 border-amber-500",
      red: "bg-red-50 border-l-4 border-red-500",
      indigo: "bg-indigo-50 border-l-4 border-indigo-500",
    };
    return colorMap[color] || "bg-gray-50 border-l-4 border-gray-500";
  };

  // Map color name to text color classes
  const getTextColorClasses = (color?: string) => {
    if (!color) return "text-gray-800";

    const colorMap: Record<string, string> = {
      blue: "text-blue-800",
      purple: "text-purple-800",
      green: "text-green-800",
      amber: "text-amber-800",
      red: "text-red-800",
      indigo: "text-indigo-800",
    };
    return colorMap[color] || "text-gray-800";
  };

  return (
    <div
      ref={drag}
      className={cn(
        "parameter-card p-3 rounded-md shadow-sm cursor-grab transition-all duration-200",
        getColorClasses(parameter.color),
        isDragging && "opacity-50"
      )}
    >
      <div className="flex justify-between items-start">
        <h4 className={cn("font-medium", getTextColorClasses(parameter.color))}>
          {parameter.name}
        </h4>
        {!isReadOnly && (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-600"
              onClick={() => onUpdate(parameter)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-600"
              onClick={() => onDelete(parameter.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <div className={cn("mt-2 text-sm space-y-2", getTextColorClasses(parameter.color))}>
        <p>{parameter.attributes.length || 0} attributes</p>
        {parameter.attributes && parameter.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {parameter.attributes.map(attr => (
              <span key={attr.id} className="text-xs bg-white/10 px-2 py-0.5 rounded">
                {attr.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}