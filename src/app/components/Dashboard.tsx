import React from 'react';
import { useStore } from '../context/StoreContext';
import { WaitingRoom } from './WaitingRoom';
import { WorkerLane } from './WorkerLane';
import { NewMotoDialog } from './NewMotoDialog';
import { Settings } from 'lucide-react';
import { Button } from '../components/ui/button';

interface DashboardProps {
  onOpenAdmin: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAdmin }) => {
  const { workers } = useStore();
  const activeWorkers = workers.filter(w => w.active);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 border-b px-4 md:px-6 flex items-center justify-between bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl">SW</div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">StarWash</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <NewMotoDialog />
          <Button variant="ghost" size="icon" onClick={onOpenAdmin} title="Administración">
            <Settings className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
        {/* Waiting Room - Bottom on mobile (order-2), Left on desktop (order-1) */}
        <div className="flex-1 md:h-full md:w-80 md:flex-none border-t md:border-t-0 md:border-r border-slate-200 pt-2 md:pt-0 md:pr-4 overflow-hidden order-2 md:order-1 min-h-0">
          <WaitingRoom />
        </div>

        {/* Workers Grid - Top on mobile (order-1), Right on desktop (order-2) */}
        <div className="h-56 md:h-full flex-shrink-0 overflow-x-auto overflow-y-hidden order-1 md:order-2 md:flex-1">
          <div className="flex gap-2 md:gap-4 h-full min-w-max pb-2 md:pr-2">
            {activeWorkers.length === 0 ? (
              <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-xl border-slate-200">
                <div className="text-center text-slate-400 p-4">
                  <p className="text-lg font-medium">No hay lavadores activos</p>
                  <p className="text-sm">Vaya a administración para agregar trabajadores</p>
                </div>
              </div>
            ) : (
              activeWorkers.map(worker => (
                <div key={worker.id} className="w-72 h-full">
                  <WorkerLane 
                    workerId={worker.id} 
                    workerName={worker.name} 
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
