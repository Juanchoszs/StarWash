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
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b px-6 flex items-center justify-between bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl">SW</div>
          <h1 className="text-xl font-bold text-slate-800">StarWash Lavadero</h1>
        </div>
        <div className="flex items-center gap-4">
          <NewMotoDialog />
          <Button variant="ghost" size="icon" onClick={onOpenAdmin} title="Administración">
            <Settings className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden flex gap-6">
        {/* Left: Waiting Room */}
        <div className="w-80 flex-shrink-0 h-full">
          <WaitingRoom />
        </div>

        {/* Right: Workers Grid */}
        <div className="flex-1 h-full overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {activeWorkers.length === 0 ? (
              <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-xl border-slate-200">
                <div className="text-center text-slate-400">
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
