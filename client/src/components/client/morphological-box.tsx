"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MorphologicalBox,
  MorphoParameter,
  MorphoAttribute,
  Solution,
  AttributeCompatibility
} from "@/types/parameter";
import { useToast } from "@/hooks/use-toast";
import ParameterCard from "./parameter-card";
import MorphBoxToolbar from "./morph-box-toolbar";
import CreateParameterDialog from "./create-parameter-dialog";
import ExportDialog from "./export-dialog";
import ShareDialog from "./share-dialog";
import AttributeTag from "./attribute-tag";
import CompatibilityMatrix from "./compatibility-matrix";
import CombinationDialog from "./combination-dialog";

interface MorphologicalBoxProps {
  boxId?: string;
  isTemplate?: boolean;
  isReadOnly?: boolean;
  onSave?: (content: any) => void;
}

export default function MorphologicalBoxComponent({
  boxId,
  isTemplate = false,
  isReadOnly = false,
  onSave,
}: MorphologicalBoxProps) {
  const { toast } = useToast();
  const [active_box, setActiveBox] = useState<MorphologicalBox | null>(null);
  const [active_tab, setActiveTab] = useState<string>("editor");
  const [is_create_parameter_open, setIsCreateParameterOpen] = useState(false);
  const [is_share_dialog_open, setIsShareDialogOpen] = useState(false);
  const [is_export_dialog_open, setIsExportDialogOpen] = useState(false);
  const [is_combination_dialog_open, setIsCombinationDialogOpen] = useState(false);
  const [selected_solution, setSelectedSolution] = useState<Solution | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [box_title, setBoxTitle] = useState<string>("Morphologischer Kasten");
  const [last_saved, setLastSaved] = useState<string | undefined>(undefined);
  const [is_saved, setIsSaved] = useState(false);

  // Beispiel-Query für den Morphologischen Kasten
  const { data: boxData, isLoading } = useQuery({
    queryKey: ["morphological-box", boxId],
    queryFn: async () => {
      if (!boxId) return null;
      // TODO: API-Anruf implementieren
      // Hier könnte ein Beispiel sein, wie Daten für das Beispiel aussehen würden
      const mockData: MorphologicalBox = {
        id: boxId,
        name: "Engineering Problem Solving",
        description: "Morphologischer Kasten für systematische Problemlösung im Engineering",
        is_public: false,
        is_template: isTemplate,
        owner_id: "user123",
        version: 1,
        parameters: [
          {
            id: "p1",
            name: "Problemanalyse-Methode",
            description: "Methoden zur Analyse des Problems",
            order: 0,
            morphological_box_id: boxId,
            attributes: [
              { id: "a1", name: "Root Cause Analysis", order: 0, parameter_id: "p1", created_at: new Date(), updated_at: new Date() },
              { id: "a2", name: "Fishbone-Diagramm", order: 1, parameter_id: "p1", created_at: new Date(), updated_at: new Date() },
              { id: "a3", name: "FMEA", order: 2, parameter_id: "p1", created_at: new Date(), updated_at: new Date() },
              { id: "a4", name: "System Thinking", order: 3, parameter_id: "p1", created_at: new Date(), updated_at: new Date() }
            ],
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: "p2",
            name: "Datenerfassung",
            description: "Methoden zur Datensammlung",
            order: 1,
            morphological_box_id: boxId,
            attributes: [
              { id: "a5", name: "Messinstrumente", order: 0, parameter_id: "p2", created_at: new Date(), updated_at: new Date() },
              { id: "a6", name: "Sensorik", order: 1, parameter_id: "p2", created_at: new Date(), updated_at: new Date() },
              { id: "a7", name: "Simulation", order: 2, parameter_id: "p2", created_at: new Date(), updated_at: new Date() },
              { id: "a8", name: "Beobachtung", order: 3, parameter_id: "p2", created_at: new Date(), updated_at: new Date() }
            ],
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: "p3",
            name: "Lösungsansatz",
            description: "Grundlegende Herangehensweise an die Lösung",
            order: 2,
            morphological_box_id: boxId,
            attributes: [
              { id: "a9", name: "Standardlösung anpassen", order: 0, parameter_id: "p3", created_at: new Date(), updated_at: new Date() },
              { id: "a10", name: "Von Grund auf neu", order: 1, parameter_id: "p3", created_at: new Date(), updated_at: new Date() },
              { id: "a11", name: "Reverse Engineering", order: 2, parameter_id: "p3", created_at: new Date(), updated_at: new Date() },
              { id: "a12", name: "Biomimetik", order: 3, parameter_id: "p3", created_at: new Date(), updated_at: new Date() }
            ],
            created_at: new Date(),
            updated_at: new Date()
          },
        ],
        created_at: new Date(),
        updated_at: new Date()
      };

      return mockData;
    },
    enabled: !!boxId,
  });

  // Mutation zum Speichern von Änderungen
  const saveMutation = useMutation({
    mutationFn: async (box: MorphologicalBox) => {
      // TODO: API-Anruf implementieren
      return box;
    },
    onSuccess: () => {
      toast({
        title: "Änderungen gespeichert",
        description: "Der morphologische Kasten wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  // Mutation zum Erstellen eines neuen Parameters
  const createParameterMutation = useMutation({
    mutationFn: async (parameter: Omit<MorphoParameter, "id" | "created_at" | "updated_at">) => {
      // TODO: API-Anruf implementieren
      // Generiere eine temporäre ID für den neuen Parameter
      const paramId = `p${Date.now()}`;

      // Erstelle Attribut-Objekte mit temporären IDs
      const attributes = parameter.attributes.map((attr, index) => ({
        ...attr,
        id: `a${Date.now()}_${index}`,
        parameter_id: paramId,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const newParameter: MorphoParameter = {
        ...parameter,
        id: paramId,
        attributes: attributes,
        created_at: new Date(),
        updated_at: new Date(),
      };

      return newParameter;
    },
    onSuccess: (newParameter) => {
      if (active_box) {
        setActiveBox({
          ...active_box,
          parameters: [...active_box.parameters, newParameter],
        });
        toast({
          title: "Parameter erstellt",
          description: `Der Parameter "${newParameter.name}" wurde erfolgreich hinzugefügt.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Erstellen des Parameters",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  // Effekt zum Setzen des aktiven Kastens
  useEffect(() => {
    if (boxData) {
      setActiveBox(boxData);
      setBoxTitle(boxData.name);
    }
  }, [boxData]);

  // Handler für Drag-and-Drop-Ende
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id || !active_box) return;

    // Handle Parameter reordering
    if (typeof active.id === 'string' && typeof over.id === 'string' &&
      active.id.startsWith('p') && over.id.startsWith('p')) {
      const oldIndex = active_box.parameters.findIndex(p => p.id === active.id);
      const newIndex = active_box.parameters.findIndex(p => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newParameters = [...active_box.parameters];
        const [movedParameter] = newParameters.splice(oldIndex, 1);
        newParameters.splice(newIndex, 0, movedParameter);

        // Update order values
        const updatedParameters = newParameters.map((param, index) => ({
          ...param,
          order: index,
        }));

        setActiveBox({
          ...active_box,
          parameters: updatedParameters,
        });
      }
    }

    // Handle Attribute reordering within a Parameter
    if (typeof active.id === 'string' && typeof over.id === 'string' &&
      active.id.startsWith('a') && over.id.startsWith('a')) {
      // Extract parameter ID from data attributes or context
      const activeParamId = (active.data?.current as any)?.parameterId;
      const overParamId = (over.data?.current as any)?.parameterId;

      if (activeParamId && overParamId && activeParamId === overParamId) {
        const paramIndex = active_box.parameters.findIndex(p => p.id === activeParamId);

        if (paramIndex !== -1) {
          const attributes = [...active_box.parameters[paramIndex].attributes];
          const oldIndex = attributes.findIndex(a => a.id === active.id);
          const newIndex = attributes.findIndex(a => a.id === over.id);

          if (oldIndex !== -1 && newIndex !== -1) {
            const [movedAttribute] = attributes.splice(oldIndex, 1);
            attributes.splice(newIndex, 0, movedAttribute);

            // Update order values
            const updatedAttributes = attributes.map((attr, index) => ({
              ...attr,
              order: index,
            }));

            const updatedParameters = [...active_box.parameters];
            updatedParameters[paramIndex] = {
              ...updatedParameters[paramIndex],
              attributes: updatedAttributes,
            };

            setActiveBox({
              ...active_box,
              parameters: updatedParameters,
            });
          }
        }
      }
    }
  };

  // Speichern des aktuellen Stands
  const HandleSave = () => {
    if (active_box) {
      saveMutation.mutate(active_box);
      setIsSaved(true);
      setLastSaved(new Date().toISOString());

      if (onSave) {
        onSave(active_box);
      }
    }
  };

  // Handler für Parameter-Erstellung
  const handleCreateParameter = (parameterData: Omit<MorphoParameter, "id" | "created_at" | "updated_at">) => {
    createParameterMutation.mutate({
      ...parameterData,
      morphological_box_id: boxId || "",
      order: active_box?.parameters.length || 0,
    });
  };

  // Handler für Lösungskombination
  const handleCreateSolution = (solution: Omit<Solution, "id" | "created_at" | "updated_at">) => {
    // Hier würde die API-Integration stattfinden
    const newSolution: Solution = {
      ...solution,
      id: `sol${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setSolutions([...solutions, newSolution]);
    setSelectedSolution(newSolution);
    setIsCombinationDialogOpen(false);

    toast({
      title: "Lösung erstellt",
      description: `Die Lösung "${newSolution.name}" wurde erfolgreich erstellt.`,
    });
  };

  // Handler für das Teilen des morphologischen Kastens
  const handleShare = (userId: string, canEdit: boolean) => {
    // Hier würde die API-Integration stattfinden
    toast({
      title: "Kasten geteilt",
      description: `Der morphologische Kasten wurde erfolgreich geteilt.`,
    });
  };

  // Handler für den Export des morphologischen Kastens
  const handleExport = (format: string) => {
    // Hier würde die Export-Logik stattfinden
    toast({
      title: "Export gestartet",
      description: `Der Export im Format ${format} wurde gestartet.`,
    });
  };

  // Handler für Kompatibilitätsupdate
  const handleUpdateCompatibility = (compatibilityData: AttributeCompatibility[]) => {
    // Hier würde die Logik zum Aktualisieren der Kompatibilitätsdaten stehen
    toast({
      title: "Kompatibilität aktualisiert",
      description: "Die Kompatibilitätsmatrix wurde aktualisiert.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!active_box && !isLoading) {
    return (
      <Alert>
        <AlertTitle>Kein morphologischer Kasten gefunden</AlertTitle>
        <AlertDescription>
          Der angeforderte morphologische Kasten konnte nicht gefunden werden oder Sie haben keine Berechtigung, ihn anzusehen.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {active_box && (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">{active_box.name}</h1>
                <p className="text-sm text-gray-500">{active_box.description}</p>
              </div>

              <MorphBoxToolbar
                onSave={HandleSave}
                onAddParameter={() => setIsCreateParameterOpen(true)}
                onShare={() => setIsShareDialogOpen(true)}
                onExport={() => setIsExportDialogOpen(true)}
                onCreateSolution={() => setIsCombinationDialogOpen(true)}
                isReadOnly={isReadOnly}
                isSaving={saveMutation.isPending}
                title={box_title}
                onTitleChange={setBoxTitle}
                lastSaved={last_saved}
                isSaved={is_saved}
                collaborators={[]}
              />
            </div>
          </div>

          <Tabs value={active_tab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="solutions">Lösungen</TabsTrigger>
              <TabsTrigger value="compatibility">Kompatibilitätsmatrix</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={active_box.parameters.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {active_box.parameters.map((parameter) => (
                      <ParameterCard
                        key={parameter.id}
                        parameter={parameter}
                        isReadOnly={isReadOnly}
                        onUpdate={(updatedParameter: MorphoParameter) => {
                          const updatedParameters = active_box.parameters.map(p =>
                            p.id === updatedParameter.id ? updatedParameter : p
                          );
                          setActiveBox({
                            ...active_box,
                            parameters: updatedParameters,
                          });
                        }}
                        onDelete={(parameterId: string) => {
                          const updatedParameters = active_box.parameters.filter(p => p.id !== parameterId);
                          setActiveBox({
                            ...active_box,
                            parameters: updatedParameters,
                          });
                          toast({
                            title: "Parameter gelöscht",
                            description: "Der Parameter wurde erfolgreich entfernt.",
                          });
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {active_box.parameters.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500 mb-4">Noch keine Parameter vorhanden.</p>
                    {!isReadOnly && (
                      <Button onClick={() => setIsCreateParameterOpen(true)}>
                        Parameter hinzufügen
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generierte Lösungen</CardTitle>
                </CardHeader>
                <CardContent>
                  {solutions.length > 0 ? (
                    <div className="space-y-4">
                      {solutions.map(solution => (
                        <Card key={solution.id} className={`cursor-pointer transition-all ${selected_solution?.id === solution.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`} onClick={() => setSelectedSolution(solution)}>
                          <CardContent className="p-4">
                            <h3 className="font-medium">{solution.name}</h3>
                            <p className="text-sm text-gray-500">{solution.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {solution.selected_attribute_ids.map(attrId => {
                                // Finde das passende Attribut und seinen Parameter
                                let attribute: MorphoAttribute | undefined;
                                let parameter: MorphoParameter | undefined;

                                for (const p of active_box.parameters) {
                                  const a = p.attributes.find(a => a.id === attrId);
                                  if (a) {
                                    attribute = a;
                                    parameter = p;
                                    break;
                                  }
                                }

                                if (attribute && parameter) {
                                  return (
                                    <div key={attrId} className="flex flex-col items-start">
                                      <span className="text-xs text-gray-500">{parameter.name}</span>
                                      <AttributeTag attribute={attribute} />
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">Noch keine Lösungen erstellt.</p>
                      <Button onClick={() => setIsCombinationDialogOpen(true)}>
                        Lösung erstellen
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selected_solution && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lösungsdetails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Name</h3>
                        <p>{selected_solution.name}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Beschreibung</h3>
                        <p>{selected_solution.description || "Keine Beschreibung verfügbar."}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Ausgewählte Attribute</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {active_box.parameters.map(parameter => {
                            const selectedAttrId = selected_solution.selected_attribute_ids.find(attrId =>
                              parameter.attributes.some(a => a.id === attrId)
                            );

                            const selectedAttr = selectedAttrId ?
                              parameter.attributes.find(a => a.id === selectedAttrId) :
                              undefined;

                            return (
                              <div key={parameter.id} className="p-2 border rounded-md">
                                <h4 className="font-medium">{parameter.name}</h4>
                                {selectedAttr ? (
                                  <AttributeTag attribute={selectedAttr} />
                                ) : (
                                  <span className="text-gray-400 text-sm">Keine Auswahl</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {(selected_solution.total_score !== undefined ||
                        selected_solution.feasibility_score !== undefined ||
                        selected_solution.cost_score !== undefined ||
                        selected_solution.innovation_score !== undefined) && (
                          <div>
                            <h3 className="font-semibold">Bewertungen</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                              {selected_solution.total_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Gesamtwertung</h4>
                                  <p className="font-bold">{selected_solution.total_score}</p>
                                </div>
                              )}

                              {selected_solution.feasibility_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Technische Machbarkeit</h4>
                                  <p className="font-bold">{selected_solution.feasibility_score}</p>
                                </div>
                              )}

                              {selected_solution.cost_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Kosten</h4>
                                  <p className="font-bold">{selected_solution.cost_score}</p>
                                </div>
                              )}

                              {selected_solution.innovation_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Innovation</h4>
                                  <p className="font-bold">{selected_solution.innovation_score}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {selected_solution.notes && (
                        <div>
                          <h3 className="font-semibold">Notizen</h3>
                          <p className="mt-1">{selected_solution.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="compatibility">
              <CompatibilityMatrix
                morphologicalBox={active_box}
                isReadOnly={isReadOnly}
                onUpdateCompatibility={handleUpdateCompatibility}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialoge */}
      <CreateParameterDialog
        open={is_create_parameter_open}
        onOpenChange={setIsCreateParameterOpen}
        onCreateParameter={handleCreateParameter}
      />

      <ShareDialog
        open={is_share_dialog_open}
        onOpenChange={setIsShareDialogOpen}
        onShare={handleShare}
      />

      <ExportDialog
        open={is_export_dialog_open}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
      />

      <CombinationDialog
        open={is_combination_dialog_open}
        onOpenChange={setIsCombinationDialogOpen}
        morphologicalBox={active_box}
        onCreateSolution={handleCreateSolution}
      />
    </div>
  );
}
