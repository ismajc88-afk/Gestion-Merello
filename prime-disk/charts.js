/**
 * charts.js - Motor de visualización de gráficos
 * Sistema de gráficos interactivos sin dependencias externas
 */

const ChartsEngine = {
    /**
     * Renderiza gráfico de flujo de caja (líneas)
     */
    renderCashFlowChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Configurar tamaño del canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);

        if (!data || data.length === 0) {
            this.drawEmptyState(ctx, width, height, 'No hay datos');
            return;
        }

        // Configuración de márgenes
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Encontrar valores máximos y mínimos
        const maxIncome = Math.max(...data.map(d => d.income));
        const maxExpense = Math.max(...data.map(d => d.expenses));
        const maxValue = Math.max(maxIncome, maxExpense) * 1.1;

        // Función para mapear valores a coordenadas
        const xScale = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
        const yScale = (value) => padding.top + chartHeight - (value / maxValue) * chartHeight;

        // Dibujar grid
        this.drawGrid(ctx, padding, chartWidth, chartHeight, maxValue);

        // Dibujar líneas
        this.drawLine(ctx, data, xScale, yScale, 'income', '#10b981', 3);
        this.drawLine(ctx, data, xScale, yScale, 'expenses', '#f43f5e', 3);

        // Dibujar área bajo las curvas
        this.drawArea(ctx, data, xScale, yScale, 'income', 'rgba(16, 185, 129, 0.1)');
        this.drawArea(ctx, data, xScale, yScale, 'expenses', 'rgba(244, 63, 94, 0.1)');

        // Dibujar puntos
        this.drawPoints(ctx, data, xScale, yScale, 'income', '#10b981');
        this.drawPoints(ctx, data, xScale, yScale, 'expenses', '#f43f5e');

        // Dibujar ejes
        this.drawAxes(ctx, data, padding, chartWidth, chartHeight, maxValue);

        // Dibujar leyenda
        this.drawLegend(ctx, width, padding, [
            { label: 'Ingresos', color: '#10b981' },
            { label: 'Gastos', color: '#f43f5e' }
        ]);
    },

    /**
     * Renderiza gráfico de rosquilla (categorías)
     */
    renderCategoryChart(canvasId, categoryData, legendId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        ctx.clearRect(0, 0, width, height);

        if (!categoryData || Object.keys(categoryData).length === 0) {
            this.drawEmptyState(ctx, width, height, 'No hay gastos');
            return;
        }

        // Preparar datos
        const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);
        const colors = this.generateColors(Object.keys(categoryData).length);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2.5;
        const innerRadius = radius * 0.6;

        let currentAngle = -Math.PI / 2;

        // Dibujar segmentos
        Object.entries(categoryData).forEach(([category, amount], index) => {
            const sliceAngle = (amount / total) * Math.PI * 2;

            // Segmento exterior
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();

            // Gradiente
            const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius);
            gradient.addColorStop(0, colors[index]);
            gradient.addColorStop(1, this.adjustColor(colors[index], -20));

            ctx.fillStyle = gradient;
            ctx.fill();

            // Borde
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Dibujar centro (agujero)
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        // Dibujar total en el centro
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 24px Montserrat';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(MetricsEngine.formatCurrency(total), centerX, centerY - 10);

        ctx.font = '14px Inter';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Total Gastos', centerX, centerY + 15);

        // Actualizar leyenda
        this.updateCategoryLegend(legendId, categoryData, colors);
    },

    /**
     * Dibuja la grid de fondo
     */
    drawGrid(ctx, padding, chartWidth, chartHeight, maxValue) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        // Líneas horizontales
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
        }
    },

    /**
     * Dibuja una línea en el gráfico
     */
    drawLine(ctx, data, xScale, yScale, key, color, lineWidth = 2) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        data.forEach((point, index) => {
            const x = xScale(index);
            const y = yScale(point[key]);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    },

    /**
     * Dibuja el área bajo la curva
     */
    drawArea(ctx, data, xScale, yScale, key, color) {
        ctx.fillStyle = color;

        ctx.beginPath();
        data.forEach((point, index) => {
            const x = xScale(index);
            const y = yScale(point[key]);

            if (index === 0) {
                ctx.moveTo(x, yScale(0));
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.lineTo(xScale(data.length - 1), yScale(0));
        ctx.closePath();
        ctx.fill();
    },

    /**
     * Dibuja puntos en las líneas
     */
    drawPoints(ctx, data, xScale, yScale, key, color) {
        ctx.fillStyle = color;

        data.forEach((point, index) => {
            const x = xScale(index);
            const y = yScale(point[key]);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Borde blanco
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    },

    /**
     * Dibuja los ejes
     */
    drawAxes(ctx, data, padding, chartWidth, chartHeight, maxValue) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;

        // Eje Y
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.stroke();

        // Eje X
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();

        // Etiquetas del eje Y
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= 5; i++) {
            const value = (maxValue / 5) * (5 - i);
            const y = padding.top + (chartHeight / 5) * i;
            ctx.fillText(`€${Math.round(value)}`, padding.left - 10, y);
        }

        // Etiquetas del eje X (mostrar algunas fechas)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const step = Math.max(1, Math.floor(data.length / 6));
        data.forEach((point, index) => {
            if (index % step === 0 || index === data.length - 1) {
                const x = padding.left + (index / (data.length - 1)) * chartWidth;
                const date = new Date(point.date);
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                ctx.fillText(label, x, padding.top + chartHeight + 10);
            }
        });
    },

    /**
     * Dibuja leyenda
     */
    drawLegend(ctx, width, padding, items) {
        const legendX = width - padding.right - 120;
        const legendY = padding.top;

        items.forEach((item, index) => {
            const y = legendY + index * 25;

            // Color box
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, y, 15, 15);

            // Label
            ctx.fillStyle = '#f1f5f9';
            ctx.font = '13px Inter';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(item.label, legendX + 20, y);
        });
    },

    /**
     * Actualiza la leyenda de categorías en el DOM
     */
    updateCategoryLegend(legendId, categoryData, colors) {
        const legend = document.getElementById(legendId);
        if (!legend) return;

        const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);

        legend.innerHTML = Object.entries(categoryData)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount], index) => {
                const percentage = ((amount / total) * 100).toFixed(1);
                return `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${colors[index]}"></div>
                        <span class="legend-label">${category}</span>
                        <span class="legend-value">${percentage}%</span>
                    </div>
                `;
            })
            .join('');
    },

    /**
     * Dibuja estado vacío
     */
    drawEmptyState(ctx, width, height, message) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, width / 2, height / 2);
    },

    /**
     * Genera paleta de colores
     */
    generateColors(count) {
        const baseColors = [
            '#667eea', '#10b981', '#f59e0b', '#f43f5e',
            '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6',
            '#f97316', '#6366f1', '#84cc16', '#ef4444'
        ];

        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }

        return colors;
    },

    /**
     * Ajusta el brillo de un color
     */
    adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    },

    /**
     * Hace los gráficos responsive
     */
    makeResponsive(canvasId, renderFunction) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                renderFunction();
            }, 250);
        });
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartsEngine;
}
