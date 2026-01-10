import React from 'react';
import { useDrop } from 'react-dnd';
import { Moto, useStore } from '../context/StoreContext';
import { MotoCard } from './MotoCard';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

interface WorkerLaneProps {
  workerId: string;
  workerName: string;
}

export const WorkerLane: React.FC<WorkerLaneProps> = ({ workerId, workerName }) => {
  const { motos, updateMotoStatus } = useStore();
  
  // Get motos assigned to this worker that are NOT delivered yet
  const workerMotos = motos.filter(m => m.workerId === workerId && m.status !== 'delivered');
  const activeMotos = workerMotos.filter(m => m.status === 'washing');
  const readyMotos = workerMotos.filter(m => m.status === 'ready');

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MOTO',
    drop: (item: { id: string }) => {
      updateMotoStatus(item.id, 'washing', workerId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [motos, updateMotoStatus, workerId]);

  const handleMarkReady = (motoId: string) => {
    updateMotoStatus(motoId, 'ready', workerId);
  };

  const handleMarkDelivered = (motoId: string) => {
    updateMotoStatus(motoId, 'delivered', workerId);
    toast.success('Moto entregada y pagada');
  };

  return (
    <div 
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      className={`flex flex-col h-full bg-white rounded-xl border transition-colors ${isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
    >
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-slate-200">
          <AvatarFallback className="text-slate-700 font-bold">
            {workerName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-slate-800">{workerName}</h3>
          <p className="text-xs text-slate-500">{activeMotos.length} en proceso</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {/* Active Washing Section */}
        {activeMotos.length > 0 && (
          <div className="mb-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lavando</h4>
            {activeMotos.map(moto => (
              <div key={moto.id} className="relative group">
                <MotoCard moto={moto} />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                  {/* Overlay for indication only, the button is below */}
                </div>
                <Button 
                  onClick={() => handleMarkReady(moto.id)}
                  className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar Lista
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Ready Section */}
        {readyMotos.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Listas para entregar</h4>
            {readyMotos.map(moto => (
              <div key={moto.id}>
                <MotoCard moto={moto} />
                <Button 
                  variant="outline"
                  onClick={() => handleMarkDelivered(moto.id)}
                  className="w-full mb-4 text-slate-600 hover:text-green-700 hover:bg-green-50 border-slate-200"
                  size="sm"
                >
                  Entregar y Cobrar
                </Button>
              </div>
            ))}
          </div>
        )}

        {workerMotos.length === 0 && (
          <div className="h-32 flex items-center justify-center text-slate-300 text-sm italic">
            Arrastra una moto aquí
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
