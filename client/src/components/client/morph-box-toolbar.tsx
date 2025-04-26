import { Button } from "@/components/ui/button";
import { Plus, Save, Share2, Download, Lightbulb } from "lucide-react";

interface MorphBoxToolbarProps {
  onSave: () => void;
  onAddParameter: () => void;
  onShare: () => void;
  onExport: () => void;
  onCreateSolution: () => void;
  isReadOnly?: boolean;
  isSaving?: boolean;
}

export default function MorphBoxToolbar({
  onSave,
  onAddParameter,
  onShare,
  onExport,
  onCreateSolution,
  isReadOnly = false,
  isSaving = false,
}: MorphBoxToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {!isReadOnly && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Speichern..." : "Speichern"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAddParameter}
          >
            <Plus className="h-4 w-4 mr-2" />
            Parameter
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Teilen
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportieren
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onCreateSolution}
      >
        <Lightbulb className="h-4 w-4 mr-2" />
        Lösung erstellen
      </Button>
    </div>
  );
}