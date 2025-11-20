import type { JSX } from "preact";
import { createContext } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useContext } from "preact/hooks";

// Constantes
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";

// Contexto del Sidebar
type SidebarContextType = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

// Hook para usar el contexto del sidebar
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar debe ser usado dentro de un SidebarProvider.");
  }
  return context;
}

// Función para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof globalThis !== "undefined") {
      const checkMobile = () => {
        setIsMobile(globalThis.innerWidth < 1024);
      };

      checkMobile();
      globalThis.addEventListener("resize", checkMobile);

      return () => {
        globalThis.removeEventListener("resize", checkMobile);
      };
    }
  }, []);

  return isMobile;
}

// Componente SidebarProvider
export default function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className = "",
  style = {},
  children,
  ...props
}: JSX.HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  // Estado interno del sidebar
  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }
  };

  // Función para alternar el sidebar
  const toggleSidebar = () => {
    console.log("toggleSidebar called", { isMobile, open, openMobile });
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  // Estado para clases CSS
  const state = open ? "expanded" : "collapsed";

  // Valor del contexto
  const contextValue: SidebarContextType = {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...(style as Record<string, string>),
          } as JSX.CSSProperties
        }
        class={`group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-screen w-full ${className}`}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
