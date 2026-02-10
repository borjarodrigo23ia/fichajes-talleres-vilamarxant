import { WorkCycle } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseDolibarrDate } from './date-utils';

/**
 * Generates and downloads a CSV file from WorkCycle data
 */
export const exportToCSV = (cycles: WorkCycle[], fileName: string = 'reporte-fichajes.csv') => {
    // CSV headers
    const headers = [
        'Empleado',
        'Fecha',
        'Entrada',
        'Salida',
        'Pausas (min)',
        'Efectivo (min)',
        'Horas Totales',
        'Observaciones'
    ];

    // Data rows
    const rows = cycles.map(cycle => {
        const entrada = cycle.entrada ? format(parseDolibarrDate(cycle.entrada.fecha_creacion), 'HH:mm:ss') : '-';
        const salida = cycle.salida ? format(parseDolibarrDate(cycle.salida.fecha_creacion), 'HH:mm:ss') : '-';
        const fecha = cycle.entrada ? format(parseDolibarrDate(cycle.entrada.fecha_creacion), 'yyyy-MM-dd') : '-';
        const horas = cycle.duracion_efectiva ? (cycle.duracion_efectiva / 60).toFixed(2) : '0';

        return [
            cycle.entrada.usuario_nombre || 'N/A',
            fecha,
            entrada,
            salida,
            cycle.duracion_pausas || 0,
            cycle.duracion_efectiva || 0,
            horas,
            (cycle.entrada.observaciones || '').replace(/,/g, ';') // Avoid CSV breaking
        ];
    });

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Generates and downloads a legal PDF report
 */
export const exportToPDF = (cycles: WorkCycle[], title: string = 'Registro de Jornada Laboral', subtitle: string = '') => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(18, 23, 38); // Dark blueish
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}`, 14, 30);

    if (subtitle) {
        doc.text(subtitle, 14, 35);
    }

    // Table headers and data
    const tableHeaders = [['Empleado', 'Fecha', 'Entrada', 'Salida', 'Pausas', 'Efectivo']];
    const tableData = cycles.map(cycle => [
        cycle.entrada.usuario_nombre || 'N/A',
        cycle.entrada ? format(parseDolibarrDate(cycle.entrada.fecha_creacion), 'dd/MM/yyyy') : '-',
        cycle.entrada ? format(parseDolibarrDate(cycle.entrada.fecha_creacion), 'HH:mm') : '-',
        cycle.salida ? format(parseDolibarrDate(cycle.salida.fecha_creacion), 'HH:mm') : 'En curso',
        `${cycle.duracion_pausas || 0} min`,
        `${((cycle.duracion_efectiva || 0) / 60).toFixed(2)}h`
    ]);

    // Generate table
    autoTable(doc, {
        startY: 45,
        head: tableHeaders,
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [18, 23, 38], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
        }
    });

    // Legal disclaimer and signature spaces
    const finalY = (doc as any).lastAutoTable.finalY || 150;

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Este documento cumple con la obligación legal de registro de jornada (RD-Ley 8/2019).', 14, finalY + 15);

    // Signatures
    doc.setDrawColor(200);
    doc.line(14, finalY + 40, 70, finalY + 40);
    doc.text('Firma de la Empresa', 14, finalY + 45);

    doc.line(130, finalY + 40, 186, finalY + 40);
    doc.text('Firma del Trabajador', 130, finalY + 45);

    // Save
    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyyMMdd')}.pdf`);
};
