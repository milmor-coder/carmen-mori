import { Order, ProductionItem } from '../types';

const styles = `
  body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 20px; }
  h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
  h2 { font-size: 16px; color: #475569; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
  th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  th { background-color: #f8fafc; font-weight: bold; color: #475569; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
  .footer { margin-top: 40px; text-align: right; font-size: 10px; color: #94a3b8; }
  .print-btn { 
    position: fixed; top: 20px; right: 20px; 
    background: #3b82f6; color: white; border: none; padding: 10px 20px; 
    border-radius: 6px; cursor: pointer; font-weight: bold;
  }
  .status-ok { color: #059669; background-color: #ecfdf5; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
  .status-pending { color: #2563eb; background-color: #eff6ff; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
  .summary-box { background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
  .logistics-header { background-color: #e0e7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4f46e5; }
  @media print { .print-btn { display: none; } }
`;

export const generateOrderReport = (orders: Order[]) => {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Por favor habilite las ventanas emergentes para ver el reporte.');
    return;
  }

  const rows = orders.map(order => `
    <tr>
      <td>${order.id.slice(-6).toUpperCase()}</td>
      <td>${order.clientName}</td>
      <td>${order.serviceType}</td>
      <td>${order.headcount}</td>
      <td>${new Date(order.eventDate).toLocaleDateString()}</td>
      <td>${order.eventLocation}</td>
      <td>${order.status}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <title>Reporte General de Pedidos</title>
        <style>${styles}</style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        <h1>Reporte General de Pedidos</h1>
        <p>Fecha de emisión: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Pax</th>
              <th>Fecha Evento</th>
              <th>Lugar</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">Generado por EventMaster Manager</div>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
};

export const generateProductionReport = (orders: Order[]) => {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Por favor habilite las ventanas emergentes para ver el reporte.');
    return;
  }

  // Filter only orders that have production data
  const productionOrders = orders.filter(o => o.production && o.production.items.length > 0);

  const content = productionOrders.map(order => {
    const itemsHtml = order.production?.items.map(item => `
      <li style="margin-bottom: 4px;">
        <span style="font-weight:bold;">${item.quantity}</span> x ${item.name}
      </li>
    `).join('') || '<li>Sin items</li>';

    const totalItems = order.production?.items.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

    return `
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 10px;">
          <div>
            <h3 style="margin:0; color: #1e293b;">${order.clientName} <span style="font-weight:normal; font-size: 12px; color: #64748b;">(ID: ${order.id.slice(-6)})</span></h3>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">
              <strong>Evento:</strong> ${new Date(order.eventDate).toLocaleDateString()} | 
              <strong>Lugar:</strong> ${order.eventLocation}
            </div>
          </div>
          <div style="text-align:right;">
             <div style="font-size: 12px;">Inicio Prod: ${order.production?.startDate ? new Date(order.production.startDate).toLocaleString() : '-'}</div>
             <div style="font-size: 14px; font-weight: bold; margin-top: 5px;">Total Unidades: ${totalItems}</div>
          </div>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0; columns: 2; font-size: 12px;">
          ${itemsHtml}
        </ul>
      </div>
    `;
  }).join('');

  const html = `
    <html>
      <head>
        <title>Reporte de Producción</title>
        <style>${styles}</style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        <h1>Reporte de Gestión de Producción</h1>
        <p>Fecha de emisión: ${new Date().toLocaleString()}</p>
        ${productionOrders.length === 0 ? '<p>No hay órdenes en producción.</p>' : content}
        <div class="footer">Generado por EventMaster Manager</div>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
};

