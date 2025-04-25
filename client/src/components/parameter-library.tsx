import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Parameter, Attribute, InsertParameter } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import ParameterCard from "./parameter-card";
import CreateParameterDialog from "./create-parameter-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ParameterLibrary() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<
    Parameter | undefined
  >(undefined);

  // Fetch parameters
  const { data: parameters, isLoading: isLoadingParameters } = useQuery<
    Parameter[]
  >({
    queryKey: ["/api/parameters"],
  });

  // Create parameter mutation
  const createParameterMutation = useMutation({
    mutationFn: async ({
      parameter,
      attributes,
    }: {
      parameter: InsertParameter;
      attributes: string[];
    }) => {
      const parameterResponse = await apiRequest(
        "POST",
        "/api/parameters",
        parameter
      );
      const newParameter = await parameterResponse.json();

      // Create attributes in parallel
      const attributePromises = attributes.map(attributeName => 
        apiRequest("POST", "/api/attributes", {
          name: attributeName,
          parameterId: newParameter.id,
        })
      );

      await Promise.all(attributePromises);

      // Invalidate parameters query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/parameters"] });

      return newParameter;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parameters"] });
      toast({
        title: `Parameter ${editingParameter ? "updated" : "created"}`,
        description: `Parameter was successfully ${editingParameter ? "updated" : "created"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingParameter ? "update" : "create"} parameter: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete parameter mutation
  const deleteParameterMutation = useMutation({
    mutationFn: async (parameterId: number) => {
      await apiRequest("DELETE", `/api/parameters/${parameterId}`);
      return parameterId;
    },
    onSuccess: (parameterId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parameters"] });
      toast({
        title: "Parameter deleted",
        description: "Parameter was successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete parameter: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateParameter = (
    parameter: InsertParameter,
    attributes: string[],
  ) => {
    createParameterMutation.mutate({ parameter, attributes });
  };

  const handleEditParameter = (parameter: Parameter) => {
    setEditingParameter(parameter);
    setCreateDialogOpen(true);
  };

  const handleDeleteParameter = (parameterId: number) => {
    deleteParameterMutation.mutate(parameterId);
  };

  // Filter parameters based on search term
  const filteredParameters =
    searchTerm && parameters
      ? parameters.filter((param) =>
          param.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : parameters;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold">Parameter Library</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
          onClick={() => {
            setEditingParameter(undefined);
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Search parameters..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Drag parameters to your box
          </h4>

          {isLoadingParameters ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredParameters && filteredParameters.length > 0 ? (
            filteredParameters.map((parameter) => (
              <ParameterCard
                key={parameter.id}
                parameter={parameter}
                onEdit={handleEditParameter}
                onDelete={handleDeleteParameter}
              />
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchTerm
                ? "No parameters match your search."
                : "No parameters yet. Create your first one!"}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          variant="outline"
          onClick={() => {
            setEditingParameter(undefined);
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add New Parameter</span>
        </Button>
      </div>

      <CreateParameterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateParameter}
        editingParameter={editingParameter}
      />
    </div>
  );
}