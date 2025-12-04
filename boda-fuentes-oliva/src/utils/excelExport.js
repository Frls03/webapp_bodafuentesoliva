import * as XLSX from 'xlsx';

const applyHeaderStyle = (worksheet, cellRef) => {
  if (!worksheet[cellRef]) return;
  worksheet[cellRef].s = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { fgColor: { rgb: "6F773C" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };
};

const applyTitleStyle = (worksheet, cellRef) => {
  if (!worksheet[cellRef]) return;
  worksheet[cellRef].s = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
    fill: { fgColor: { rgb: "42481D" } },
    alignment: { horizontal: "center", vertical: "center" }
  };
};

const applyCellBorder = (worksheet, cellRef) => {
  if (!worksheet[cellRef]) return;
  if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
  worksheet[cellRef].s.border = {
    top: { style: "thin", color: { rgb: "CCCCCC" } },
    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
    left: { style: "thin", color: { rgb: "CCCCCC" } },
    right: { style: "thin", color: { rgb: "CCCCCC" } }
  };
};

export const exportInvitationData = (stats) => {
  const confirmedGuests = stats.guests.filter(g => g.attendance_confirmed === true);
  const declinedGuests = stats.guests.filter(g => g.attendance_confirmed === false);
  const pendingGuests = stats.guests.filter(g => g.attendance_confirmed === null);

  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ['RESUMEN DE CONFIRMACIONES - INVITACIÓN', '', '', '', ''],
    [],
    ['Categoría', 'Cantidad', '', '', ''],
    ['Total Invitados', stats.total, '', '', ''],
    ['Confirmados', stats.confirmed, '', '', ''],
    ['Declinados', stats.declined, '', '', ''],
    ['Pendientes', stats.pending, '', '', ''],
    ['Total Asistentes', stats.totalAttendees, '', '', ''],
    [],
    []
  ];

  const confirmedData = [
    ['INVITADOS CONFIRMADOS', '', '', '', ''],
    [],
    ['Nombres', 'Asistentes', 'Fecha Confirmación', 'Notas', 'Contraseña'],
    ...confirmedGuests.map(g => [
      g.names.join(', '),
      g.attendance_count,
      new Date(g.confirmed_at).toLocaleDateString('es-ES'),
      g.attendance_notes || '-',
      g.password
    ])
  ];

  const declinedData = [
    [],
    [],
    ['INVITADOS QUE NO ASISTIRÁN', '', '', '', ''],
    [],
    ['Nombres', 'Notas', 'Contraseña', '', ''],
    ...declinedGuests.map(g => [
      g.names.join(', '),
      g.attendance_notes || '-',
      g.password,
      '',
      ''
    ])
  ];

  const pendingData = [
    [],
    [],
    ['INVITADOS PENDIENTES', '', '', '', ''],
    [],
    ['Nombres', 'Contraseña', '', '', ''],
    ...pendingGuests.map(g => [
      g.names.join(', '),
      g.password,
      '',
      '',
      ''
    ])
  ];

  const allData = [...summaryData, ...confirmedData, ...declinedData, ...pendingData];
  const worksheet = XLSX.utils.aoa_to_sheet(allData);

  // Merge cells para títulos
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Título principal
    { s: { r: 10, c: 0 }, e: { r: 10, c: 4 } }, // Confirmados
    { s: { r: 10 + confirmedData.length + 2, c: 0 }, e: { r: 10 + confirmedData.length + 2, c: 4 } }, // Declinados
    { s: { r: 10 + confirmedData.length + declinedData.length + 2, c: 0 }, e: { r: 10 + confirmedData.length + declinedData.length + 2, c: 4 } } // Pendientes
  ];

  // Aplicar estilos
  applyTitleStyle(worksheet, 'A1');
  applyHeaderStyle(worksheet, 'A3');
  applyHeaderStyle(worksheet, 'B3');
  applyHeaderStyle(worksheet, 'A13');
  applyHeaderStyle(worksheet, 'B13');
  applyHeaderStyle(worksheet, 'C13');
  applyHeaderStyle(worksheet, 'D13');
  applyHeaderStyle(worksheet, 'E13');

  // Aplicar bordes a datos
  for (let i = 3; i <= 8; i++) {
    applyCellBorder(worksheet, `A${i}`);
    applyCellBorder(worksheet, `B${i}`);
  }

  worksheet['!cols'] = [
    { wch: 35 },
    { wch: 15 },
    { wch: 20 },
    { wch: 35 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Confirmaciones');
  
  const fileName = `Invitacion_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportSaveTheDateData = (saveTheDateStats) => {
  const confirmedSTD = saveTheDateStats.responses.filter(r => r.will_attend === true);
  const declinedSTD = saveTheDateStats.responses.filter(r => r.will_attend === false);

  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ['RESUMEN DE CONFIRMACIONES - SAVE THE DATE', '', ''],
    [],
    ['Categoría', 'Cantidad', ''],
    ['Total Respuestas', saveTheDateStats.total, ''],
    ['Asistirán', saveTheDateStats.confirmed, ''],
    ['No Asistirán', saveTheDateStats.declined, ''],
    [],
    []
  ];

  const confirmedData = [
    ['PERSONAS QUE ASISTIRÁN', '', ''],
    [],
    ['Nombre Completo', 'Fecha de Respuesta', ''],
    ...confirmedSTD.map(r => [
      r.full_name,
      new Date(r.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ''
    ])
  ];

  const declinedData = [
    [],
    [],
    ['PERSONAS QUE NO ASISTIRÁN', '', ''],
    [],
    ['Nombre Completo', 'Fecha de Respuesta', ''],
    ...declinedSTD.map(r => [
      r.full_name,
      new Date(r.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ''
    ])
  ];

  const allData = [...summaryData, ...confirmedData, ...declinedData];
  const worksheet = XLSX.utils.aoa_to_sheet(allData);

  // Merge cells
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } },
    { s: { r: 8 + confirmedData.length + 2, c: 0 }, e: { r: 8 + confirmedData.length + 2, c: 2 } }
  ];

  // Estilos
  applyTitleStyle(worksheet, 'A1');
  applyHeaderStyle(worksheet, 'A3');
  applyHeaderStyle(worksheet, 'B3');
  applyTitleStyle(worksheet, 'A9');
  applyHeaderStyle(worksheet, 'A11');
  applyHeaderStyle(worksheet, 'B11');

  // Bordes en resumen
  for (let i = 3; i <= 6; i++) {
    applyCellBorder(worksheet, `A${i}`);
    applyCellBorder(worksheet, `B${i}`);
  }

  worksheet['!cols'] = [
    { wch: 40 },
    { wch: 35 },
    { wch: 5 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Save The Date');
  
  const fileName = `SaveTheDate_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportTablesData = (tables, assignments) => {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ['RESUMEN DE ASIGNACIÓN DE MESAS', '', ''],
    [],
    ['Total Mesas', tables.length, ''],
    ['Total Invitados Asignados', assignments.length, ''],
    [],
    []
  ];

  let allData = [...summaryData];
  let currentRow = summaryData.length;
  const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

  tables.forEach((table, index) => {
    const tableGuests = assignments.filter(a => a.table_id === table.id);
    
    // Título de mesa
    allData.push([`${table.name.toUpperCase()} (${tableGuests.length}/${table.capacity})`, '', '']);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 2 } });
    currentRow++;
    
    allData.push([]);
    currentRow++;
    
    // Headers
    allData.push(['Nombre', 'Tipo', 'Fecha Asignación']);
    currentRow++;
    
    if (tableGuests.length === 0) {
      allData.push(['(Vacía)', '', '']);
      currentRow++;
    } else {
      tableGuests.forEach(assignment => {
        allData.push([
          assignment.guest_name,
          assignment.source_type === 'invitation' ? 'Invitación 📨' : 'Save The Date 📅',
          new Date(assignment.assigned_at).toLocaleDateString('es-ES')
        ]);
        currentRow++;
      });
    }
    
    // Espacio entre mesas
    allData.push([]);
    allData.push([]);
    currentRow += 2;
  });

  const worksheet = XLSX.utils.aoa_to_sheet(allData);
  worksheet['!merges'] = merges;

  // Estilos principales
  applyTitleStyle(worksheet, 'A1');
  applyHeaderStyle(worksheet, 'A3');
  applyHeaderStyle(worksheet, 'B3');

  // Estilos para cada mesa
  let rowIndex = 7;
  tables.forEach(table => {
    const tableGuests = assignments.filter(a => a.table_id === table.id);
    
    applyTitleStyle(worksheet, `A${rowIndex}`);
    applyHeaderStyle(worksheet, `A${rowIndex + 2}`);
    applyHeaderStyle(worksheet, `B${rowIndex + 2}`);
    applyHeaderStyle(worksheet, `C${rowIndex + 2}`);
    
    // Bordes en datos
    const guestCount = tableGuests.length || 1;
    for (let i = 0; i < guestCount; i++) {
      applyCellBorder(worksheet, `A${rowIndex + 3 + i}`);
      applyCellBorder(worksheet, `B${rowIndex + 3 + i}`);
      applyCellBorder(worksheet, `C${rowIndex + 3 + i}`);
    }
    
    rowIndex += guestCount + 5;
  });

  // Bordes en resumen
  for (let i = 3; i <= 4; i++) {
    applyCellBorder(worksheet, `A${i}`);
    applyCellBorder(worksheet, `B${i}`);
  }

  worksheet['!cols'] = [
    { wch: 40 },
    { wch: 22 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mesas');
  
  const fileName = `Mesas_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
