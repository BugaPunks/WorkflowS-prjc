import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

interface ModalProps {
  show: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  closeable?: boolean;
  onClose: () => void;
  children: JSX.Element | JSX.Element[];
}

export default function Modal({
  show,
  maxWidth = "2xl",
  closeable = true,
  onClose,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showContent, setShowContent] = useState(show);

  // Manejar cambios en la propiedad show
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      setShowContent(true);
      setTimeout(() => {
        dialogRef.current?.showModal();
      }, 10);
    } else {
      document.body.style.overflow = "";
      setTimeout(() => {
        dialogRef.current?.close();
        setTimeout(() => {
          setShowContent(false);
        }, 200);
      }, 200);
    }
  }, [show]);

  // Manejar cierre con tecla Escape
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (show && closeable) {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [show, closeable, onClose]);

  // Manejar clic o tecla en el fondo para cerrar
  const handleBackdropInteraction = (e: MouseEvent | KeyboardEvent) => {
    // Para eventos de teclado, solo procesar si es Enter o Space
    if (e.type === "keydown") {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key !== "Enter" && keyEvent.key !== " ") {
        return;
      }
      e.preventDefault(); // Prevenir scroll con Space
    }

    if (closeable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determinar la clase de ancho máximo
  const maxWidthClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  }[maxWidth];

  return (
    <dialog
      ref={dialogRef}
      class="z-50 m-0 min-h-full min-w-full overflow-y-auto bg-transparent backdrop:bg-transparent"
      onClick={handleBackdropInteraction}
      onKeyDown={handleBackdropInteraction}
    >
      <div class="fixed inset-0 overflow-y-auto px-4 py-6 sm:px-0 z-50">
        {/* Fondo oscuro con animación */}
        <div
          class={`fixed inset-0 transform transition-all duration-300 ease-in-out ${
            show ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeable ? onClose : undefined}
          onKeyDown={
            closeable
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClose();
                  }
                }
              : undefined
          }
          tabIndex={closeable ? 0 : -1}
          role={closeable ? "button" : undefined}
          aria-label={closeable ? "Cerrar modal" : undefined}
        >
          <div class="absolute inset-0 bg-gray-500 opacity-75" />
        </div>

        {/* Contenido del modal con animación */}
        <div
          class={`mb-6 bg-white rounded-lg overflow-hidden shadow-xl transform transition-all duration-300 ease-in-out sm:w-full sm:mx-auto ${maxWidthClass} ${
            show
              ? "opacity-100 translate-y-0 sm:scale-100"
              : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          }`}
        >
          {showContent && children}
        </div>
      </div>
    </dialog>
  );
}
