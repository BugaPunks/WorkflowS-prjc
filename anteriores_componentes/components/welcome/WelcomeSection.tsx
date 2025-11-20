import type { JSX } from "preact";

interface WelcomeSectionProps {
  title: string;
  description?: string;
  children: JSX.Element | JSX.Element[];
}

export default function WelcomeSection({ title, description, children }: WelcomeSectionProps) {
  return (
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4 text-gray-800">{title}</h2>
      {description && <p class="text-gray-600 mb-6">{description}</p>}
      {children}
    </div>
  );
}
