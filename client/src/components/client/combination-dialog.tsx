"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MorphologicalBox, Solution } from "@/types/parameter";
import AttributeTag from "./attribute-tag";

interface CombinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  morphologicalBox: MorphologicalBox | null;
  onCreateSolution: (solution: Omit<Solution, "id" | "created_at" | "updated_at">) => void;
}

export default function CombinationDialog({
  open,
  onOpenChange,
  morphologicalBox,
  onCreateSolution
}: CombinationDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [solutionName, setSolutionName] = useState<string>("");
  const [solutionDescription, setSolutionDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [feasibilityRating, setFeasibilityRating] = useState<number>(50);
  const [costRating, setCostRating] = useState<number>(50);
  const [innovationRating, setInnovationRating] = useState<number>(50);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSolutionName("");
      setSolutionDescription("");
      setNotes("");
      setSelectedAttributes({});
      setFeasibilityRating(50);
      setCostRating(50);
      setInnovationRating(50);
      setActiveTab("manual");
    }
  }, [open]);

  const handleSelectAttribute = (parameterId: string, attributeId: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [parameterId]: attributeId
    }));
  };

  const handleCreateSolution = () => {
    if (!morphologicalBox) return;

    // Sammle alle ausgewählten Attribut-IDs
    const selected_attribute_ids = Object.values(selectedAttributes);

    // Berechne den durchschnittlichen Gesamtscore basierend auf den Bewertungen
    const total_score = (feasibilityRating + (100 - costRating) + innovationRating) / 3;

    const newSolution: Omit<Solution, "id" | "created_at" | "updated_at"> = {
      name: solutionName,
      description: solutionDescription,
      morphological_box_id: morphologicalBox.id,
      created_by_id: "user123", // Dies würde aus dem Authentifizierungskontext kommen
      selected_attribute_ids,
      total_score,
      feasibility_score: feasibilityRating,
      cost_score: costRating, // Niedrigere Kosten sind besser, daher wird es intern umgekehrt
      innovation_score: innovationRating,
      notes,
    };

    onCreateSolution(newSolution);
  };

  const handleAutomaticGeneration = () => {
    if (!morphologicalBox) return;

    // Simuliere einen Algorithmus zur automatischen Lösungsgenerierung
    // In einer realen Implementierung würde hier eine Bewertung der Attributkompatibilitäten erfolgen

    const newSelectedAttributes: Record<string, string> = {};

    // Wähle für jeden Parameter ein zufälliges Attribut aus
    morphologicalBox.parameters.forEach(parameter => {
      if (parameter.attributes.length > 0) {
        // In einer realen Implementierung würde man hier eine intelligentere Auswahl treffen
        const randomIndex = Math.floor(Math.random() * parameter.attributes.length);
        newSelectedAttributes[parameter.id] = parameter.attributes[randomIndex].id;
      }
    });

    setSelectedAttributes(newSelectedAttributes);
    setActiveTab("manual"); // Wechsle zum manuellen Tab, damit der Benutzer die Auswahl überprüfen kann

    // Setze einen Standardnamen basierend auf der aktuellen Zeit
    setSolutionName(`Automatische Lösung ${new Date().toLocaleTimeString()}`);
    setSolutionDescription("Automatisch generierte Lösung mit optimierter Attributkompatibilität.");
  };

  const isFormValid = () => {
    if (!solutionName.trim()) return false;

    // Prüfe, ob für jeden Parameter ein Attribut ausgewählt wurde
    if (!morphologicalBox) return false;

    const parameterCount = morphologicalBox.parameters.length;
    const attributeSelectionCount = Object.keys(selectedAttributes).length;

    return parameterCount === attributeSelectionCount;
  };

  // Zähle, wie viele Parameter aktuell ein ausgewähltes Attribut haben
  const selectedCount = morphologicalBox ?
    Object.keys(selectedAttributes).length : 0;

  const totalCount = morphologicalBox ?
    morphologicalBox.parameters.length : 0;

  const selectionProgress = totalCount > 0 ?
    Math.round((selectedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lösungskombination erstellen</DialogTitle>
        </DialogHeader>

        {!morphologicalBox ? (
          <Alert variant="destructive">
            <AlertDescription>
              Kein morphologischer Kasten geladen. Bitte laden Sie zuerst einen Kasten.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="manual">Manuelle Auswahl</TabsTrigger>
                <TabsTrigger value="automatic">Automatische Generierung</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="solution-name">Name der Lösung</Label>
                      <Input
                        id="solution-name"
                        value={solutionName}
                        onChange={(e) => setSolutionName(e.target.value)}
                        placeholder="Aussagekräftiger Name für diese Lösungskombination"
                      />
                    </div>

                    <div>
                      <Label htmlFor="solution-description">Beschreibung</Label>
                      <Textarea
                        id="solution-description"
                        value={solutionDescription}
                        onChange={(e) => setSolutionDescription(e.target.value)}
                        placeholder="Detaillierte Beschreibung der Lösung"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="solution-notes">Notizen</Label>
                      <Textarea
                        id="solution-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Zusätzliche Notizen, Überlegungen oder Referenzen"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="flex justify-between">
                        <span>Technische Machbarkeit</span>
                        <span className="text-muted-foreground">{feasibilityRating}%</span>
                      </Label>
                      <Slider
                        value={[feasibilityRating]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setFeasibilityRating(value[0])}
                        className="my-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Schwierig</span>
                        <span>Leicht umsetzbar</span>
                      </div>
                    </div>

                    <div>
                      <Label className="flex justify-between">
                        <span>Kosten</span>
                        <span className="text-muted-foreground">{costRating}%</span>
                      </Label>
                      <Slider
                        value={[costRating]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setCostRating(value[0])}
                        className="my-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Niedrig</span>
                        <span>Hoch</span>
                      </div>
                    </div>

                    <div>
                      <Label className="flex justify-between">
                        <span>Innovationsgrad</span>
                        <span className="text-muted-foreground">{innovationRating}%</span>
                      </Label>
                      <Slider
                        value={[innovationRating]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setInnovationRating(value[0])}
                        className="my-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Konventionell</span>
                        <span>Hochinnovativ</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Attribut-Auswahl</Label>
                        <span className="text-sm text-muted-foreground">{selectedCount}/{totalCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${selectionProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4 mt-4">
                  <h3 className="text-sm font-medium mb-4">Parameter-Attribut-Auswahl</h3>
                  <div className="space-y-4">
                    {morphologicalBox.parameters.map((parameter) => (
                      <div key={parameter.id} className="space-y-2">
                        <Label>{parameter.name}</Label>
                        <Select
                          value={selectedAttributes[parameter.id] || ""}
                          onValueChange={(value) => handleSelectAttribute(parameter.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Attribut auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {parameter.attributes.map((attribute) => (
                              <SelectItem key={attribute.id} value={attribute.id}>
                                {attribute.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedAttributes[parameter.id] && (
                          <div className="mt-1">
                            <AttributeTag
                              attribute={parameter.attributes.find(a => a.id === selectedAttributes[parameter.id])!}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="automatic" className="space-y-4">
                <div className="text-center p-6 border rounded-md">
                  <h3 className="text-lg font-semibold mb-4">Automatische Lösungsgenerierung</h3>
                  <p className="mb-6 text-gray-600">
                    Basierend auf Kompatibilitätsbewertungen und Parametergewichtungen kann das System
                    optimierte Lösungskombinationen vorschlagen. Dies ist besonders nützlich bei
                    komplexen morphologischen Kästen mit vielen Parametern.
                  </p>
                  <Button onClick={handleAutomaticGeneration}>
                    Optimale Lösung generieren
                  </Button>
                </div>

                <div className="p-4 bg-primary/5 rounded-md">
                  <h4 className="font-medium mb-2">Generierungsoptionen</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    In einer vollständigen Implementierung könnten hier weitere Optionen
                    für den Generierungsalgorithmus angeboten werden:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Optimierung nach technischer Machbarkeit</li>
                    <li>Kostenminimierung</li>
                    <li>Maximierung des Innovationsgrads</li>
                    <li>Gleichgewichtete Optimierung aller Kriterien</li>
                    <li>Generierung mehrerer Varianten</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleCreateSolution}
            disabled={!isFormValid()}
          >
            Lösung erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}