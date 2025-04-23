import { useState } from "react";
import { useLocation } from "wouter";
import SimpleSidebar from "./simple-sidebar";
import SimpleMobileHeader from "./simple-mobile-header";
import { Button } from "@/components/ui/button";
import { 
  Moon, 
  Bell, 
  HelpCircle 
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function SimpleLayout({ children, title }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Function to determine the current page title
  const getPageTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
        return "Dashboard";
      case "/my-boxes":
        return "My Morphological Boxes";
      case "/templates":
        return "Templates";
      case "/shared":
        return "Shared with me";
      case "/admin/users":
        return "User Management";
      case "/admin/settings":
        return "Settings";
      default:
        return "Morphological Box";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SimpleSidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <SimpleMobileHeader 
          title="Morphological Box" 
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        
        {/* Top Header (Desktop) */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 h-16 px-6 hidden lg:flex">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="text-gray-700">
              <Moon className="h-4 w-4 mr-2" />
              <span>Dark Mode</span>
            </Button>
            
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-accent rounded-full"></span>
            </Button>
            
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-6">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center text-sm">
            <a href="#" className="text-primary font-medium">Dashboard</a>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 mx-2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700">{getPageTitle()}</span>
          </nav>
          
          {children}
        </main>
      </div>
    </div>
  );
}