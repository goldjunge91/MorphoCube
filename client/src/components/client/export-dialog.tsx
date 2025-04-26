import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { MorphologicalBox } from "@/types/parameter";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string) => void;
  morphologicalBox?: MorphologicalBox | null;
}

export default function ExportDialog({
  open,
  onOpenChange,
  onExport,
  morphologicalBox,
}: ExportDialogProps) {
  const [format, setFormat] = useState<string>("json");
  const [includeCompatibility, setIncludeCompatibility] = useState(true);
  const [includeSolutions, setIncludeSolutions] = useState(true);

  const handleExport = () => {
    onExport(format);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Morphologischen Kasten exportieren</DialogTitle>
          <DialogDescription>
            Exportieren Sie Ihren morphologischen Kasten in verschiedenen Formaten
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">Exportformat</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Format auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Exportoptionen</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-compatibility"
                checked={includeCompatibility}
                onCheckedChange={(checked) => setIncludeCompatibility(checked as boolean)}
              />
              <Label htmlFor="include-compatibility">Kompatibilitätsdaten einschließen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-solutions"
                checked={includeSolutions}
                onCheckedChange={(checked) => setIncludeSolutions(checked as boolean)}
              />
              <Label htmlFor="include-solutions">Lösungen einschließen</Label>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>
              Der Export enthält alle Parameter und Attribute des morphologischen Kastens
              {includeCompatibility && ", Kompatibilitätsdaten"}
              {includeSolutions && " und erstellte Lösungen"}.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
