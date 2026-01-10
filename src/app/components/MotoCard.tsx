import React from 'react';
import { useDrag } from 'react-dnd';
import { Moto, useStore } from '../context/StoreContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Phone, User, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../components/ui/button';

export const MotoCard: React.FC<{ moto: Moto }> = ({ moto }) => {
  const { services, workshops } = useStore();
  
  const service = services.find(s => s.id === moto.serviceId);
  const workshop = workshops.find(w => w.id === moto.workshopId);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MOTO',
    item: { id: moto.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [moto.id, moto]);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hola! Tu moto con placa ${moto.plate} está lista para ser recogida en StarWash.`;
    window.open(`https://wa.me/57${moto.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div ref={drag as unknown as React.LegacyRef<HTMLDivElement>} className={`mb-3 ${isDragging ? 'opacity-50' : ''}`}>
      <Card className="cursor-grab hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold uppercase">{moto.plate}</h3>
            <Badge variant={moto.status === 'ready' ? 'default' : 'outline'}>
              {moto.status === 'waiting' ? 'En espera' : 
               moto.status === 'washing' ? 'Lavando' : 
               moto.status === 'ready' ? 'Lista' : 'Entregada'}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">{service?.name || 'Servicio desconocido'}</p>
            
            {workshop && (
              <p className="flex items-center text-blue-600 text-xs">
                <User className="w-3 h-3 mr-1" />
                {workshop.name}
              </p>
            )}
            
            <p className="flex items-center text-slate-500 text-xs font-medium">
              <Clock className="w-3 h-3 mr-1" />
              Ingreso: {format(moto.entryTime, 'h:mm a', { locale: es })}
            </p>

            {moto.status === 'ready' && moto.phone && (
              <Button 
                size="sm" 
                className="w-full mt-2 bg-green-600 hover:bg-green-700 h-7 text-xs"
                onClick={handleWhatsApp}
              >
                <Phone className="w-3 h-3 mr-1" />
                Notificar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
