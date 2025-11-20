import { JSX } from "preact";
import type { ComponentType } from "preact";

interface IconProps {
  iconNode: ComponentType<JSX.SVGAttributes<SVGElement>>;
  class?: string;
}

export function Icon({ iconNode: IconComponent, class: className = "" }: IconProps) {
  return <IconComponent class={className} />;
}
