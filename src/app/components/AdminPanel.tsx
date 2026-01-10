import React, { useState, useMemo } from 'react';
import { useStore, Moto, Service, Worker, Workshop } from '../context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { format, isSameDay, isSameMonth, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Lock, Plus, Save, Trash2, Calendar as CalendarIcon, DollarSign, History } from 'lucide-react';
import { toast } from 'sonner';

// --- Auth Component ---
const AdminAuth = () => {
  const { loginAdmin } = useStore();
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pass)) {
      setError(false);
    } else {
      setError(true);
      toast.error('Contraseña incorrecta');
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" /> Administración
          </CardTitle>
          <CardDescription>Ingrese la contraseña de gerente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input 
                type="password" 
                value={pass} 
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm">Acceso denegado</p>}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Sub Components ---

const StatisticsTab = () => {
  const { motos, services, expenses } = useStore();
  const today = new Date();

  const stats = useMemo(() => {
    const dailyMotos = motos.filter(m => isSameDay(new Date(m.entryTime), today));
    const monthlyMotos = motos.filter(m => isSameMonth(new Date(m.entryTime), today));
    const dailyExpenses = expenses.filter(e => isSameDay(new Date(e.date), today)).reduce((acc, e) => acc + e.amount, 0);
    const monthlyExpenses = expenses.filter(e => isSameMonth(new Date(e.date), today)).reduce((acc, e) => acc + e.amount, 0);
    
    const calculateFinancials = (list: Moto[]) => {
      let revenue = 0;
      let commissions = 0;

      list.forEach(m => {
        const service = services.find(s => s.id === m.serviceId);
        if (service) {
          // Revenue
          const price = m.workshopId ? service.workshopPrice : service.price;
          revenue += price;
          // Commission
          const commission = m.workshopId ? (service.workshopWorkerCommission ?? service.workerCommission) : service.workerCommission;
          commissions += commission;
        }
      });
      return { revenue, commissions };
    };

    const daily = calculateFinancials(dailyMotos);
    const monthly = calculateFinancials(monthlyMotos);

    return {
      dailyCount: dailyMotos.length,
      monthlyCount: monthlyMotos.length,
      dailyRevenue: daily.revenue,
      dailyNet: daily.revenue - daily.commissions - dailyExpenses,
      monthlyRevenue: monthly.revenue,
      monthlyNet: monthly.revenue - monthly.commissions - monthlyExpenses,
      dailyExpenses,
      monthlyExpenses
    };
  }, [motos, services, expenses, today]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Daily Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Motos Hoy</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ingresos Brutos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.dailyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Gastos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.dailyExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Ganancia Neta Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">${stats.dailyNet.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">Desc. Comisiones y Gastos</p>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Motos Mes</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ingresos Brutos Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Gastos Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.monthlyExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Ganancia Neta Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">${stats.monthlyNet.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">Desc. Comisiones y Gastos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const WorkersTab = () => {
  const { workers, addWorker, updateWorker, deleteWorker, motos, services } = useStore();
  const [newWorkerName, setNewWorkerName] = useState('');

  const calculateSalary = (workerId: string) => {
    // Calculate total commissions for this worker based on completed motos
    const completedMotos = motos.filter(m => m.workerId === workerId && (m.status === 'ready' || m.status === 'delivered'));
    return completedMotos.reduce((acc, m) => {
      const service = services.find(s => s.id === m.serviceId);
      if (!service) return acc;
      // If the moto came from a workshop, use the workshop commission (or fallback to regular if not set)
      if (m.workshopId) {
        return acc + (service.workshopWorkerCommission ?? service.workerCommission);
      }
      return acc + service.workerCommission;
    }, 0);
  };

  const handleAdd = () => {
    if (newWorkerName) {
      addWorker(newWorkerName);
      setNewWorkerName('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="space-y-2 flex-1 max-w-sm">
          <Label>Nuevo Trabajador</Label>
          <Input 
            value={newWorkerName} 
            onChange={(e) => setNewWorkerName(e.target.value)} 
            placeholder="Nombre completo"
          />
        </div>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Agregar</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Motos Atendidas</TableHead>
            <TableHead>Salario Acumulado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map(worker => {
             const salary = calculateSalary(worker.id);
             const motoCount = motos.filter(m => m.workerId === worker.id && (m.status === 'ready' || m.status === 'delivered')).length;
             return (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">{worker.name}</TableCell>
                <TableCell>
                  <Badge variant={worker.active ? 'default' : 'secondary'}>
                    {worker.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>{motoCount}</TableCell>
                <TableCell className="font-bold text-green-600">
                  ${salary.toLocaleString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => updateWorker(worker.id, { active: !worker.active })}
                  >
                    {worker.active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                        if(confirm('¿Seguro que desea eliminar a este trabajador?')) deleteWorker(worker.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const ServicesTab = () => {
  const { services, addService, updateService, deleteService } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h3 className="text-lg font-medium">Configuración de Servicios y Precios</h3>
         <Dialog open={isAdding} onOpenChange={setIsAdding}>
           <DialogTrigger asChild>
             <Button><Plus className="w-4 h-4 mr-2" /> Crear Servicio</Button>
           </DialogTrigger>
           <DialogContent aria-describedby="new-service-desc">
             <DialogHeader>
                <DialogTitle>Nuevo Servicio</DialogTitle>
                <p id="new-service-desc" className="text-sm text-slate-500">Configure los precios y comisiones para el nuevo servicio.</p>
             </DialogHeader>
             <ServiceForm onSubmit={(data) => { addService(data); setIsAdding(false); }} />
           </DialogContent>
         </Dialog>
       </div>

       <div className="grid gap-4">
         {services.map(service => (
           <Card key={service.id}>
             <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 space-y-1">
                 <Label>Nombre Servicio</Label>
                 <Input 
                   defaultValue={service.name} 
                   onChange={(e) => updateService(service.id, { name: e.target.value })} 
                 />
               </div>
               <div className="w-32 space-y-1">
                 <Label>Precio Público</Label>
                 <Input 
                   type="number" 
                   defaultValue={service.price} 
                   onChange={(e) => updateService(service.id, { price: Number(e.target.value) })} 
                 />
               </div>
               <div className="w-32 space-y-1">
                 <Label>Precio Taller</Label>
                 <Input 
                   type="number" 
                   defaultValue={service.workshopPrice} 
                   onChange={(e) => updateService(service.id, { workshopPrice: Number(e.target.value) })} 
                 />
               </div>
                <div className="w-32 space-y-1">
                  <Label>Comisión Normal</Label>
                  <Input 
                    type="number" 
                    defaultValue={service.workerCommission} 
                    onChange={(e) => updateService(service.id, { workerCommission: Number(e.target.value) })} 
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Label>Comisión Taller</Label>
                  <Input 
                    type="number" 
                    defaultValue={service.workshopWorkerCommission || 0} 
                    onChange={(e) => updateService(service.id, { workshopWorkerCommission: Number(e.target.value) })} 
                  />
                </div>
               <div className="w-32 space-y-1 flex flex-col justify-end">
                 <Label>Ganancia</Label>
                 <div className="h-10 px-3 py-2 bg-slate-100 rounded-md border flex items-center text-sm font-bold text-slate-600 mb-1">
                   ${(service.price - service.workerCommission).toLocaleString()}
                 </div>
               </div>
               <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    size="icon"
                    onClick={() => {
                        if(confirm('¿Eliminar servicio?')) deleteService(service.id);
                    }}
                >
                    <Trash2 className="w-4 h-4" />
               </Button>
             </CardContent>
           </Card>
         ))}
       </div>
    </div>
  );
};

const ServiceForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [workshopPrice, setWorkshopPrice] = useState(0);
  const [comm, setComm] = useState(0);
  const [workshopComm, setWorkshopComm] = useState(0);

  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Nombre</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="space-y-2"><Label>Precio Público</Label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
      <div className="space-y-2"><Label>Precio Taller</Label><Input type="number" value={workshopPrice} onChange={e => setWorkshopPrice(Number(e.target.value))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Comisión Normal</Label><Input type="number" value={comm} onChange={e => setComm(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Comisión Taller</Label><Input type="number" value={workshopComm} onChange={e => setWorkshopComm(Number(e.target.value))} /></div>
      </div>
      <Button onClick={() => onSubmit({ name, price, workshopPrice, workerCommission: comm, workshopWorkerCommission: workshopComm })} className="w-full">Guardar</Button>
    </div>
  );
};

const BillingTab = () => {
  const { workshops, addWorkshop, updateWorkshop, deleteWorkshop, motos, services } = useStore();
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const getWorkshopDailyBill = (workshopId: string) => {
    const dayStart = startOfDay(parseISO(date));
    const dayEnd = endOfDay(parseISO(date));
    
    const workshopMotos = motos.filter(m => 
      m.workshopId === workshopId && 
      (m.status === 'ready' || m.status === 'delivered') &&
      new Date(m.entryTime) >= dayStart &&
      new Date(m.entryTime) <= dayEnd
    );

    const total = workshopMotos.reduce((acc, m) => {
      const service = services.find(s => s.id === m.serviceId);
      return acc + (service?.workshopPrice || 0);
    }, 0);

    return { motos: workshopMotos, total };
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <h3 className="text-lg font-medium">Facturación de Talleres</h3>
        <Input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="w-auto"
        />
      </div>

      <div className="grid gap-6">
        {workshops.map(workshop => {
          const { motos: list, total } = getWorkshopDailyBill(workshop.id);
          
          return (
            <Card key={workshop.id}>
              <CardHeader className="bg-slate-50 border-b pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CardTitle>{workshop.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => {
                        if(confirm('¿Eliminar este taller? Se perderá el historial de facturación asociado.')) deleteWorkshop(workshop.id);
                    }}>
                        <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total del Día</p>
                    <p className="text-2xl font-bold text-blue-600">${total.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {list.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Placa</TableHead><TableHead>Servicio</TableHead><TableHead className="text-right">Precio</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {list.map(m => {
                        const s = services.find(ser => ser.id === m.serviceId);
                        return (
                          <TableRow key={m.id}>
                            <TableCell>{m.plate}</TableCell>
                            <TableCell>{s?.name}</TableCell>
                            <TableCell className="text-right">${s?.workshopPrice.toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-slate-400 italic">No hay servicios registrados para este taller en la fecha seleccionada.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="pt-8 border-t">
        <h4 className="font-bold mb-4">Gestión de Talleres</h4>
        {/* Simple Add Workshop */}
        <div className="flex gap-2 max-w-md">
           <Input placeholder="Nuevo Taller" id="new-workshop" />
           <Button onClick={() => {
             const el = document.getElementById('new-workshop') as HTMLInputElement;
             if (el.value) { addWorkshop(el.value); el.value = ''; }
           }}>Agregar</Button>
        </div>
      </div>
    </div>
  );
};

const HistoryTab = () => {
  const { motos, services, deleteMoto } = useStore();
  
  // Sort by date desc
  const historyMotos = useMemo(() => {
    return motos
      .filter(m => m.status === 'ready' || m.status === 'delivered')
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
      .slice(0, 50); // Limit to last 50 for performance
  }, [motos]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Historial Reciente (Últimos 50)</h3>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyMotos.map(m => {
              const s = services.find(ser => ser.id === m.serviceId);
              return (
                <TableRow key={m.id}>
                   <TableCell>{format(m.entryTime, 'dd/MM/yyyy HH:mm')}</TableCell>
                   <TableCell className="font-bold">{m.plate}</TableCell>
                   <TableCell>{s?.name}</TableCell>
                   <TableCell>
                      <Badge variant={m.status === 'delivered' ? 'secondary' : 'default'}>
                        {m.status === 'delivered' ? 'Entregado' : 'Listo'}
                      </Badge>
                   </TableCell>
                   <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => {
                          if (confirm('¿Eliminar registro? Esto afectará las estadísticas y facturación.')) {
                            deleteMoto(m.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                   </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// --- Expenses Tab ---

const ExpensesTab = () => {
  const { expenses, addExpense, deleteExpense } = useStore();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    if (!desc || !amount) return;
    addExpense(desc, Number(amount));
    setDesc('');
    setAmount('');
  };

  const sortedExpenses = useMemo(() => {
     return [...expenses].sort((a,b) => b.date.getTime() - a.date.getTime());
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-100 p-4 rounded-lg">
        <div className="space-y-2 flex-1 w-full">
          <Label>Descripción del Gasto</Label>
          <Input 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)} 
            placeholder="Ej: Jabón, Alquiler, Servicios..."
          />
        </div>
        <div className="space-y-2 w-full md:w-48">
          <Label>Monto</Label>
          <Input 
            type="number"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.00"
          />
        </div>
        <Button onClick={handleAdd} className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" /> Registrar Gasto</Button>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500">No hay gastos registrados</TableCell>
                </TableRow>
              ) : (
                sortedExpenses.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{format(item.date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">-${item.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="text-red-500"
                         onClick={() => {
                            if(confirm('¿Eliminar este gasto?')) deleteExpense(item.id);
                         }}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// --- History Tab ---

export const AdminPanel: React.FC = () => {
  const { isAdminAuthenticated, logoutAdmin } = useStore();

  if (!isAdminAuthenticated) {
    return <AdminAuth />;
  }

  return (
    <div className="p-6 h-full bg-slate-50/50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Administración StarWash</h1>
        <Button variant="outline" onClick={logoutAdmin} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4 mr-2" /> Salir
        </Button>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="workers">Trabajadores</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="services">Servicios y Precios</TabsTrigger>
          <TabsTrigger value="billing">Facturación Talleres</TabsTrigger>
          <TabsTrigger value="history">Historial / Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats"><StatisticsTab /></TabsContent>
        <TabsContent value="workers"><WorkersTab /></TabsContent>
        <TabsContent value="expenses"><ExpensesTab /></TabsContent>
        <TabsContent value="services"><ServicesTab /></TabsContent>
        <TabsContent value="billing"><BillingTab /></TabsContent>
        <TabsContent value="history"><HistoryTab /></TabsContent>
      </Tabs>
    </div>
  );
};
