// Proxy serverless para ntfy.sh (Vercel Edge Function)
// Resuelve el problema de routers/firewalls que bloquean ntfy.sh directamente.
// La app web envía aquí → Vercel reenvía a ntfy.sh (desde sus servidores, sin bloqueo).

export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { topic, title, message, priority, tags } = req.body;

        if (!topic || !message) {
            return res.status(400).json({ error: 'Missing topic or message' });
        }

        const response = await fetch('https://ntfy.sh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic,
                title: title || 'Alerta Merello',
                message,
                priority: priority || 4,
                tags: tags || ['rotating_light']
            })
        });

        if (response.ok) {
            const data = await response.text();
            return res.status(200).json({ success: true, data });
        } else {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText });
        }
    } catch (error) {
        console.error('Ntfy proxy error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
