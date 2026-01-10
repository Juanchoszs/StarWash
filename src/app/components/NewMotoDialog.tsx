import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { useStore } from '../context/StoreContext';
import { PlusCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MotoFormData {
  plate: string;
  phone: string;
  serviceId: string;
  workshopId: string;
}

export const NewMotoDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { addMoto, services, workshops } = useStore();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MotoFormData>();
  
  const [safePlate, setSafePlate] = useState('');

  useEffect(() => {
    let timer: any;
    if (open) {
      setCurrentTime(new Date());
      timer = setInterval(() => setCurrentTime(new Date()), 60000);
      setSafePlate(''); // Reset plate when opening
    }
    return () => clearInterval(timer);
  }, [open]);

  const selectedServiceId = watch('serviceId');
  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedWorkshopId = watch('workshopId');

  const onSubmit = (data: MotoFormData) => {
    addMoto({
      plate: safePlate || 'SIN PLACA',
      phone: data.phone || '',
      serviceId: data.serviceId,
      workshopId: data.workshopId === 'none' ? undefined : data.workshopId,
    });
    setOpen(false);
    reset();
    setSafePlate('');
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    if (selectedWorkshopId && selectedWorkshopId !== 'none') return selectedService.workshopPrice;
    return selectedService.price;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Moto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="new-moto-desc">
        <DialogHeader>
          <DialogTitle>Ingresar Moto al Lavadero</DialogTitle>
          <p id="new-moto-desc" className="text-sm text-slate-500">Ingrese los datos de la moto para asignarla a la sala de espera.</p>
        </DialogHeader>
        
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-700">
           <Clock className="w-4 h-4" />
           <span>Hora de ingreso: <strong>{format(currentTime, 'h:mm a', { locale: es })}</strong></span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          
          <div className="space-y-2">
            <Label htmlFor="plate">Placa</Label>
            <Input 
              id="plate" 
              value={safePlate}
              onChange={(e) => setSafePlate(e.target.value.toUpperCase())}
              placeholder="12H" 
              autoComplete="off"
              className="uppercase font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input 
              id="phone" 
              type="tel"
              placeholder="3001234567" 
              {...register('phone')} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Servicio</Label>
            <Select onValueChange={(val) => setValue('serviceId', val)} defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('serviceId', { required: true })} />
            {errors.serviceId && <span className="text-red-500 text-xs">Seleccione un servicio</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="workshop">Taller (Opcional)</Label>
            <Select onValueChange={(val) => setValue('workshopId', val)} defaultValue="none">
              <SelectTrigger>
                <SelectValue placeholder="¿Viene de taller?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Particular (Cliente normal)</SelectItem>
                {workshops.filter(w => w.active).map(workshop => (
                  <SelectItem key={workshop.id} value={workshop.id}>
                    {workshop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <div className="p-3 bg-slate-100 rounded-md flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Precio Estimado:</span>
              <span className="text-lg font-bold text-slate-900">
                ${calculateTotal().toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600">Ingresar Moto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
