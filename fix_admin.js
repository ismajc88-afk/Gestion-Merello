const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'AdminControlPanel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The broken section: from the opening of the p-10 div to the closing of the masters content
// We'll find the start marker and end marker and replace in between
const startMarker = '<div className="p-10 space-y-8">\n                               onChange={e => setNewVal(e.target.value)}';

const replacement = `<div className="p-10 space-y-8">
                         {activeMaster !== 'BASICS' ? (
                           <>
                             <div className="flex gap-2">
                               <input
                                  value={newVal}
                                  onChange={e => setNewVal(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleMasterAdd(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster])}
                                  placeholder={\`Nueva entrada para \${activeMaster.toLowerCase()}...\`}
                                  className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold outline-none focus:bg-white focus:border-indigo-300 shadow-inner"
                               />
                               <button
                                  onClick={() => handleMasterAdd(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster])}
                                  className="px-10 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                               >Añadir</button>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                               {((config as any)[({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster]] as string[] ?? []).map((item: string) => (
                                  <div key={item} className="p-6 bg-white border-2 border-slate-50 rounded-[32px] flex justify-between items-center group hover:border-indigo-100 transition-all shadow-sm">
                                     <span className="font-bold text-slate-800 text-sm uppercase italic tracking-tighter">{item}</span>
                                     <button onClick={() => handleMasterRemove(({ SUPPLIERS: 'supplierCategories', BUDGET: 'budgetCategories', STOCK: 'stockCategories', UNITS: 'units', LOCATIONS: 'locations' } as any)[activeMaster], item)} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X size={16} /></button>
                                  </div>
                               ))}
                             </div>
                           </>
                         ) : (
                           <>
                             <p className="text-xs text-slate-500 font-bold italic">Al pulsar "Cargar Básicos" en la Lista de Compra, solo se añaden artículos cuyo stock esté por debajo del mínimo configurado.</p>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                               <input value={newBasic.name} onChange={e => setNewBasic({...newBasic, name: e.target.value})} placeholder="Artículo" className="col-span-2 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-400" />
                               <input type="number" min="1" value={newBasic.quantity} onChange={e => setNewBasic({...newBasic, quantity: e.target.value})} placeholder="Cant." className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-400" />
                               <input value={newBasic.unit} onChange={e => setNewBasic({...newBasic, unit: e.target.value})} placeholder="Unidad" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-400" />
                               <select value={newBasic.location} onChange={e => setNewBasic({...newBasic, location: e.target.value})} className="col-span-2 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none">
                                  <option value="">Ubicación...</option>
                                  {config.locations.map(l => <option key={l} value={l}>{l}</option>)}
                               </select>
                               <button onClick={() => {
                                  if (!newBasic.name || !newBasic.location) return;
                                  setConfig({...config, basicItems: [...(config.basicItems ?? []), { name: newBasic.name, quantity: parseInt(newBasic.quantity) || 1, unit: newBasic.unit || 'u', location: newBasic.location }]});
                                  setNewBasic({ name: '', quantity: '1', unit: 'u', location: '' });
                               }} className="col-span-2 p-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                  <Plus size={16}/> Añadir Básico
                               </button>
                             </div>
                             <div className="space-y-3">
                               {(config.basicItems ?? []).length === 0 && <p className="text-center text-slate-400 text-xs italic py-4">Sin artículos básicos configurados.</p>}
                               {(config.basicItems ?? []).map((b, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                     <div>
                                        <span className="font-bold text-slate-800 text-sm uppercase">{b.name}</span>
                                        <span className="text-xs text-slate-400 ml-2">{b.quantity} {b.unit} · {b.location}</span>
                                     </div>
                                     <button onClick={() => setConfig({...config, basicItems: (config.basicItems ?? []).filter((_, idx) => idx !== i)})} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                                  </div>
                               ))}
                             </div>
                           </>
                         )}`;

// Find the broken section from the start of p-10 div
const brokenEnd = `                      </div>
                   </div>
                )}

               {/* TEMA: PERMISOS POR ROL */}`;

const goodEnd = `                      </div>
                   </div>
                )}

               {/* TEMA: PERMISOS POR ROL */}`;

// Find start of broken section  
const idx = content.indexOf('<div className="p-10 space-y-8">\n                               onChange');
if (idx === -1) {
    console.log('Could not find broken section. Checking content around p-10...');
    const altIdx = content.indexOf('p-10 space-y-8');
    console.log('p-10 found at index:', altIdx);
    const snippet = content.substring(altIdx - 10, altIdx + 200);
    console.log('Snippet:', JSON.stringify(snippet));
    process.exit(1);
}

// Find the end of this section (closing of masters content div and the following section)
const endSearchStart = idx + 100;
const endMarker = '</div>\n                   </div>\n                )}\n\n               {/* TEMA: PERMISOS POR ROL */}';
const endIdx = content.indexOf(endMarker, endSearchStart);
if (endIdx === -1) {
    console.log('Could not find end marker');
    process.exit(1);
}

const before = content.substring(0, idx);
const after = content.substring(endIdx);

const fixed = before + replacement + '\n' + after;
fs.writeFileSync(filePath, fixed, 'utf8');
console.log('SUCCESS: Fixed AdminControlPanel.tsx');
