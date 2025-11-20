import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

import { UserRole } from "../models/user.ts";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: UserRole.TEAM_DEVELOPER,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value = target.name === "role" ? (target.value as UserRole) : target.value;

    setFormData({
      ...formData,
      [target.name]: value,
    });

    // Clear error when field is edited
    if (errors[target.name as keyof FormData]) {
      setErrors({
        ...errors,
        [target.name]: undefined,
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.username) {
      newErrors.username = "El nombre de usuario es obligatorio";
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en el registro");
        } catch (_e) {
          // If we can't parse the JSON, just use the status text
          throw new Error(`Error en el registro: ${response.statusText}`);
        }
      }

      setSubmitSuccess(true);

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        role: UserRole.TEAM_DEVELOPER,
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="bg-white shadow-md rounded-lg p-6">
      {submitSuccess ? (
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <p>¡Registro exitoso! Ahora puedes iniciar sesión.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} class="space-y-4">
          {submitError && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{submitError}</p>
            </div>
          )}

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                Nombre
              </label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Apellido
              </label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Rol*
            </label>
             <select
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               id="role"
               name="role"
               value={formData.role}
               onChange={handleChange}
               required
             >
               <option value={UserRole.TEAM_DEVELOPER}>Team Developer</option>
               <option value={UserRole.SCRUM_MASTER}>Scrum Master</option>
               <option value={UserRole.PRODUCT_OWNER}>Product Owner</option>
               <option value={UserRole.ADMIN}>Administrador</option>
             </select>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Nombre de Usuario*
            </label>
            <input
              class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.username ? "border-red-500" : ""
              }`}
              id="username"
              name="username"
              type="text"
              placeholder="Nombre de Usuario"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <p class="text-red-500 text-xs italic mt-1">{errors.username}</p>}
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Correo Electrónico*
            </label>
            <input
              class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.email ? "border-red-500" : ""
              }`}
              id="email"
              name="email"
              type="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p class="text-red-500 text-xs italic mt-1">{errors.email}</p>}
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña*
            </label>
            <input
              class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.password ? "border-red-500" : ""
              }`}
              id="password"
              name="password"
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p class="text-red-500 text-xs italic mt-1">{errors.password}</p>}
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirmar Contraseña*
            </label>
            <input
              class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <p class="text-red-500 text-xs italic mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div class="flex items-center justify-between pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              class={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
