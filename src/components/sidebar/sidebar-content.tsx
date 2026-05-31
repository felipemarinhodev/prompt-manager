'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '../ui/button';
import {
  ArrowLeftToLine,
  X as CloseButton,
  Plus as AddIcon,
  ArrowRightToLine,
  Menu,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../logo';
import { Input } from '../ui/input';
import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PromptList } from '../prompts';
import { searchPromptAction } from '@/app/actions/prompt.actions';
import { Spinner } from '../ui/spinner';
import { motion } from 'motion/react';

export type SidebarContentProps = {
  prompts: PromptSummary[];
};

export const SidebarContent = ({ prompts }: SidebarContentProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchState, searchAction, isPending] = useActionState(
    searchPromptAction,
    { success: true, prompts: [] }
  );

  const [query, setQuery] = useState(searchParams.get('q') || '');

  const hasQuery = query.trim().length > 0;
  const promptsList = hasQuery ? (searchState.prompts ?? prompts) : prompts;

  const initialMotion = { opacity: 0 };
  const fadeTransition = { duration: 0.2, delay: 0.1 };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const collapseSidebar = () => setIsCollapsed(true);
  const expandSidebar = () => setIsCollapsed(false);

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  const handleNewPrompt = () => router.push('/new');

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const newQuery = event.target.value;
    setQuery(newQuery);
    startTransition(() => {
      const url = newQuery ? `/?q=${encodeURIComponent(newQuery)}` : '/';
      router.push(url, { scroll: false });

      formRef.current?.requestSubmit();
    });
  };

  useEffect(() => {
    if (!hasQuery) return;

    formRef.current?.requestSubmit();
  }, [hasQuery]);

  return (
    <>
      <Button
        className="md:hidden fixed top-6 left-6 z-50"
        variant="secondary"
        title="Abrir menu"
        aria-label="Abrir menu"
        aria-expanded={isMobileOpen}
        onClick={openMobile}
      >
        <Menu className="w-5 h-5 text-gray-100" />
      </Button>
      <motion.aside
        className={`border-r border-gray-700 flex flex-col h-full bg-gray-800 transition-[transform,width] duration-300 ease-in-out fixed md:relative left-0 top-0 z-50 md:z-auto w-[80vw] sm:w-[320px] ${isCollapsed ? 'md:w-[72px]' : 'md:w-[384px]'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        initial={false}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
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
            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={initialMotion}
              animate={{ opacity: 1 }}
              transition={fadeTransition}
            >
              <Button
                onClick={handleNewPrompt}
                aria-label="Novo prompt"
                title="Novo prompt"
              >
                <AddIcon className="h-5 w-5 text-white" />
              </Button>
            </motion.div>
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
                    onClick={closeMobile}
                  >
                    <CloseButton
                      className="w-5 h-5 text-gray-100"
                      onClick={expandSidebar}
                    />
                  </Button>
                </div>
              </div>
              <motion.div
                className="flex w-full items-center justify-between mb-6"
                initial={initialMotion}
                animate={{ opacity: 1 }}
                transition={fadeTransition}
              >
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
              </motion.div>
              <section className="mb-5">
                <form
                  action={searchAction}
                  className="relative group w-full"
                  ref={formRef}
                >
                  <Input
                    name="q"
                    type="text"
                    placeholder="Buscar prompts..."
                    onChange={handleQueryChange}
                    value={query}
                    autoFocus
                  />
                  {isPending && (
                    <div
                      title="Carregando prompts"
                      aria-label="Carregando prompts"
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-300"
                    >
                      <Spinner />
                    </div>
                  )}
                </form>
              </section>
              <motion.div
                initial={initialMotion}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeTransition}
              >
                <Button className="w-full" size="lg" onClick={handleNewPrompt}>
                  <AddIcon className="h-5 w-5 mr-8" />
                  Novo prompt
                </Button>
              </motion.div>
            </section>
            <motion.nav
              className="flex-1 overflow-auto px-6 pb-6"
              aria-label="Lista de prompts"
              initial={initialMotion}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
            >
              <PromptList prompts={promptsList} />
            </motion.nav>
          </>
        )}
      </motion.aside>
    </>
  );
};
