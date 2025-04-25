
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { AttributeCompatibility, Attribute, CompatibilityLevel } from "@shared/schema";

interface CompatibilityMatrixProps {
  attributes: Attribute[];
  compatibilityData: AttributeCompatibility[];
  onUpdate: (data: AttributeCompatibility[]) => void;
}

export default function CompatibilityMatrix({ attributes, compatibilityData, onUpdate }: CompatibilityMatrixProps) {
  const [matrix, setMatrix] = useState<Map<string, AttributeCompatibility>>(
    new Map(compatibilityData.map(comp => [`${comp.attribute1Id}-${comp.attribute2Id}`, comp]))
  );

  const compatibilityLevels: { value: CompatibilityLevel; label: string; color: string }[] = [
    { value: -2, label: "Impossible", color: "bg-red-100 text-red-800" },
    { value: -1, label: "Difficult", color: "bg-orange-100 text-orange-800" },
    { value: 0, label: "Neutral", color: "bg-gray-100 text-gray-800" },
    { value: 1, label: "Good", color: "bg-green-100 text-green-800" },
    { value: 2, label: "Excellent", color: "bg-emerald-100 text-emerald-800" },
  ];

  const handleCompatibilityChange = (attr1Id: number, attr2Id: number, level: CompatibilityLevel) => {
    const newMatrix = new Map(matrix);
    newMatrix.set(`${attr1Id}-${attr2Id}`, {
      attribute1Id: attr1Id,
      attribute2Id: attr2Id,
      level,
    });
    setMatrix(newMatrix);
    onUpdate(Array.from(newMatrix.values()));
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Attribute</TableHead>
            {attributes.map(attr => (
              <TableHead key={attr.id} className="w-32">{attr.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.map(attr1 => (
            <TableRow key={attr1.id}>
              <TableCell className="font-medium">{attr1.name}</TableCell>
              {attributes.map(attr2 => {
                if (attr1.id === attr2.id) {
                  return <TableCell key={attr2.id} className="bg-gray-50">-</TableCell>;
                }
                
                const compatibility = matrix.get(`${attr1.id}-${attr2.id}`);
                const level = compatibility?.level || 0;
                const levelInfo = compatibilityLevels.find(l => l.value === level);
                
                return (
                  <TableCell key={attr2.id}>
                    <Select
                      value={level.toString()}
                      onValueChange={(value) => handleCompatibilityChange(attr1.id, attr2.id, parseInt(value) as CompatibilityLevel)}
                    >
                      <SelectTrigger className={`w-full ${levelInfo?.color}`}>
                        <SelectValue>{levelInfo?.label}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {compatibilityLevels.map(level => (
                          <SelectItem 
                            key={level.value} 
                            value={level.value.toString()}
                            className={level.color}
                          >
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
