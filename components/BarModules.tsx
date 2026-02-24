import React from 'react';
import { Shift, ShiftTime, Member } from '../types';
import { Users, Clock, Printer } from 'lucide-react';

interface BarProps {
  shifts: Shift[];
  members: Member[];
  onAutoAssign: () => void;
}

export const BarModules: React.FC<BarProps> = ({ shifts, members, onAutoAssign }) => {
  const dates = Array.from(new Set(shifts.map(s => s.date))).sort() as string[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cuadrante de Barra</h2>
          <p className="text-gray-500 text-sm">Organización de turnos 24/7</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onAutoAssign}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md"
          >
            <Users size={18} /> Auto-Completar Inteligente
          </button>
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dates.map(date => (
          <div key={date} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-orange-500 p-3 text-white font-bold text-center">
              {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="divide-y divide-gray-100">
              {shifts.filter(s => s.date === date).map(shift => (
                <div key={shift.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-orange-600 font-semibold">
                    <Clock size={16} /> {shift.time}
                  </div>
                  <div className="space-y-1">
                    {shift.assignedMembers.length > 0 ? (
                      shift.assignedMembers.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          {m}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-red-400 italic p-2 border border-dashed border-red-200 rounded">
                        Sin asignar
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};