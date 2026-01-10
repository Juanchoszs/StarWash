import React from 'react';
import { useDrop } from 'react-dnd';
import { Moto, useStore } from '../context/StoreContext';
import { MotoCard } from './MotoCard';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

interface WorkerLaneProps {
  workerId: string;
  workerName: string;
}

export const WorkerLane: React.FC<WorkerLaneProps> = ({ workerId, workerName }) => {
  const { motos, updateMotoStatus } = useStore();
  const [pendingMoto, setPendingMoto] = React.useState<string | null>(null);
  
  // Get motos assigned to this worker that are NOT delivered yet
  const workerMotos = motos.filter(m => m.workerId === workerId && m.status !== 'delivered');
  const activeMotos = workerMotos.filter(m => m.status === 'washing');
  const readyMotos = workerMotos.filter(m => m.status === 'ready');

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MOTO',
    drop: (item: { id: string }) => {
      // Instead of updating immediately, set pending state
      setPendingMoto(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [motos, updateMotoStatus, workerId]);

  const confirmAssignment = () => {
    if (pendingMoto) {
      updateMotoStatus(pendingMoto, 'washing', workerId);
      setPendingMoto(null);
      toast.success(`Moto asignada a ${workerName}`);
    }
  };

  const handleMarkReady = (motoId: string) => {
    updateMotoStatus(motoId, 'ready', workerId);
  };

  const handleMarkDelivered = (motoId: string) => {
    updateMotoStatus(motoId, 'delivered', workerId);
    toast.success('Moto entregada y pagada');
  };

  return (
    <>
      <div 
        ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
        className={`flex flex-col h-full bg-white rounded-xl border transition-colors ${isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
      >
        <div className="p-2 border-b border-slate-100 flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-slate-200">
            <AvatarFallback className="text-slate-700 font-bold text-xs">
              {workerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-sm text-slate-800">{workerName}</h3>
            <p className="text-[10px] text-slate-500">{activeMotos.length} lavando</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          {/* Active Washing Section */}
          {activeMotos.length > 0 && (
            <div className="mb-2 space-y-2">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Lavando</h4>
              {activeMotos.map(moto => (
                <div key={moto.id} className="relative group">
                  <MotoCard moto={moto} />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                    {/* Overlay for indication only, the button is below */}
                  </div>
                  <Button 
                    onClick={() => handleMarkReady(moto.id)}
                    className="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
                    size="sm"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Lista
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Ready Section */}
          {readyMotos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Listas</h4>
              {readyMotos.map(moto => (
                <div key={moto.id}>
                  <MotoCard moto={moto} />
                  <Button 
                    variant="outline"
                    onClick={() => handleMarkDelivered(moto.id)}
                    className="w-full mb-2 text-slate-600 hover:text-green-700 hover:bg-green-50 border-slate-200 h-7 text-xs"
                    size="sm"
                  >
                    Entregar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {workerMotos.length === 0 && (
            <div className="h-24 flex items-center justify-center text-slate-300 text-xs italic">
              Arrastra aquí
            </div>
          )}
        </ScrollArea>
      </div>

      <AlertDialog open={!!pendingMoto} onOpenChange={(open) => !open && setPendingMoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Asignar moto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas asignar esta moto a <strong>{workerName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingMoto(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAssignment}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