export const generateQualityControlReport = (order: Order) => {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Por favor habilite las ventanas emergentes para ver el reporte.');
    return;
  }

  if (!order.production || order.production.items.length === 0) {
    alert('Este pedido no tiene items de producción para revisar.');
    win.close();
    return;
  }

  const totalItems = order.production.items.length;
  const approvedItems = order.production.items.filter(i => i.qcApproved).length;
  const isFullyApproved = totalItems > 0 && approvedItems === totalItems;
  
  const itemsRows = order.production.items.map(item => `
    <tr>
      <td><span style="font-weight:bold;">${item.quantity}</span> x ${item.name}</td>
      <td style="text-align: center;">
        <span class="${item.qcApproved ? 'status-ok' : 'status-pending'}">
          ${item.qcApproved ? '✓ Aprobado' : '⏳ Revisión'}
        </span>
      </td>
      <td>${item.qcNotes || '<span style="color:#94a3b8; font-style:italic;">Sin observaciones</span>'}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <title>Control de Calidad - ${order.clientName}</title>
        <style>${styles}</style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #10b981; padding-bottom:10px; margin-bottom:20px;">
            <h1 style="border:none; margin:0; padding:0; color: #065f46;">Reporte de Control de Calidad</h1>
            <div style="text-align:right; font-size:12px; color:#64748b;">
                PEDIDO: #${order.id.slice(-6)}<br>
                FECHA: ${new Date().toLocaleString()}
            </div>
        </div>

        <div style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:20px;">
            <h2 style="margin-top:0; border:none;">Detalles del Evento</h2>
            <table style="margin:0; border:none;">
                <tr style="background:transparent;">
                    <td style="border:none; padding:2px;"><strong>Cliente:</strong> ${order.clientName}</td>
                    <td style="border:none; padding:2px;"><strong>Evento:</strong> ${order.serviceType}</td>
                </tr>
                <tr style="background:transparent;">
                    <td style="border:none; padding:2px;"><strong>Fecha:</strong> ${new Date(order.eventDate).toLocaleDateString()}</td>
                    <td style="border:none; padding:2px;"><strong>Lugar:</strong> ${order.eventLocation}</td>
                </tr>
            </table>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Producto</th>
              <th style="width: 20%; text-align:center;">Estado</th>
              <th style="width: 40%;">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary-box" style="${isFullyApproved ? 'border-left: 5px solid #10b981;' : 'border-left: 5px solid #f59e0b;'}">
            <h3 style="margin-top:0; color: #1e293b;">Resultado de la Inspección</h3>
            <p>
               <strong>Items Aprobados:</strong> ${approvedItems} / ${totalItems}<br>
               <strong>Fecha de Revisión:</strong> ${order.production.lastQcDate ? new Date(order.production.lastQcDate).toLocaleString() : 'No registrada'}<br>
               <strong>Estado Final:</strong> 
               <span style="font-size:1.2em; margin-left:10px; font-weight:bold; color:${isFullyApproved ? '#059669' : '#d97706'}">
                 ${isFullyApproved ? 'APROBADO ✓' : 'EN REVISIÓN ⚠️'}
               </span>
            </p>
        </div>

        <div class="footer">
            Validado por Control de Calidad - EventMaster Manager
        </div>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
};

export const generateLogisticsReport = (orders: Order[]) => {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Por favor habilite las ventanas emergentes para ver el reporte.');
    return;
  }

  const deliveredOrders = orders.filter(o => o.delivery);

  const rows = deliveredOrders.map(order => {
    const itemsList = order.delivery?.itemsSnapshot.map(i => `${i.quantity} ${i.name}`).join(', ') || 'Sin detalle';
    const proofLink = order.delivery?.proofUrl 
      ? `<a href="${order.delivery.proofUrl}" target="_blank" style="color:#4f46e5; text-decoration:none;">Ver Foto</a>` 
      : 'N/A';

    return `
      <tr>
        <td>${order.id.slice(-6)}</td>
        <td>${order.clientName}</td>
        <td>${order.eventLocation}</td>
        <td>${order.delivery?.deliveryDate ? new Date(order.delivery.deliveryDate).toLocaleString() : '-'}</td>
        <td>${itemsList}</td>
        <td>${proofLink}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <html>
      <head>
        <title>Reporte de Logística y Entregas</title>
        <style>${styles}</style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        
        <div class="logistics-header">
            <h1 style="border:none; margin:0; padding:0; color: #312e81;">Reporte de Logística</h1>
            <p style="margin:5px 0 0 0; color:#4338ca;">Historial de Entregas Realizadas</p>
        </div>

        <p><strong>Fecha de emisión:</strong> ${new Date().toLocaleString()}</p>
        
        ${deliveredOrders.length === 0 ? '<p>No hay entregas registradas.</p>' : `
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Fecha Entrega</th>
                <th style="width:30%;">Productos</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        `}
        
        <div class="footer">Logística EventMaster Manager</div>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
};