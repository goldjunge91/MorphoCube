import { ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useIsMobile } from "@/hooks/use-mobile";

interface DragAndDropProviderProps {
  children: ReactNode;
}

export default function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  const isMobile = useIsMobile();
  
  // Use TouchBackend for mobile devices, and HTML5Backend for desktop
  const backend = isMobile ? TouchBackend : HTML5Backend;
  const options = isMobile ? { enableMouseEvents: true } : {};

  return (
    <DndProvider backend={backend} options={options}>
      {children}
    </DndProvider>
  );
}
