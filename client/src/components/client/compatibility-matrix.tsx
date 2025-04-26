"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MorphologicalBox, AttributeCompatibility } from "@/types/parameter";
import AttributeTag from "./attribute-tag";

interface CompatibilityMatrixProps {
  morphologicalBox: MorphologicalBox | null;
  isReadOnly?: boolean;
  onUpdateCompatibility: (compatibilityData: AttributeCompatibility[]) => void;
}

export default function CompatibilityMatrix({
  morphologicalBox,
  isReadOnly = false,
  onUpdateCompatibility
}: CompatibilityMatrixProps) {
  const [activeParameterIndex, setActiveParameterIndex] = useState<number>(0);
  const [compatibilityData, setCompatibilityData] = useState<AttributeCompatibility[]>([]);
  const [activePair, setActivePair] = useState<{ attr1Id: string, attr2Id: string; } | null>(null);

  useEffect(() => {
    // Hier würde man die Kompatibilitätsdaten aus der API laden
    // Für dieses Beispiel verwenden wir leere Daten
    if (morphologicalBox) {
      setCompatibilityData([]);
    }
  }, [morphologicalBox]);

  if (!morphologicalBox) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Kein morphologischer Kasten geladen.</p>
        </CardContent>
      </Card>
    );
  }

  if (morphologicalBox.parameters.length < 2) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Mindestens zwei Parameter sind erforderlich, um eine Kompatibilitätsmatrix zu erstellen.</p>
        </CardContent>
      </Card>
    );
  }

  const getCompatibilityScore = (attr1Id: string, attr2Id: string): number => {
    const match = compatibilityData.find(
      c => (c.attribute_id_1 === attr1Id && c.attribute_id_2 === attr2Id) ||
        (c.attribute_id_1 === attr2Id && c.attribute_id_2 === attr1Id)
    );

    return match ? match.compatibility_score : 0;
  };

  const handleCompatibilityChange = (attr1Id: string, attr2Id: string, score: -2 | -1 | 0 | 1 | 2) => {
    if (isReadOnly) return;

    const existingIndex = compatibilityData.findIndex(
      c => (c.attribute_id_1 === attr1Id && c.attribute_id_2 === attr2Id) ||
        (c.attribute_id_1 === attr2Id && c.attribute_id_2 === attr1Id)
    );

    let newData = [...compatibilityData];

    if (existingIndex >= 0) {
      // Aktualisieren eines bestehenden Eintrags
      newData[existingIndex] = {
        ...newData[existingIndex],
        compatibility_score: score,
        updated_at: new Date()
      };
    } else {
      // Erstellen eines neuen Eintrags
      newData.push({
        id: `comp_${Date.now()}`,
        morphological_box_id: morphologicalBox.id,
        attribute_id_1: attr1Id,
        attribute_id_2: attr2Id,
        compatibility_score: score,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    setCompatibilityData(newData);
    onUpdateCompatibility(newData);
  };

  const getScoreColor = (score: number): string => {
    switch (score) {
      case -2: return "bg-red-500 text-white";
      case -1: return "bg-orange-300";
      case 0: return "bg-gray-100";
      case 1: return "bg-green-300";
      case 2: return "bg-green-500 text-white";
      default: return "bg-gray-100";
    }
  };

  const getScoreLabel = (score: number): string => {
    switch (score) {
      case -2: return "Nicht kompatibel";
      case -1: return "Eher nicht kompatibel";
      case 0: return "Neutral";
      case 1: return "Eher kompatibel";
      case 2: return "Sehr kompatibel";
      default: return "Nicht bewertet";
    }
  };

  // Behebe Typfehler in der Zeile, die diesen Parameter verwendet
  const getAttributeFromId = (attributeId: string) => {
    for (const param of morphologicalBox.parameters) {
      const attr = param.attributes.find(a => a.id === attributeId);
      if (attr) return attr;
    }
    return null;
  };

  // Bestimme den aktiven Parameter und alle anderen Parameter
  const activeParameter = morphologicalBox.parameters[activeParameterIndex];
  const otherParameters = morphologicalBox.parameters.filter((_, index) => index !== activeParameterIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kompatibilitätsmatrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Parameter auswählen:</label>
            <Tabs
              value={activeParameterIndex.toString()}
              onValueChange={(value) => setActiveParameterIndex(parseInt(value))}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                {morphologicalBox.parameters.map((param, index) => (
                  <TabsTrigger
                    key={param.id}
                    value={index.toString()}
                    className="text-xs"
                  >
                    {param.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">
                    <div className="font-medium text-center p-2 bg-primary/5 rounded-sm">
                      {activeParameter.name}
                    </div>
                  </TableHead>
                  {otherParameters.map(param => (
                    <TableHead key={param.id} className="text-center">
                      <div className="transform -rotate-45 origin-left translate-y-1/4 whitespace-nowrap font-medium p-2">
                        {param.name}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {activeParameter.attributes.map(attr1 => (
                  <TableRow key={attr1.id}>
                    <TableCell className="font-medium border-r">
                      <AttributeTag attribute={attr1} />
                    </TableCell>

                    {otherParameters.map(param => (
                      <React.Fragment key={param.id}>
                        {param.attributes.map(attr2 => (
                          <TableCell key={attr2.id} className="text-center p-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className={`w-8 h-8 p-0 ${getScoreColor(getCompatibilityScore(attr1.id, attr2.id))}`}
                                    onClick={() => setActivePair({ attr1Id: attr1.id, attr2Id: attr2.id })}
                                    disabled={isReadOnly}
                                  >
                                    {getCompatibilityScore(attr1.id, attr2.id)}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <p className="font-semibold">Kompatibilität zwischen:</p>
                                    <p>{attr1.name}</p>
                                    <p>und</p>
                                    <p>{attr2.name}</p>
                                    <p className="mt-1 font-medium">{getScoreLabel(getCompatibilityScore(attr1.id, attr2.id))}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {activePair && !isReadOnly && (
            <Card className="mt-4 p-2">
              <CardContent className="p-2">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Kompatibilität bewerten</p>
                      <div className="flex items-center gap-2 mt-1">
                        {(() => {
                          // Finde die passenden Attribute
                          const attr1 = getAttributeFromId(activePair.attr1Id);
                          const attr2 = getAttributeFromId(activePair.attr2Id);

                          if (attr1 && attr2) {
                            return (
                              <>
                                <AttributeTag attribute={attr1} />
                                <span>und</span>
                                <AttributeTag attribute={attr2} />
                              </>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePair(null)}
                    >
                      Schließen
                    </Button>
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => handleCompatibilityChange(activePair.attr1Id, activePair.attr2Id, -2)}
                    >
                      Nicht kompatibel (-2)
                    </Button>
                    <Button
                      className="flex-1 bg-orange-400 hover:bg-orange-500"
                      onClick={() => handleCompatibilityChange(activePair.attr1Id, activePair.attr2Id, -1)}
                    >
                      Eher nicht (-1)
                    </Button>
                    <Button
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                      onClick={() => handleCompatibilityChange(activePair.attr1Id, activePair.attr2Id, 0)}
                    >
                      Neutral (0)
                    </Button>
                    <Button
                      className="flex-1 bg-green-400 hover:bg-green-500"
                      onClick={() => handleCompatibilityChange(activePair.attr1Id, activePair.attr2Id, 1)}
                    >
                      Eher ja (+1)
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleCompatibilityChange(activePair.attr1Id, activePair.attr2Id, 2)}
                    >
                      Sehr kompatibel (+2)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Bewertungslegende:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded ${getScoreColor(-2)}`}>-2</div>
                <span className="text-sm">Nicht kompatibel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded ${getScoreColor(-1)}`}>-1</div>
                <span className="text-sm">Eher nicht kompatibel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded ${getScoreColor(0)}`}>0</div>
                <span className="text-sm">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded ${getScoreColor(1)}`}>+1</div>
                <span className="text-sm">Eher kompatibel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded ${getScoreColor(2)}`}>+2</div>
                <span className="text-sm">Sehr kompatibel</span>
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => onUpdateCompatibility(compatibilityData)}
              >
                Kompatibilitäten speichern
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
