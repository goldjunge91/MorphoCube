import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  const { user } = useAuth();
  
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "U";
  
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-gray-500 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-bold text-primary">
          {title}
        </h1>
        
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
