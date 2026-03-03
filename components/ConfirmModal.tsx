
import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmWord?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, confirmWord = 'CONFIRMAR', onConfirm, onCancel }) => {
    const [input, setInput] = useState('');

    if (!isOpen) return null;

    const isMatch = input.trim().toUpperCase() === confirmWord.toUpperCase();

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 border-4 border-rose-500">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-100 rounded-2xl">
                            <AlertTriangle size={24} className="text-rose-600" />
                        </div>
                        <h3 className="font-black text-lg uppercase italic tracking-tight text-slate-900">{title}</h3>
                    </div>
                    <button onClick={() => { setInput(''); onCancel(); }} className="p-2 bg-slate-100 rounded-full"><X size={18} /></button>
                </div>

                <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed">{message}</p>

                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 mb-4">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-2">
                        Escribe "{confirmWord}" para continuar
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={confirmWord}
                        className="w-full p-4 bg-white border-2 border-rose-300 rounded-xl font-black text-center text-lg uppercase outline-none focus:border-rose-500 text-rose-900"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button onClick={() => { setInput(''); onCancel(); }} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest">
                        Cancelar
                    </button>
                    <button
                        onClick={() => { if (isMatch) { setInput(''); onConfirm(); } }}
                        disabled={!isMatch}
                        className="flex-[2] py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-colors"
                    >
                        Confirmar Acción
                    </button>
                </div>
            </div>
        </div>
    );
};
