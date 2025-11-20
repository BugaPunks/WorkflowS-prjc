

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  options: Option[];
  required?: boolean;
  error?: string;
  onChange: (e: Event) => void;
  disabled?: boolean;
  className?: string;
}

export default function FormSelect({
  id,
  name,
  label,
  value,
  options,
  required = false,
  error,
  onChange,
  disabled = false,
  className = "",
}: FormSelectProps) {
  return (
    <div class={`mb-4 ${className}`}>
      <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
        {label}
        {required && <span class="text-red-500 ml-1">*</span>}
      </label>
      <select
        class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
          error ? "border-red-500" : ""
        }`}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p class="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
}
