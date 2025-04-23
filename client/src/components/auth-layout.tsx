import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen">
        {children}
      </div>
    </TooltipProvider>
  );
}