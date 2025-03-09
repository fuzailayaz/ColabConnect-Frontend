'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Home, FolderKanban, Users, MessageSquare, CheckSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Remove isCollapsed from the interface as it's not being used
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', path: '/dashboard/home', icon: Home, label: 'Dashboard' },
  { id: 'projects', path: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { id: 'teams', path: '/dashboard/teams', icon: Users, label: 'Teams' },
  { id: 'messages', path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { id: 'tasks', path: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="fixed inset-y-0 left-0 transform lg:translate-x-0 z-50"
        >
          <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              <button onClick={onClose} className="lg:hidden">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="mt-5 px-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.path);
                    onClose();
                  }}
                  className={cn(
                    "flex items-center px-4 py-2 mt-2 text-sm font-semibold rounded-lg",
                    pathname === item.path
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;