export default function CommonWelcomeOptions() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 class="font-bold text-lg mb-2">Explorar el sistema</h3>
        <p class="text-gray-600 mb-3">
          Descubre todas las funcionalidades disponibles para tu rol.
        </p>
        <a href="#" class="text-blue-600 hover:underline">
          Comenzar exploración →
        </a>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 class="font-bold text-lg mb-2">Completar tu perfil</h3>
        <p class="text-gray-600 mb-3">
          Añade más información a tu perfil para mejorar tu experiencia.
        </p>
        <a href="#" class="text-blue-600 hover:underline">
          Editar perfil →
        </a>
      </div>
    </div>
  );
}
