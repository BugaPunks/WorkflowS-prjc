import type { JSX } from "preact";
import { useSidebar } from "../../islands/SidebarProvider.tsx";
import { PanelLeftIcon } from "./icons/PanelLeftIcon.tsx";

// Constantes
const SIDEBAR_WIDTH_MOBILE = "18rem";

// Componente Sidebar
export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className = "",
  children,
  ...props
}: JSX.HTMLAttributes<HTMLDivElement> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        class={`bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        class={`${openMobile ? "block" : "hidden"} fixed inset-0 z-50 bg-black bg-opacity-50`}
        onClick={() => setOpenMobile(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpenMobile(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Cerrar sidebar"
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          class="bg-white text-gray-800 w-[var(--sidebar-width)] h-full p-0 fixed"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as JSX.CSSProperties
          }
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div class="flex h-full w-full flex-col">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      class="group peer text-gray-800 hidden lg:block"
      data-state={state}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* Maneja el espacio del sidebar en desktop */}
      <div
        class={`relative h-screen w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear
          group-data-[collapsible=offcanvas]:w-0
          group-data-[side=right]:rotate-180
          ${
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
              : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
          }`}
      />
      <div
        class={`fixed inset-y-0 z-10 hidden h-screen w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear lg:flex
          ${
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]"
          }
          ${
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
              : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l"
          }
          ${className}`}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          class="bg-white group-data-[variant=floating]:border-gray-200 flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente SidebarTrigger
export function SidebarTrigger({
  className = "",
  onClick,
  ...props
}: JSX.HTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar();

  // Convertir className a string
  const classStr = typeof className === "string" ? className : String(className || "");

  return (
    <button
      type="button"
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      class={`inline-flex items-center justify-center rounded-md h-7 w-7 p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${classStr}`}
      onClick={(event) => {
        console.log("SidebarTrigger clicked");
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span class="sr-only">Toggle Sidebar</span>
    </button>
  );
}

// Componente SidebarHeader
export function SidebarHeader({ className = "", ...props }: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      class={`flex flex-col gap-2 p-2 ${className}`}
      {...props}
    />
  );
}

// Componente SidebarContent
export function SidebarContent({ className = "", ...props }: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      class={`flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden ${className}`}
      {...props}
    />
  );
}

// Componente SidebarFooter
export function SidebarFooter({ className = "", ...props }: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      class={`flex flex-col gap-2 p-2 ${className}`}
      {...props}
    />
  );
}

// Componente SidebarMenu
export function SidebarMenu({ className = "", ...props }: JSX.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      class={`flex w-full min-w-0 flex-col gap-1 ${className}`}
      {...props}
    />
  );
}

// Componente SidebarMenuItem
export function SidebarMenuItem({ className = "", ...props }: JSX.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      class={`group/menu-item relative ${className}`}
      {...props}
    />
  );
}

// Componente SidebarMenuButton
export function SidebarMenuButton({
  isActive = false,
  variant: _variant = "default",
  size: sizeParam,
  className = "",
  ...props
}: JSX.HTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}) {
  const size = sizeParam || "default";

  const sizeClasses: Record<string, string> = {
    default: "h-8 text-sm",
    sm: "h-7 text-xs",
    lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
  };

  const classStr = typeof className === "string" ? className : String(className || "");
  const sizeClass = sizeClasses[size] || sizeClasses.default;

  return (
    <button
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      class={`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 active:bg-gray-100 active:text-gray-900 disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-gray-100 data-[active=true]:font-medium data-[active=true]:text-gray-900 data-[state=open]:hover:bg-gray-100 data-[state=open]:hover:text-gray-900 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 ${sizeClass} ${classStr}`}
      {...props}
    />
  );
}

// Componente SidebarGroup
export function SidebarGroup({ className = "", ...props }: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      class={`relative flex w-full min-w-0 flex-col p-2 ${className}`}
      {...props}
    />
  );
}

// Componente SidebarGroupLabel
export function SidebarGroupLabel({
  className = "",
  ...props
}: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      class={`text-gray-500 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 ${className}`}
      {...props}
    />
  );
}

// Componente SidebarInset
export function SidebarInset({ className = "", ...props }: JSX.HTMLAttributes<HTMLElement>) {
  return (
    <main
      data-slot="sidebar-inset"
      class={`bg-white relative flex max-w-full min-h-screen flex-1 flex-col peer-data-[variant=inset]:min-h-[calc(100vh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0 ${className}`}
      {...props}
    />
  );
}
