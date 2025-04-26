"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { MorphoAttribute } from "@/types/parameter";

interface AttributeTagProps {
  attribute: MorphoAttribute;
  onClick?: () => void;
  selected?: boolean;
}

export default function AttributeTag({
  attribute,
  onClick,
  selected = false
}: AttributeTagProps) {
  // Generiere eine Farbe basierend auf dem Attribute-Namen, wenn keine definiert ist
  const getDefaultColor = (name: string): string => {
    const colorOptions = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800"
    ];

    // Einfache Hash-Funktion zum konsistenten Mapping von Namen zu Farben
    const hash = name.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colorOptions[hash % colorOptions.length];
  };

  const baseClasses = "cursor-pointer transition-all";
  const selectedClasses = selected ? "ring-2 ring-primary" : "";
  const colorClasses = attribute.color || getDefaultColor(attribute.name);

  return (
    <Badge
      className={`${baseClasses} ${colorClasses} ${selectedClasses} ${onClick ? "cursor-pointer" : ""}`}
      variant="secondary"
      onClick={onClick}
    >
      {attribute.name}
    </Badge>
  );
}