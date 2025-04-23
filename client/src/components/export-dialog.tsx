import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FileText, FileSpreadsheet, FileJson } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string) => void;
}

export default function ExportDialog({
  open,
  onOpenChange,
  onExport,
}: ExportDialogProps) {
  const [format, setFormat] = useState("pdf");

  const handleExport = () => {
    onExport(format);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Morphological Box</DialogTitle>
          <DialogDescription>
            Choose a format to export your morphological box
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={format} onValueChange={setFormat} className="space-y-4">
            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <div className="font-medium">PDF Document</div>
                  <div className="text-sm text-gray-500">
                    Export as a formatted PDF document
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel" className="flex items-center cursor-pointer">
                <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <div className="font-medium">Excel Spreadsheet</div>
                  <div className="text-sm text-gray-500">
                    Export as an Excel file for data analysis
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center cursor-pointer">
                <FileJson className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <div className="font-medium">JSON</div>
                  <div className="text-sm text-gray-500">
                    Export as a JSON file for data interchange
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
