import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: { id: string; name: string; email: string; role: string };
}

export default function Sidebar({ isOpen, user }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Proyectos', href: '/projects', icon: '📊' },
    { label: 'Sprints', href: '/sprints', icon: '🏃' },
    { label: 'Tareas', href: '/tasks', icon: '✓' },
    { label: 'Historias', href: '/user-stories', icon: '📖' },
    { label: 'Reportes', href: '/reports', icon: '📈' },
    { label: 'Evaluaciones', href: '/evaluations', icon: '⭐' },
  ];

  // Filtrar items según el rol del usuario
  const filteredItems = navItems.filter((item) => {
    // Los admins ven todo
    if (user?.role === 'ADMIN') return true;
    // Otros roles pueden ver proyectos y tareas
    return ['Proyectos', 'Tareas', 'Historias', 'Reportes'].includes(
      item.label,
    );
  });

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 hidden lg:flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <span className={`font-bold text-xl ${!isOpen && 'hidden'}`}>WS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {isOpen && (
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-gray-400 text-xs">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col">
            <div className="flex items-center justify-center h-16 border-b border-gray-700">
              <span className="font-bold text-xl">WorkflowS</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {filteredItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
