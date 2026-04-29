'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import {
  ArrowLeftToLine,
  X as CloseButton,
  Plus as AddIcon,
  ArrowRightToLine,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '../logo';
import { Input } from '../ui/input';

type Prompt = {
  id: string;
  title: string;
  content: string;
};

export type SidebarContentProps = {
  prompts: Prompt[];
};

export const SidebarContent = ({ prompts }: SidebarContentProps) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseSidebar = () => setIsCollapsed(true);
  const expandSidebar = () => setIsCollapsed(false);

  const handleNewPrompt = () => router.push('/new');

  return (
    <aside
      className={`border-r border-gray-700 flex flex-col h-full bg-gray-800 transition-[transform,width] duration-300 ease-in-out fixed md:relative left-0 top-0 z-50 md:z-auto w-[80vw] sm:w-[320px] ${isCollapsed ? 'md:w-[72px]' : 'md:w-[384px]'}`}
    >
      {isCollapsed && (
        <section className="px-2 py-6">
          <header className="flex items-center justify-center mb-6">
            <Button
              variant="icon"
              className="hidden md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
              title="Expandir sidebar"
              aria-label="Expandir sidebar"
              onClick={expandSidebar}
            >
              <ArrowRightToLine
                className="w-5 h-5 text-gray-100"
                onClick={expandSidebar}
              />
            </Button>
          </header>
        </section>
      )}

      {!isCollapsed && (
        <>
          <section className="p-6">
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  aria-label="Fechar menu"
                  title="Fechar menu"
                >
                  <CloseButton
                    className="w-5 h-5 text-gray-100"
                    onClick={expandSidebar}
                  />
                </Button>
              </div>
            </div>
            <div className="flex w-full items-center justify-between mb-6">
              <header className="flex w-full items-center justify-between">
                <Logo />
                <Button
                  variant="icon"
                  onClick={collapseSidebar}
                  className="hidden md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
                  title="Minimizar sidebar"
                  aria-label="Minimizar sidebar"
                >
                  <ArrowLeftToLine className="w-5 h-5 text-gray-100" />
                </Button>
              </header>
            </div>
            <section className="mb-5">
              <form action="">
                <Input
                  name="q"
                  type="text"
                  placeholder="Buscar prompts..."
                  autoFocus
                />
              </form>
            </section>
            <div>
              <Button className="w-full" size="lg" onClick={handleNewPrompt}>
                <AddIcon className="h-5 w-5 mr-8" />
                Novo prompt
              </Button>
            </div>
          </section>
        </>
      )}
      {prompts.map((prompt) => (
        <p key={prompt.id}>{prompt.title}</p>
      ))}
    </aside>
  );
};
