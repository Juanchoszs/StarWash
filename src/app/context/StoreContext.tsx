import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// --- Types ---

export type Status = 'waiting' | 'washing' | 'ready' | 'delivered';

export interface Service {
  id: string;
  name: string;
  price: number;
  workshopPrice: number;
  workerCommission: number; // Regular commission
  workshopWorkerCommission?: number; // Commission when service is for a workshop
}

export interface Worker {
  id: string;
  name: string;
  active: boolean;
}

export interface Workshop {
  id: string;
  name: string;
  active: boolean;
}

export interface Moto {
  id: string;
  plate: string;
  phone: string;
  serviceId: string;
  workshopId?: string; // If null, it's a regular customer
  workerId?: string; // If null, it's in waiting room
  status: Status;
  entryTime: Date;
  completionTime?: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
}

interface StoreContextType {
  motos: Moto[];
  workers: Worker[];
  services: Service[];
  workshops: Workshop[];
  expenses: Expense[];
  loading: boolean;
  
  addMoto: (moto: Omit<Moto, 'id' | 'entryTime' | 'status'>) => void;
  updateMotoStatus: (motoId: string, status: Status, workerId?: string) => void;
  deleteMoto: (motoId: string) => void;
  
  addWorker: (name: string) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  addWorkshop: (name: string) => void;
  updateWorkshop: (id: string, updates: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;

  addExpense: (description: string, amount: number) => void;
  deleteExpense: (id: string) => void;
  
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

// --- API Helper ---

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-62b0d326/api`;

const api = {
  get: async () => {
    try {
      const res = await fetch(`${API_URL}/data`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  sync: async (type: string, data: any[]) => {
    try {
      await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, data })
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Error guardando datos en la nube');
    }
  }
};

// --- Context ---

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Initial Load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.get();
      if (data) {
        // Parse dates
        const parsedMotos = (data.motos || []).map((m: any) => ({
          ...m,
          entryTime: new Date(m.entryTime),
          completionTime: m.completionTime ? new Date(m.completionTime) : undefined
        }));
        
        setMotos(parsedMotos);
        setWorkers(data.workers || []);
        setServices(data.services || []);
        setWorkshops(data.workshops || []);
        setExpenses((data.expenses || []).map((e: any) => ({
          ...e,
          date: new Date(e.date)
        })));
      }
      setLoading(false);
    };
    load();
  }, []);

  // --- Actions ---

  const addMoto = (data: Omit<Moto, 'id' | 'entryTime' | 'status'>) => {
    const newMoto: Moto = {
      ...data,
      id: crypto.randomUUID(),
      entryTime: new Date(),
      status: 'waiting',
      workerId: undefined,
    };
    const updated = [...motos, newMoto];
    setMotos(updated);
    api.sync('motos', updated);
    toast.success(`Moto ${data.plate} ingresada a sala de espera`);
  };

  const updateMotoStatus = (motoId: string, status: Status, workerId?: string) => {
    const updated = motos.map(m => {
      if (m.id === motoId) {
        const updates: Partial<Moto> = { status };
        if (workerId !== undefined) updates.workerId = workerId;
        if (status === 'ready' && !m.completionTime) updates.completionTime = new Date();
        if (status === 'ready') toast.success(`Moto ${m.plate} marcada como LISTA`);
        return { ...m, ...updates };
      }
      return m;
    });
    setMotos(updated);
    api.sync('motos', updated);
  };

  const deleteMoto = (motoId: string) => {
    const updated = motos.filter(m => m.id !== motoId);
    setMotos(updated);
    api.sync('motos', updated);
    toast.success('Moto eliminada');
  };

  // Workers
  const addWorker = (name: string) => {
    const updated = [...workers, { id: crypto.randomUUID(), name, active: true }];
    setWorkers(updated);
    api.sync('workers', updated);
    toast.success('Trabajador agregado');
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    const updated = workers.map(w => w.id === id ? { ...w, ...updates } : w);
    setWorkers(updated);
    api.sync('workers', updated);
  };

  const deleteWorker = (id: string) => {
    const updated = workers.filter(w => w.id !== id);
    setWorkers(updated);
    api.sync('workers', updated);
    toast.success('Trabajador eliminado');
  };

  // Services
  const addService = (data: Omit<Service, 'id'>) => {
    const updated = [...services, { ...data, id: crypto.randomUUID() }];
    setServices(updated);
    api.sync('services', updated);
    toast.success('Servicio creado');
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...updates } : s);
    setServices(updated);
    api.sync('services', updated);
  };

  const deleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    api.sync('services', updated);
    toast.success('Servicio eliminado');
  };

  // Workshops
  const addWorkshop = (name: string) => {
    const updated = [...workshops, { id: crypto.randomUUID(), name, active: true }];
    setWorkshops(updated);
    api.sync('workshops', updated);
    toast.success('Taller agregado');
  };

  const updateWorkshop = (id: string, updates: Partial<Workshop>) => {
    const updated = workshops.map(w => w.id === id ? { ...w, ...updates } : w);
    setWorkshops(updated);
    api.sync('workshops', updated);
  };

  const deleteWorkshop = (id: string) => {
    const updated = workshops.filter(w => w.id !== id);
    setWorkshops(updated);
    api.sync('workshops', updated);
    toast.success('Taller eliminado');
  };

  // Expenses
  const addExpense = (description: string, amount: number) => {
    const updated = [...expenses, { id: crypto.randomUUID(), description, amount, date: new Date() }];
    setExpenses(updated);
    api.sync('expenses', updated);
    toast.success('Gasto registrado');
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    api.sync('expenses', updated);
    toast.success('Gasto eliminado');
  };

  // Auth
  const loginAdmin = (password: string) => {
    if (password === 'StarWashAdministracion') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => setIsAdminAuthenticated(false);

  return (
    <StoreContext.Provider value={{
      motos, workers, services, workshops, loading,
      addMoto, updateMotoStatus, deleteMoto,
      addWorker, updateWorker, deleteWorker,
      addService, updateService, deleteService,
      addWorkshop, updateWorkshop, deleteWorkshop,
      expenses, addExpense, deleteExpense,
      isAdminAuthenticated, loginAdmin, logoutAdmin
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
