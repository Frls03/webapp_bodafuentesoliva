import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportMessagesToPDF = (messages) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const primaryColor = [111, 119, 60];
  const secondaryColor = [144, 155, 87]; // #909b57
  const textDark = [44, 62, 80]; // #2c3e50
  const lightGray = [240, 240, 240];
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Mensajes de Invitados', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Recopilación al ${today}`, pageWidth / 2, 25, { align: 'center' });
  
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 32, pageWidth - 20, 32);
  
  doc.setTextColor(...textDark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de mensajes: ${messages.length}`, 20, 45);
  
  let yPosition = 55;
  
  messages.forEach((msg, index) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(...lightGray);
      doc.roundedRect(15, yPosition - 5, pageWidth - 30, 50, 3, 3, 'F');
    }
    
    doc.setFillColor(...primaryColor);
    doc.circle(20, yPosition + 2, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, 20, yPosition + 3, { align: 'center' });
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(msg.sender_name, 30, yPosition + 2);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const msgDate = new Date(msg.created_at).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(msgDate, pageWidth - 20, yPosition + 2, { align: 'right' });
    
    if (msg.guests && msg.guests.names) {
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const guestNames = Array.isArray(msg.guests.names) 
        ? msg.guests.names.join(', ') 
        : msg.guests.names;
      doc.text(`Invitado: ${guestNames}`, 30, yPosition + 8);
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(30, yPosition + 11, pageWidth - 20, yPosition + 11);
    
    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const messageLines = doc.splitTextToSize(msg.message, pageWidth - 50);
    
    const displayLines = messageLines.slice(0, 3);
    let lineY = yPosition + 18;
    
    displayLines.forEach(line => {
      doc.text(line, 30, lineY);
      lineY += 5;
    });
    
    if (messageLines.length > 3) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('...', 30, lineY);
    }
    
    yPosition += 55;
  });
  
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${totalPages}`, 
      pageWidth / 2, 
      pageHeight - 7, 
      { align: 'center' }
    );
    
    // Texto decorativo
    doc.setFontSize(8);
    doc.text('💌 Con amor, tus invitados', pageWidth / 2, pageHeight - 3, { align: 'center' });
  }
  
  // Guardar el PDF
  const fileName = `Mensajes_Boda_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
