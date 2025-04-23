import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Copy,
  FileText,
  XCircle,
  CheckCircle,
  Loader2,
  Lightbulb,
  Settings,
  Briefcase,
  Boxes,
  Puzzle,
  School,
  Hammer,
  Sparkles
} from "lucide-react";

// Sample template categories and templates
const templateCategories = [
  { id: "business", name: "Business", icon: <Briefcase className="h-5 w-5" /> },
  { id: "engineering", name: "Engineering", icon: <Hammer className="h-5 w-5" /> },
  { id: "education", name: "Education", icon: <School className="h-5 w-5" /> },
  { id: "innovation", name: "Innovation", icon: <Lightbulb className="h-5 w-5" /> },
  { id: "product", name: "Product Design", icon: <Boxes className="h-5 w-5" /> },
  { id: "all", name: "All Templates", icon: <Puzzle className="h-5 w-5" /> },
];

// Sample templates
const templates = [
  {
    id: 1,
    title: "Business Model Canvas",
    description: "Analyze and define your business model with key parameters like value propositions, customer segments, and revenue streams.",
    category: "business",
    parameters: 9,
    attributes: 27,
    popular: true,
  },
  {
    id: 2,
    title: "Product Development Strategy",
    description: "Explore different design, material, and manufacturing options for your product development process.",
    category: "product",
    parameters: 8,
    attributes: 24,
    popular: true,
  },
  {
    id: 3,
    title: "Innovation Workshop",
    description: "Structured approach to generate innovative ideas by exploring different combinations of technologies, markets, and problems.",
    category: "innovation",
    parameters: 7,
    attributes: 21,
    popular: false,
  },
  {
    id: 4,
    title: "Educational Curriculum Design",
    description: "Create a comprehensive curriculum by organizing subjects, teaching methods, and assessment strategies.",
    category: "education",
    parameters: 6,
    attributes: 18,
    popular: false,
  },
  {
    id: 5,
    title: "Engineering Problem Solving",
    description: "Technical problem-solving framework with parameters like materials, processes, and constraints.",
    category: "engineering",
    parameters: 10,
    attributes: 30,
    popular: true,
  },
  {
    id: 6,
    title: "Market Entry Strategy",
    description: "Analyze different market entry options, pricing strategies, and distribution channels.",
    category: "business",
    parameters: 7,
    attributes: 21,
    popular: false,
  },
];

export default function TemplatesPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUseTemplate = (templateId: number) => {
    setIsLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/my-boxes?create=true&template=${templateId}`);
      
      toast({
        title: "Template loaded",
        description: "Template has been loaded. You can now customize it.",
      });
    }, 1000);
  };

  // Filter templates based on search term and active category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm
      ? template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
      
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout title="Templates">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Morphological Box Templates</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={() => navigate("/my-boxes?create=true")}>
              <Plus className="h-4 w-4 mr-2" />
              Blank Box
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex overflow-x-auto pb-1 mb-2 w-full">
            {templateCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !filteredTemplates.length ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  No templates match your search criteria. Try with different keywords or browse another category.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}>
                  View All Templates
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{template.title}</CardTitle>
                        {template.popular && (
                          <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Popular
                          </div>
                        )}
                      </div>
                      <CardDescription>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            {template.parameters} Parameters
                          </div>
                          <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            {template.attributes} Attributes
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-3">
                        {template.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Use Template
                          </>
                        )}
                      </Button>
                      <Button variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
