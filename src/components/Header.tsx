/**
 * Componente de cabeçalho da aplicação
 * 
 * Funcionalidades:
 * - Exibe título da aplicação
 * - Mostra saudação personalizada do usuário
 * - Botão de menu para dispositivos móveis
 * - Toggle de tema claro/escuro
 * - Design responsivo com suporte a dark mode
 */

"use client";

import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { ComponentHelpers } from "./base";

/**
 * Interface para dados do usuário
 */
interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Props do componente Header
 */
interface HeaderProps {
  /** Dados do usuário logado */
  user: User;
  /** Callback para clique no menu mobile */
  onMenuClick?: () => void;
  /** Se deve mostrar o botão de menu */
  showMenuButton?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Formata o nome de exibição do usuário
 * @param user Dados do usuário
 * @returns Nome formatado para exibição
 */
function formatDisplayName(user: User): string {
  if (user.name) {
    return user.name;
  }
  
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }
  
  return 'Usuário';
}

/**
 * Componente de cabeçalho da aplicação
 * 
 * Responsável por exibir a navegação principal, informações do usuário
 * e controles de interface como menu mobile e toggle de tema.
 * 
 * @param props Propriedades do componente
 * @returns Elemento JSX do cabeçalho
 */
export default function Header({ 
  user, 
  onMenuClick, 
  showMenuButton = false,
  className = '' 
}: HeaderProps) {
  // Validar props obrigatórias
  if (!ComponentHelpers.validateRequiredProps({ user }, ['user'], 'Header')) {
    return null;
  }

  const displayName = formatDisplayName(user);
  
  const headerClassName = ComponentHelpers.generateClassName(
    'bg-[#1a1a1a] border-b border-[#2a2a2a] shadow overflow-x-hidden',
    'dark:bg-gray-100 dark:border-gray-300',
    className
  );

  const menuButtonClassName = ComponentHelpers.generateClassName(
    'md:hidden p-2 rounded-md hover:bg-[#2a2a2a] transition-colors flex-shrink-0',
    'dark:hover:bg-gray-200'
  );

  const titleClassName = ComponentHelpers.generateClassName(
    'text-lg sm:text-2xl font-bold text-white truncate',
    'dark:text-gray-900'
  );

  const userGreetingClassName = ComponentHelpers.generateClassName(
    'text-xs sm:text-sm text-gray-400 truncate max-w-24 sm:max-w-none',
    'dark:text-gray-600'
  );

  const menuIconClassName = ComponentHelpers.generateClassName(
    'w-5 h-5 text-gray-300',
    'dark:text-gray-700'
  );

  /**
   * Manipula o clique no botão de menu
   */
  const handleMenuClick = (): void => {
    onMenuClick?.();
  };

  return (
    <header className={headerClassName} data-testid="app-header">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center overflow-x-hidden">
        {/* Seção esquerda - Menu e título */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {showMenuButton && (
            <button
              onClick={handleMenuClick}
              className={menuButtonClassName}
              aria-label="Abrir menu de navegação"
              data-testid="menu-button"
            >
              <Menu className={menuIconClassName} />
            </button>
          )}
          <h1 className={titleClassName}>
            My Wallet
          </h1>
        </div>

        {/* Seção direita - Saudação e controles */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span 
            className={userGreetingClassName}
            title={`Logado como: ${user.email || 'Usuário'}`}
            data-testid="user-greeting"
          >
            Olá, {displayName}!
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
