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
}

export default function MorphologicalBoxComponent({
  boxId,
  isTemplate = false,
  isReadOnly = false,
}: MorphologicalBoxProps) {
  const { toast } = useToast();
  const [activeBox, setActiveBox] = useState<MorphologicalBox | null>(null);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [isCreateParameterOpen, setIsCreateParameterOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isCombinationDialogOpen, setIsCombinationDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);

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
      if (activeBox) {
        setActiveBox({
          ...activeBox,
          parameters: [...activeBox.parameters, newParameter],
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
    }
  }, [boxData]);

  // Handler für Drag-and-Drop-Ende
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id || !activeBox) return;

    // Handle Parameter reordering
    if (typeof active.id === 'string' && typeof over.id === 'string' &&
      active.id.startsWith('p') && over.id.startsWith('p')) {
      const oldIndex = activeBox.parameters.findIndex(p => p.id === active.id);
      const newIndex = activeBox.parameters.findIndex(p => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newParameters = [...activeBox.parameters];
        const [movedParameter] = newParameters.splice(oldIndex, 1);
        newParameters.splice(newIndex, 0, movedParameter);

        // Update order values
        const updatedParameters = newParameters.map((param, index) => ({
          ...param,
          order: index,
        }));

        setActiveBox({
          ...activeBox,
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
        const paramIndex = activeBox.parameters.findIndex(p => p.id === activeParamId);

        if (paramIndex !== -1) {
          const attributes = [...activeBox.parameters[paramIndex].attributes];
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

            const updatedParameters = [...activeBox.parameters];
            updatedParameters[paramIndex] = {
              ...updatedParameters[paramIndex],
              attributes: updatedAttributes,
            };

            setActiveBox({
              ...activeBox,
              parameters: updatedParameters,
            });
          }
        }
      }
    }
  };

  // Speichern des aktuellen Stands
  const handleSave = () => {
    if (activeBox) {
      saveMutation.mutate(activeBox);
    }
  };

  // Handler für Parameter-Erstellung
  const handleCreateParameter = (parameterData: Omit<MorphoParameter, "id" | "created_at" | "updated_at">) => {
    createParameterMutation.mutate({
      ...parameterData,
      morphological_box_id: boxId || "",
      order: activeBox?.parameters.length || 0,
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

  if (!activeBox && !isLoading) {
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
      {activeBox && (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">{activeBox.name}</h1>
                <p className="text-sm text-gray-500">{activeBox.description}</p>
              </div>

              <MorphBoxToolbar
                onSave={handleSave}
                onAddParameter={() => setIsCreateParameterOpen(true)}
                onShare={() => setIsShareDialogOpen(true)}
                onExport={() => setIsExportDialogOpen(true)}
                onCreateSolution={() => setIsCombinationDialogOpen(true)}
                isReadOnly={isReadOnly}
                isSaving={saveMutation.isPending}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="solutions">Lösungen</TabsTrigger>
              <TabsTrigger value="compatibility">Kompatibilitätsmatrix</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={activeBox.parameters.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {activeBox.parameters.map((parameter) => (
                      <ParameterCard
                        key={parameter.id}
                        parameter={parameter}
                        isReadOnly={isReadOnly}
                        onUpdate={(updatedParameter: MorphoParameter) => {
                          const updatedParameters = activeBox.parameters.map(p =>
                            p.id === updatedParameter.id ? updatedParameter : p
                          );
                          setActiveBox({
                            ...activeBox,
                            parameters: updatedParameters,
                          });
                        }}
                        onDelete={(parameterId: string) => {
                          const updatedParameters = activeBox.parameters.filter(p => p.id !== parameterId);
                          setActiveBox({
                            ...activeBox,
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

              {activeBox.parameters.length === 0 && (
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
                        <Card key={solution.id} className={`cursor-pointer transition-all ${selectedSolution?.id === solution.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`} onClick={() => setSelectedSolution(solution)}>
                          <CardContent className="p-4">
                            <h3 className="font-medium">{solution.name}</h3>
                            <p className="text-sm text-gray-500">{solution.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {solution.selected_attribute_ids.map(attrId => {
                                // Finde das passende Attribut und seinen Parameter
                                let attribute: MorphoAttribute | undefined;
                                let parameter: MorphoParameter | undefined;

                                for (const p of activeBox.parameters) {
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

              {selectedSolution && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lösungsdetails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Name</h3>
                        <p>{selectedSolution.name}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Beschreibung</h3>
                        <p>{selectedSolution.description || "Keine Beschreibung verfügbar."}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Ausgewählte Attribute</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {activeBox.parameters.map(parameter => {
                            const selectedAttrId = selectedSolution.selected_attribute_ids.find(attrId =>
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

                      {(selectedSolution.total_score !== undefined ||
                        selectedSolution.feasibility_score !== undefined ||
                        selectedSolution.cost_score !== undefined ||
                        selectedSolution.innovation_score !== undefined) && (
                          <div>
                            <h3 className="font-semibold">Bewertungen</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                              {selectedSolution.total_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Gesamtwertung</h4>
                                  <p className="font-bold">{selectedSolution.total_score}</p>
                                </div>
                              )}

                              {selectedSolution.feasibility_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Technische Machbarkeit</h4>
                                  <p className="font-bold">{selectedSolution.feasibility_score}</p>
                                </div>
                              )}

                              {selectedSolution.cost_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Kosten</h4>
                                  <p className="font-bold">{selectedSolution.cost_score}</p>
                                </div>
                              )}

                              {selectedSolution.innovation_score !== undefined && (
                                <div className="p-2 border rounded-md">
                                  <h4 className="text-sm text-gray-500">Innovation</h4>
                                  <p className="font-bold">{selectedSolution.innovation_score}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {selectedSolution.notes && (
                        <div>
                          <h3 className="font-semibold">Notizen</h3>
                          <p className="mt-1">{selectedSolution.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="compatibility">
              <CompatibilityMatrix
                morphologicalBox={activeBox}
                isReadOnly={isReadOnly}
                onUpdateCompatibility={handleUpdateCompatibility}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialoge */}
      <CreateParameterDialog
        open={isCreateParameterOpen}
        onOpenChange={setIsCreateParameterOpen}
        onCreateParameter={handleCreateParameter}
      />

      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        onShare={handleShare}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
      />

      <CombinationDialog
        open={isCombinationDialogOpen}
        onOpenChange={setIsCombinationDialogOpen}
        morphologicalBox={activeBox}
        onCreateSolution={handleCreateSolution}
      />
    </div>
  );
}
