import { Button } from "@/components/ui/button";
import { Plus, Save, Share2, Download, Lightbulb, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MorphBoxToolbarProps {
  onSave: () => void;
  onAddParameter?: () => void;
  onShare: () => void;
  onExport: () => void;
  onCreateSolution?: () => void;
  isReadOnly?: boolean;
  isSaving?: boolean;
  title: string;
  onTitleChange: (newTitle: string) => void;
  lastSaved?: string;
  isSaved: boolean;
  collaborators: { id: number; username: string; }[];
}

export default function MorphBoxToolbar({
  onSave,
  onAddParameter,
  onShare,
  onExport,
  onCreateSolution,
  isReadOnly = false,
  isSaving = false,
  title,
  onTitleChange,
  lastSaved,
  isSaved,
  collaborators,
}: MorphBoxToolbarProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="w-full sm:w-auto">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-xl font-bold h-10 px-2"
            placeholder="Titel des morphologischen Kastens"
            disabled={isReadOnly}
          />
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {lastSaved ? (
              <span>Zuletzt gespeichert: {new Date(lastSaved).toLocaleString()}</span>
            ) : (
              <span>Nicht gespeichert</span>
            )}
            {isSaved && <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">Gespeichert</Badge>}
          </div>
        </div>

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

              {onAddParameter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddParameter}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Parameter
                </Button>
              )}
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

          {onCreateSolution && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateSolution}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Lösung erstellen
            </Button>
          )}
        </div>
      </div>

      {collaborators.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-500">Mitarbeiter:</span>
          <div className="flex -space-x-2">
            {collaborators.map((collaborator) => (
              <Avatar key={collaborator.id} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="text-xs">
                  {collaborator.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}