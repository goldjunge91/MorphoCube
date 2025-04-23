import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Download, Sliders, Lightbulb, Brain, AlertCircle, SearchCode, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BoxParameter } from "@/types/parameter";

interface CombinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parameters: BoxParameter[];
}

type Combination = Record<string, string>;

interface CombinationData {
  total: number;
  sample: Combination[];
  timestamp: string;
}

export default function CombinationDialog({
  open,
  onOpenChange,
  parameters,
}: CombinationDialogProps) {
  const [combinationData, setCombinationData] = useState<CombinationData | null>(null);
  const [filteredCombinations, setFilteredCombinations] = useState<Combination[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("combinations");
  const [sortBy, setSortBy] = useState("random");
  const [filterConfig, setFilterConfig] = useState<Record<string, string[]>>({});

  // Load combinations from local storage
  useEffect(() => {
    if (open) {
      const savedData = localStorage.getItem('morphologicalBoxCombinations');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData) as CombinationData;
          setCombinationData(parsed);
          setFilteredCombinations(parsed.sample);
        } catch (error) {
          console.error("Error parsing saved combinations:", error);
        }
      }
    }
  }, [open]);

  // Filter combinations based on search term and filters
  useEffect(() => {
    if (!combinationData) return;

    let filtered = combinationData.sample;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(combination => 
        Object.entries(combination).some(([param, value]) => 
          value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          param.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply attribute filters
    Object.entries(filterConfig).forEach(([param, selectedValues]) => {
      if (selectedValues.length > 0) {
        filtered = filtered.filter(combination => 
          selectedValues.includes(combination[param])
        );
      }
    });

    // Apply sorting
    if (sortBy === "random") {
      // Shuffle array for random sort
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }
    // Other sorting methods can be implemented as needed

    setFilteredCombinations(filtered);
  }, [searchTerm, filterConfig, sortBy, combinationData]);

  // Initialize filter configuration based on parameters
  useEffect(() => {
    if (parameters.length > 0) {
      const newFilterConfig: Record<string, string[]> = {};
      parameters.forEach(param => {
        newFilterConfig[param.name] = [];
      });
      setFilterConfig(newFilterConfig);
    }
  }, [parameters]);

  // Handle filter change
  const handleFilterChange = (paramName: string, value: string, checked: boolean) => {
    setFilterConfig(prev => {
      const current = prev[paramName] || [];
      if (checked) {
        return { ...prev, [paramName]: [...current, value] };
      } else {
        return { ...prev, [paramName]: current.filter(v => v !== value) };
      }
    });
  };

  // Export combinations to CSV
  const exportCSV = () => {
    if (!filteredCombinations.length) return;
    
    // Get all parameter names
    const headers = Object.keys(filteredCombinations[0]);
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    
    filteredCombinations.forEach(combination => {
      const row = headers.map(header => {
        // Escape commas and quotes in values
        const value = combination[header] || "";
        return `"${value.replace(/"/g, '""')}"`;
      });
      csvContent += row.join(",") + "\n";
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `morphological-combinations-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-2">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            Solution Space Explorer
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="combinations">Combinations</TabsTrigger>
              <TabsTrigger value="analysis">Engineering Analysis</TabsTrigger>
              <TabsTrigger value="compatibility">TRIZ Principles</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center mb-4 space-x-2">
            <Input
              placeholder="Search combinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="engineering">Engineering Feasibility</SelectItem>
                <SelectItem value="innovative">Innovation Potential</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="combinations" className="flex-1 flex space-x-4 mt-0">
            <div className="w-64 border rounded-md p-3 overflow-y-auto">
              <h3 className="font-medium mb-2 text-sm">Filter by Attributes</h3>
              
              <ScrollArea className="h-[50vh]">
                <div className="space-y-4">
                  {parameters.map(parameter => (
                    <div key={parameter.id} className="space-y-1">
                      <h4 className={`text-sm font-medium text-${parameter.color}-700`}>
                        {parameter.name}
                      </h4>
                      <div className="ml-2 space-y-1">
                        {parameter.attributes.map(attribute => (
                          <div key={attribute.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`attr-${attribute.id}`}
                              className="mr-2"
                              checked={filterConfig[parameter.name]?.includes(attribute.name)}
                              onChange={(e) => handleFilterChange(
                                parameter.name, 
                                attribute.name, 
                                e.target.checked
                              )}
                            />
                            <label htmlFor={`attr-${attribute.id}`} className="text-sm">
                              {attribute.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex-1 border rounded-md p-3">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="font-medium text-sm">
                  Generated Combinations 
                  <span className="text-gray-500 ml-2">
                    {filteredCombinations.length} of {combinationData?.total.toLocaleString() || 0}
                  </span>
                </h3>
              </div>
              
              <ScrollArea className="h-[50vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      {parameters.map(param => (
                        <TableHead key={param.id}>{param.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCombinations.map((combination, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        {parameters.map(param => (
                          <TableCell key={`${index}-${param.id}`} className="truncate max-w-[200px]">
                            {combination[param.name] || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 mt-0">
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-primary bg-opacity-10 mr-2">
                  <SearchCode className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Engineering Analysis</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Technical Feasibility Score</h4>
                  <div className="p-3 bg-gray-50 rounded-md space-y-2">
                    {parameters.map(param => (
                      <div key={param.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{param.name}</span>
                          <span className="text-xs text-gray-500">Importance weight</span>
                        </div>
                        <Slider
                          defaultValue={[5]}
                          max={10}
                          step={1}
                          className="py-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Innovation Assessment</h4>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">
                      Evaluate the innovation potential of different combinations based on TRIZ principles
                      and engineering compatibility.
                    </p>
                    <Button className="mb-2" size="sm">
                      <Brain className="h-4 w-4 mr-1" />
                      Run Analysis
                    </Button>
                    <div className="text-sm text-gray-500 flex items-center justify-center py-6">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Run analysis to see innovation scores
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compatibility" className="flex-1 mt-0">
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-primary bg-opacity-10 mr-2">
                  <Sliders className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">TRIZ Principles & Compatibility</h3>
              </div>
              
              <div className="text-sm">
                <p className="mb-4">
                  TRIZ principles can help identify innovative solutions and resolve engineering contradictions 
                  in your morphological analysis.
                </p>
                
                <h4 className="font-medium mb-2">Common Engineering Contradictions in Your Parameters:</h4>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Weight vs. Strength</li>
                  <li>Speed vs. Precision</li>
                  <li>Reliability vs. Complexity</li>
                  <li>Power vs. Efficiency</li>
                </ul>
                
                <h4 className="font-medium mb-2">Suggested TRIZ Principles:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium mb-1">1. Segmentation</h5>
                    <p className="text-xs text-gray-600">
                      Divide an object into independent parts to increase modularity and adaptability.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium mb-1">2. Taking out / Extraction</h5>
                    <p className="text-xs text-gray-600">
                      Extract only the necessary part of an object to reduce complexity.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium mb-1">15. Dynamics</h5>
                    <p className="text-xs text-gray-600">
                      Make objects adjustable, adaptive, or allow for optimal operation.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium mb-1">8. Anti-weight / Counterweight</h5>
                    <p className="text-xs text-gray-600">
                      Compensate for weight of an object by interaction with other forces.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}