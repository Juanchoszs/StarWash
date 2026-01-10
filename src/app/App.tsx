import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StoreProvider, useStore } from './context/StoreContext';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Button } from './components/ui/button';
import { Toaster } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import '../styles/index.css';

const MainApp = () => {
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');
  const { isAdminAuthenticated } = useStore();

  return (
    <>
      {view === 'dashboard' && (
        <Dashboard onOpenAdmin={() => setView('admin')} />
      )}
      
      {view === 'admin' && (
        <div className="h-screen flex flex-col">
          <header className="h-16 border-b px-6 flex items-center bg-white shadow-sm">
             <Button variant="ghost" onClick={() => setView('dashboard')} className="gap-2">
               <ChevronLeft className="w-4 h-4" /> Volver al Lavadero
             </Button>
          </header>
          <div className="flex-1 overflow-auto">
            <AdminPanel />
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <DndProvider backend={HTML5Backend}>
        <MainApp />
        <Toaster position="top-right" />
      </DndProvider>
    </StoreProvider>
  );
}
