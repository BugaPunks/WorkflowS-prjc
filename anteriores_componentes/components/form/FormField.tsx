

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange: (e: Event) => void;
  autoComplete?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

export default function FormField({
  id,
  name,
  label,
  type = "text",
  value,
  placeholder,
  required = false,
  error,
  onChange,
  autoComplete,
  min,
  max,
  disabled = false,
  className = "",
}: FormFieldProps) {
  return (
    <div class={`mb-4 ${className}`}>
      <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
        {label}
        {required && <span class="text-red-500 ml-1">*</span>}
      </label>
      <input
        class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
          error ? "border-red-500" : ""
        }`}
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        min={min}
        max={max}
        disabled={disabled}
      />
      {error && <p class="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
}
