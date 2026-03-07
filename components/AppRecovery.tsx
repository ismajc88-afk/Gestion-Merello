import { useState } from 'react';

export const AppRecovery = () => {
    const [status, setStatus] = useState('ESPERANDO ACCIÓN');

    const handleReset = () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
            setStatus('DATOS BORRADOS. REINICIANDO...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (e) {
            setStatus('ERROR: ' + e);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: '#111', color: 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'sans-serif', textAlign: 'center', padding: 20
        }}>
            <h1 style={{ color: '#f00', fontSize: '3rem', marginBottom: '1rem' }}>SISTEMA DE RECUPERACIÓN</h1>
            <p style={{ maxWidth: '500px', marginBottom: '2rem', lineHeight: '1.5' }}>
                La aplicación ha entrado en modo de emergencia debido a un error persistente.
                Para restaurar el servicio, es necesario limpiar la memoria local corrupta.
            </p>

            <div style={{ padding: '20px', background: '#222', borderRadius: '10px', marginBottom: '20px' }}>
                ESTADO: <span style={{ color: '#0f0', fontWeight: 'bold' }}>{status}</span>
            </div>

            <button
                onClick={handleReset}
                style={{
                    background: '#f00', color: 'white', border: 'none',
                    padding: '20px 40px', fontSize: '1.5rem', fontWeight: 'bold',
                    borderRadius: '50px', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,0,0,0.5)'
                }}
            >
                🧨 BORRAR TODO Y RECUPERAR
            </button>

            <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.8rem' }}>
                Esta acción es segura. Solo borra la configuración local del navegador.
            </p>
        </div>
    );
};

export default AppRecovery;
