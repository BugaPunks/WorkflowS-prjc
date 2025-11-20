import type { JSX } from "preact";

/**
 * Props para el componente WelcomeCard estático
 */
export interface WelcomeCardProps {
  title: string;
  description: string;
  icon: JSX.Element;
  linkText: string;
  linkHref: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  /** Elemento opcional para renderizar en la esquina inferior derecha */
  rightElement?: JSX.Element;
}

/**
 * Componente estático para mostrar una tarjeta de bienvenida
 * Este componente no contiene lógica interactiva y puede ser usado en la carpeta components
 */
export default function WelcomeCard({
  title,
  description,
  icon,
  linkText,
  linkHref,
  bgColor,
  borderColor,
  textColor,
  rightElement,
}: WelcomeCardProps) {
  return (
    <div class={`${bgColor} p-5 rounded-lg border ${borderColor}`}>
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class={`font-bold text-lg ${textColor}`}>{title}</h3>
          <p class="text-gray-600 mt-1">{description}</p>
        </div>
        {icon}
      </div>
      <div class="flex justify-between items-center">
        <a href={linkHref} class={`${textColor} hover:underline`}>
          {linkText} →
        </a>
        {rightElement}
      </div>
    </div>
  );
}
