import { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Parameter, 
  Attribute, 
  MorphBox, 
  ParameterWithAttributes,
  InsertAttribute,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Grid, 
  Layers, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Plus, 
  RotateCcw, 
  GridIcon, 
  Loader2,
  Database, 
  Sliders, 
  BarChart
} from "lucide-react";
import AttributeTag from "./attribute-tag";
import CombinationDialog from "./combination-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
interface MorphologicalBoxProps {
  morphBoxId?: number;
  onSave: (content: any) => void;
}

// Define the BoxParameter type inline
type BoxParameter = Parameter & { 
  attributes: Attribute[]; 
  weight?: number; // Engineering importance weight (1-10)
};

export default function MorphologicalBox({ morphBoxId, onSave }: MorphologicalBoxProps) {
  const { toast } = useToast();
  const [boxParameters, setBoxParameters] = useState<BoxParameter[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parameterToDelete, setParameterToDelete] = useState<number | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<{ parameterId: number, attributeId: number } | null>(null);
  const [viewMode, setViewMode] = useState<"compact" | "groups">("compact");
  const [combinationsDialogOpen, setCombinationsDialogOpen] = useState(false);

  // Fetch parameters and attributes
  const { data: parameters, isLoading: isLoadingParameters } = useQuery<Parameter[]>({
    queryKey: ["/api/parameters"],
  });

  // Fetch morphbox data if editing an existing box
  const { data: morphBox, isLoading: isLoadingMorphBox } = useQuery<MorphBox>({
    queryKey: [`/api/morphboxes/${morphBoxId}`],
    enabled: !!morphBoxId,
  });

  // Add attribute mutation
  const addAttributeMutation = useMutation({
    mutationFn: async ({ parameterId, name }: { parameterId: number, name: string }) => {
      const attributeData: InsertAttribute = {
        name,
        parameterId
      };
      const res = await apiRequest("POST", "/api/attributes", attributeData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parameters"] });
      toast({
        title: "Attribute added",
        description: "Attribute was successfully added.",
      });
      
      // Update local state too for immediate feedback
      setBoxParameters(prev => {
        return prev.map(param => {
          if (param.id === data.parameterId) {
            return {
              ...param,
              attributes: [...param.attributes, data]
            };
          }
          return param;
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add attribute: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete attribute mutation
  const deleteAttributeMutation = useMutation({
    mutationFn: async (attributeId: number) => {
      await apiRequest("DELETE", `/api/attributes/${attributeId}`);
      return attributeId;
    },
    onSuccess: (attributeId) => {
      toast({
        title: "Attribute deleted",
        description: "Attribute was successfully deleted.",
      });
      
      // Update local state
      if (attributeToDelete) {
        setBoxParameters(prev => {
          return prev.map(param => {
            if (param.id === attributeToDelete.parameterId) {
              return {
                ...param,
                attributes: param.attributes.filter(attr => attr.id !== attributeId)
              };
            }
            return param;
          });
        });
        setAttributeToDelete(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete attribute: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set up drop zone for parameters
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PARAMETER",
    drop: (item: Parameter) => {
      handleAddParameter(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Initialize from morphbox data if available
  useEffect(() => {
    if (morphBox && morphBox.content) {
      try {
        const content = typeof morphBox.content === 'string' 
          ? JSON.parse(morphBox.content)
          : morphBox.content;
          
        if (content.parameters) {
          setBoxParameters(content.parameters);
        }
      } catch (error) {
        console.error("Error parsing morphbox content:", error);
      }
    }
  }, [morphBox]);

  const handleAddParameter = async (parameter: Parameter) => {
    // Check if parameter is already in the box
    const exists = boxParameters.some(p => p.id === parameter.id);
    if (exists) {
      toast({
        title: "Parameter already added",
        description: "This parameter is already in your morphological box.",
        variant: "default",
      });
      return;
    }

    // Fetch attributes for this parameter
    try {
      const res = await fetch(`/api/parameters/${parameter.id}/attributes`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch attributes");
      
      const attributes = await res.json();
      
      // Add parameter with its attributes to the box
      setBoxParameters(prev => [...prev, { ...parameter, attributes }]);
      
      toast({
        title: "Parameter added",
        description: `${parameter.name} was added to your morphological box.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add parameter to the box.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveParameter = (parameterId: number) => {
    setParameterToDelete(parameterId);
    setDeleteDialogOpen(true);
  };

  const confirmRemoveParameter = () => {
    if (parameterToDelete !== null) {
      setBoxParameters(prev => prev.filter(p => p.id !== parameterToDelete));
      setParameterToDelete(null);
      setDeleteDialogOpen(false);
      
      toast({
        title: "Parameter removed",
        description: "Parameter was removed from your morphological box.",
      });
    }
  };

  const handleAttributeDelete = (parameterId: number, attributeId: number) => {
    setAttributeToDelete({ parameterId, attributeId });
    deleteAttributeMutation.mutate(attributeId);
  };

  const handleAddAttribute = (parameterId: number) => {
    // Simple prompt for attribute name
    const name = window.prompt("Enter attribute name");
    if (name && name.trim()) {
      addAttributeMutation.mutate({ parameterId, name: name.trim() });
    }
  };

  const handleMoveParameter = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === boxParameters.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newParameters = [...boxParameters];
    const [movedItem] = newParameters.splice(index, 1);
    newParameters.splice(newIndex, 0, movedItem);
    
    setBoxParameters(newParameters);
  };
  
  const handleUpdateParameterWeight = (parameterId: number) => {
    // Get current weight
    const parameter = boxParameters.find(p => p.id === parameterId);
    if (!parameter) return;
    
    const currentWeight = parameter.weight || 5;
    // Cycle through weights: 5 -> 7 -> 10 -> 3 -> 5
    const newWeight = currentWeight === 5 ? 7 : 
                      currentWeight === 7 ? 10 : 
                      currentWeight === 10 ? 3 : 5;
    
    // Update parameter weight
    setBoxParameters(prev => prev.map(p => 
      p.id === parameterId ? { ...p, weight: newWeight } : p
    ));
    
    toast({
      title: "Parameter importance updated",
      description: `${parameter.name} importance set to ${newWeight}/10`,
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your morphological box? This will remove all parameters.")) {
      setBoxParameters([]);
      toast({
        title: "Box reset",
        description: "Your morphological box has been reset.",
      });
    }
  };

  const handleSave = () => {
    // Save the current state
    const content = {
      parameters: boxParameters,
      lastSaved: new Date().toISOString()
    };
    
    onSave(content);
  };

  const handleGenerateCombinations = () => {
    if (boxParameters.length === 0) {
      toast({
        title: "No parameters",
        description: "Add parameters to generate combinations.",
        variant: "destructive"
      });
      return;
    }

    // Calculate the total number of possible combinations
    const totalCombinations = boxParameters.reduce((acc, param) => {
      // Skip parameters with no attributes
      if (param.attributes.length === 0) return acc;
      return acc * param.attributes.length;
    }, 1);

    // Generate a sample of combinations (limited to avoid performance issues)
    const sampleSize = Math.min(totalCombinations, 100);
    const sampleCombinations = [];
    
    // Generate sample combinations
    for (let i = 0; i < sampleSize; i++) {
      const combination: Record<string, string> = {};
      
      boxParameters.forEach(param => {
        if (param.attributes.length > 0) {
          // The higher the importance, the more likely this parameter's attributes will impact the combination
          // We use the importance weight to bias random selection
          
          // For engineering-important parameters (weight 7-10), we may try to select special attributes
          // For less important parameters (weight 1-3), we might skip or use defaults
          const importance = param.weight || 5;
          
          if (importance >= 7) {
            // For high importance parameters, we might want to bias toward certain attributes
            // For demo purposes, we're still using random selection
            const attributeIdx = Math.floor(Math.random() * param.attributes.length);
            combination[param.name] = param.attributes[attributeIdx].name;
          } 
          else if (importance <= 3 && Math.random() < 0.3) {
            // For low importance parameters, 30% chance to skip or use a default value
            // This makes combinations focus more on the important parameters
            combination[param.name] = "Default";
          }
          else {
            // Normal random selection for medium importance
            const attributeIdx = Math.floor(Math.random() * param.attributes.length);
            combination[param.name] = param.attributes[attributeIdx].name;
          }
        }
      });
      
      sampleCombinations.push(combination);
    }

    // Save the combinations in local storage for later access
    localStorage.setItem('morphologicalBoxCombinations', JSON.stringify({
      total: totalCombinations,
      sample: sampleCombinations,
      timestamp: new Date().toISOString()
    }));

    toast({
      title: "Combinations generated",
      description: `Total possible combinations: ${totalCombinations.toLocaleString()}. Sample of ${sampleSize} combinations created.`,
    });
    
    // Open combinations dialog (to be implemented)
    setCombinationsDialogOpen(true);
  };

  const isLoading = isLoadingParameters || isLoadingMorphBox;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold">Morphological Box</h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className={`bg-white bg-opacity-20 hover:bg-opacity-30 rounded py-1 px-2 text-xs ${
              viewMode === "compact" ? "bg-opacity-40" : ""
            }`}
            onClick={() => setViewMode("compact")}
          >
            <Grid className="h-3 w-3 mr-1" />
            <span>Compact</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`bg-white bg-opacity-20 hover:bg-opacity-30 rounded py-1 px-2 text-xs ${
              viewMode === "groups" ? "bg-opacity-40" : ""
            }`}
            onClick={() => setViewMode("groups")}
          >
            <Layers className="h-3 w-3 mr-1" />
            <span>Groups</span>
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : boxParameters.length === 0 ? (
          // Empty state
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
              <GridIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Create Your Morphological Box
            </h3>
            <p className="text-gray-500 mb-4">
              Drag parameters from the library to build your analysis
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Parameter
            </Button>
          </div>
        ) : (
          // Populated state
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/5">Parameter</TableHead>
                  <TableHead>Attributes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boxParameters.map((parameter, index) => (
                  <TableRow key={parameter.id} className="group hover:bg-gray-50">
                    <TableCell className="py-4">
                      <div className="flex items-center">
                        <div className={`h-4 w-1 bg-${parameter.color}-500 rounded-full mr-3`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 mr-2">
                                {parameter.name}
                              </div>
                              <div 
                                className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                                title="Click to change engineering importance"
                                onClick={() => handleUpdateParameterWeight(parameter.id)}
                              >
                                {parameter.weight || 5}/10
                              </div>
                            </div>
                            <div className="hidden group-hover:flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                onClick={() => handleMoveParameter(index, "up")}
                                disabled={index === 0}
                              >
                                <GripVertical className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                onClick={() => handleRemoveParameter(parameter.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-wrap gap-2">
                        {parameter.attributes.map((attribute) => (
                          <AttributeTag
                            key={attribute.id}
                            attribute={attribute}
                            color={parameter.color}
                            onDelete={(attrId) => handleAttributeDelete(parameter.id, attrId)}
                          />
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className={`bg-white border border-${parameter.color}-300 text-${parameter.color}-700 py-1 px-3 rounded-full text-xs font-medium flex items-center hover:bg-${parameter.color}-50`}
                          onClick={() => handleAddAttribute(parameter.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          <span>Add</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Drop zone */}
                <TableRow>
                  <TableCell colSpan={2} className="py-6">
                    <div
                      ref={drop}
                      className={`dropzone border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 ${
                        isOver ? "bg-primary/10" : ""
                      }`}
                    >
                      <p>Drag parameters here to add to your morphological box</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0">
            <span className="font-medium">{boxParameters.length}</span> parameters
            with{" "}
            <span className="font-medium">
              {boxParameters.reduce(
                (sum, param) => sum + param.attributes.length,
                0
              )}
            </span>{" "}
            attributes
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              <span>Reset</span>
            </Button>
            <Button onClick={handleGenerateCombinations} size="sm">
              <GridIcon className="h-4 w-4 mr-2" />
              <span>Generate Combinations</span>
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Parameter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this parameter from your morphological box?
              This action won't delete the parameter from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveParameter}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Combination Dialog */}
      <CombinationDialog 
        open={combinationsDialogOpen} 
        onOpenChange={setCombinationsDialogOpen}
        parameters={boxParameters}
      />
    </div>
  );
}
