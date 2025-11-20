import { Button } from "../components/Button.tsx";
import FormError from "../components/form/FormError.tsx";
import FormField from "../components/form/FormField.tsx";
import { useForm } from "../hooks/useForm.ts";

interface LoginFormData {
  identifier: string;
  password: string;
}

export default function LoginForm() {
  // Utilizar el hook useForm para gestionar el estado del formulario
  const { values, errors, isSubmitting, submitError, handleChange, handleSubmit } = useForm<
    Record<string, unknown>
  >({
    initialValues: {
      identifier: "",
      password: "",
    },
    validate: (values) => {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};

      if (!values.identifier) {
        errors.identifier = "El correo o nombre de usuario es requerido";
      }

      if (!values.password) {
        errors.password = "La contraseña es requerida";
      }

      return errors;
    },
    onSubmit: async (values) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error en el inicio de sesión: ${response.statusText}`
        );
      }

      // Redirect to welcome page on successful login
      globalThis.location.href = "/welcome";
    },
  });

  return (
    <div class="bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit} class="space-y-4">
        {submitError && <FormError message={submitError} />}

        <FormField
          id="identifier"
          name="identifier"
          label="Correo o Nombre de Usuario"
          type="text"
          placeholder="Correo o Nombre de Usuario"
          value={values.identifier as string}
          onChange={handleChange}
          error={errors.identifier}
          required
        />

        <FormField
          id="password"
          name="password"
          label="Contraseña"
          type="password"
          placeholder="Contraseña"
          value={values.password as string}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <div class="flex items-center justify-between pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            class={`w-full font-bold ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </div>
      </form>
    </div>
  );
}
