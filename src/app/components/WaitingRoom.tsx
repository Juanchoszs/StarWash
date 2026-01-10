import React from 'react';
import { useDrop } from 'react-dnd';
import { Moto, useStore } from '../context/StoreContext';
import { MotoCard } from './MotoCard';
import { ScrollArea } from '../components/ui/scroll-area';

export const WaitingRoom: React.FC = () => {
  const { motos, updateMotoStatus } = useStore();
  
  const waitingMotos = motos.filter(m => m.status === 'waiting');

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MOTO',
    drop: (item: { id: string }) => {
      updateMotoStatus(item.id, 'waiting', undefined); // Remove worker assignment
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [motos, updateMotoStatus]);

  return (
    <div 
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>} 
      className={`h-full bg-slate-50 rounded-xl border-2 border-dashed ${isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}
    >
      <div className="p-4 bg-slate-100 rounded-t-xl border-b border-slate-200">
        <h2 className="font-bold text-lg text-slate-700 flex items-center justify-between">
          Sala de Espera
          <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-full text-xs">
            {waitingMotos.length}
          </span>
        </h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-220px)] p-4">
        {waitingMotos.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">
            <p>No hay motos en espera</p>
          </div>
        ) : (
          waitingMotos.map(moto => (
            <MotoCard key={moto.id} moto={moto} />
          ))
        )}
      </ScrollArea>
    </div>
  );
};
