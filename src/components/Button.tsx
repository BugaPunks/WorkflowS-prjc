import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "primary" | "secondary" | "danger" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
	variant = "default",
	className = "",
	size = "default",
	...props
}: ButtonProps) {
	const baseClasses =
		"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";

	const variantClasses = {
		default: "text-black border border-gray-400",
		primary: "bg-blue-600 text-white hover:bg-blue-700",
		secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
		danger: "bg-red-600 text-white hover:bg-red-700",
		ghost:
			"border border-gray-400 text-black hover:bg-gray-100 hover:text-gray-900",
	};

	const sizeClasses = {
		default: "h-10 px-4 py-2",
		sm: "h-8 px-3 py-1 text-xs",
		lg: "h-12 px-6 py-3 text-base",
		icon: "h-10 w-10 p-2",
	};

	return (
		<button
			{...props}
			className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
		/>
	);
}
