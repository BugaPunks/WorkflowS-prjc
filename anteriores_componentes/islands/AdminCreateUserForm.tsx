import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { UserRole } from "../models/user.ts";
import Modal from "./Modal.tsx";

export default function AdminCreateUserForm({ onUserCreated }: { onUserCreated?: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: UserRole.TEAM_DEVELOPER,
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const openModal = () => {
    setShowModal(true);
    resetForm();
  };

  const closeModal = () => {
    setShowModal(false);
    // Esperar a que se cierre el modal antes de resetear el estado
    setTimeout(() => {
      if (submitSuccess && onUserCreated) {
        onUserCreated();
      }
      resetForm();
    }, 300);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: UserRole.TEAM_DEVELOPER, // Siempre establecer el rol como TEAM_DEVELOPER
    });
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  };

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;

    // Ignorar cambios en el campo de rol (ahora es de solo lectura)
    if (target.name === "role") return;

    setFormData({
      ...formData,
      [target.name]: target.value,
    });

    // Limpiar error cuando se edita el campo
    if (errors[target.name]) {
      setErrors({
        ...errors,
        [target.name]: undefined,
      });
    }

    // Limpiar error general
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

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
      // Asegurarse de que el rol siempre sea TEAM_DEVELOPER
      const dataToSubmit = {
        ...formData,
        role: UserRole.TEAM_DEVELOPER,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en el registro");
        } catch (_e) {
          throw new Error(`Error en el registro: ${response.statusText}`);
        }
      }

      setSubmitSuccess(true);

      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={openModal}
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        Crear Usuario
      </Button>

      <Modal show={showModal} onClose={closeModal} maxWidth="md">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Usuario</h2>

          {submitSuccess ? (
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              <p>¡Usuario creado exitosamente!</p>
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
                {errors.username && (
                  <p class="text-red-500 text-xs italic mt-1">{errors.username}</p>
                )}
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
                {errors.password && (
                  <p class="text-red-500 text-xs italic mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                  Rol
                </label>
                <div class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100">
                  Desarrollador de Equipo
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  Los roles se asignarán al crear proyectos. Todos los usuarios se crean
                  inicialmente como Desarrolladores de Equipo.
                </p>
              </div>

              <div class="flex items-center justify-end pt-4 border-t border-gray-200 mt-6">
                <Button
                  type="button"
                  onClick={closeModal}
                  class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  class={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Creando..." : "Crear Usuario"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
