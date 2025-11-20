import { JSX as _JSX } from "preact";
import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

interface DropdownMenuProps {
  children: ComponentChildren;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div class="relative">{children}</div>;
}

interface DropdownMenuTriggerProps {
  children: ComponentChildren;
  asChild?: boolean;
}

export function DropdownMenuTrigger({ children, asChild = false }: DropdownMenuTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);

    // Buscar el DropdownMenuContent y pasarle el estado
    const content = (e.currentTarget as HTMLElement).parentElement?.querySelector("[data-dropdown-content]");
    if (content) {
      content.setAttribute("data-state", isOpen ? "closed" : "open");
    }
  };

  if (asChild) {
    return (
      <div onClick={handleClick} data-state={isOpen ? "open" : "closed"}>
        {children}
      </div>
    );
  }

  return (
    <button type="button" onClick={handleClick} data-state={isOpen ? "open" : "closed"}>
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: ComponentChildren;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  class?: string;
}

export function DropdownMenuContent({
  children,
  align = "center",
  side = "bottom",
  class: className = "",
}: DropdownMenuContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        ref.current.setAttribute("data-state", "closed");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const alignClasses = {
    start: "origin-top-left left-0",
    center: "origin-top",
    end: "origin-top-right right-0",
  };

  const sideClasses = {
    top: "bottom-full mb-2",
    right: "left-full ml-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
  };

  return (
    <div
      ref={ref}
      data-dropdown-content
      data-state={isOpen ? "open" : "closed"}
      class={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md ${alignClasses[align]} ${sideClasses[side]} ${className}`}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: ComponentChildren;
  disabled?: boolean;
  class?: string;
}

export function DropdownMenuItem({
  children,
  disabled = false,
  class: className = "",
}: DropdownMenuItemProps) {
  return (
    <div
      class={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${
        disabled ? "pointer-events-none opacity-50" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
