import { useState } from "react";
import { useLocation } from "wouter";
import SimpleLayout from "@/components/simple-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Box,
  ArrowRight,
  FileText,
  Search,
  Briefcase,
  Lightbulb,
  TrendingUp,
  Target,
  XCircle,
} from "lucide-react";

interface TemplateCard {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
  categories: string[];
}

export default function SimpleTemplatesPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Mock template data
  const templates: TemplateCard[] = [
    {
      id: 1,
      title: "Product Development Strategy",
      description: "A template for analyzing different approaches to product development",
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      categories: ["Business", "Strategy"]
    },
    {
      id: 2,
      title: "Innovation Workshop",
      description: "Structured approach for identifying innovative solutions",
      icon: <Lightbulb className="h-10 w-10 text-yellow-500" />,
      categories: ["Innovation", "Workshop"]
    },
    {
      id: 3,
      title: "Market Entry Analysis",
      description: "Evaluate different strategies for entering new markets",
      icon: <TrendingUp className="h-10 w-10 text-green-500" />,
      categories: ["Business", "Marketing"]
    },
    {
      id: 4,
      title: "Strategic Planning",
      description: "Define goals and identify paths to achieve them",
      icon: <Target className="h-10 w-10 text-red-500" />,
      categories: ["Strategy", "Planning"]
    }
  ];

  const categories = Array.from(
    new Set(templates.flatMap(template => template.categories))
  );

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === "" || 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategories = selectedCategories.length === 0 || 
      selectedCategories.some(cat => template.categories.includes(cat));
    
    return matchesSearch && matchesCategories;
  });

  const handleUseTemplate = (templateId: number) => {
    navigate(`/my-boxes?template=${templateId}`);
  };

  return (
    <SimpleLayout title="Templates">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Template Gallery</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
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
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Filter Sidebar */}
          <div className="col-span-12 md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <label 
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Templates Grid */}
          <div className="col-span-12 md:col-span-9">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  {searchTerm || selectedCategories.length > 0
                    ? "Try changing your search terms or filters to find what you're looking for."
                    : "There are no templates available at the moment."}
                </p>
                {(searchTerm || selectedCategories.length > 0) && (
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map(template => (
                  <Card key={template.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center space-x-4">
                          <div className="bg-gray-100 p-3 rounded-md">
                            {template.icon}
                          </div>
                          <div>
                            <CardTitle>{template.title}</CardTitle>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {template.categories.map(cat => (
                                <span 
                                  key={cat} 
                                  className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button className="w-full" onClick={() => handleUseTemplate(template.id)}>
                        Use Template
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
}