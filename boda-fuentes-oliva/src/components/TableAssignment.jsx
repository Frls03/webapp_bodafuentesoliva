import React, { useState, useEffect } from 'react';
import { 
  getTables, 
  getTableAssignments, 
  assignGuestToTable, 
  removeGuestFromTable,
  createTable,
  deleteTable
} from '../lib/supabase';
import { exportTablesData } from '../utils/excelExport';
import '../styles/TableAssignment.css';

const TableAssignment = ({ stats, saveTheDateStats }) => {
  const [tables, setTables] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedGuest, setDraggedGuest] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [draggedChairIndex, setDraggedChairIndex] = useState(null);
  const [viewTableModal, setViewTableModal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const tablesData = await getTables();
    const assignmentsData = await getTableAssignments();
    setTables(tablesData);
    setAssignments(assignmentsData);
    setLoading(false);
  };

  const confirmedInvitationGuests = stats?.guests?.filter(g => g.attendance_confirmed === true) || [];
  const confirmedSTDGuests = saveTheDateStats?.responses?.filter(r => r.will_attend === true) || [];

  const assignedGuestNames = new Set(assignments.map(a => a.guest_name));

  const unassignedInvitationGuests = confirmedInvitationGuests.filter(
    g => !assignedGuestNames.has(g.names.join(', '))
  );

  const unassignedSTDGuests = confirmedSTDGuests.filter(
    r => !assignedGuestNames.has(r.full_name)
  );

  const handleDragStart = (e, guest, sourceType) => {
    setDraggedGuest({ guest, sourceType });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const getGuestSeatCount = (guest, sourceType) => {
    if (sourceType === 'invitation') {
      return guest.attendance_count || 1;
    } else {
      const nameCount = guest.full_name.split(' y ').length;
      return nameCount;
    }
  };

  const getCurrentTableOccupancy = (tableId) => {
    const tableAssignments = assignments.filter(a => a.table_id === tableId);
    let totalSeats = 0;
    
    tableAssignments.forEach(assignment => {
      if (assignment.source_type === 'invitation') {
        const guest = confirmedInvitationGuests.find(g => g.id === assignment.guest_id);
        totalSeats += guest?.attendance_count || 1;
      } else {
        const nameCount = assignment.guest_name.split(' y ').length;
        totalSeats += nameCount;
      }
    });
    
    return totalSeats;
  };

  const handleDrop = async (e, tableId) => {
    e.preventDefault();
    
    if (!draggedGuest) return;

    const table = tables.find(t => t.id === tableId);
    const { guest, sourceType, fromAssignmentId } = draggedGuest;
    const guestSeats = getGuestSeatCount(guest, sourceType);
    
    let currentOccupancy = getCurrentTableOccupancy(tableId);
    if (fromAssignmentId) {
      const oldAssignment = assignments.find(a => a.id === fromAssignmentId);
      if (oldAssignment && oldAssignment.table_id === tableId) {
        setDraggedGuest(null);
        return;
      }
    }

    if (currentOccupancy + guestSeats > table.capacity) {
      alert(`La ${table.name} no tiene suficiente espacio. Ocupación actual: ${currentOccupancy}/${table.capacity}. Este invitado necesita ${guestSeats} asiento(s).`);
      setDraggedGuest(null);
      return;
    }

    let guestName, guestId;

    if (sourceType === 'invitation') {
      guestName = guest.names.join(', ');
      guestId = guest.id;
    } else {
      guestName = guest.full_name;
      guestId = guest.id;
    }

    if (fromAssignmentId) {
      const removeResult = await removeGuestFromTable(fromAssignmentId);
      if (!removeResult.success) {
        alert('Error al mover invitado');
        setDraggedGuest(null);
        return;
      }
    }

    const result = await assignGuestToTable(tableId, guestName, sourceType, guestId);

    if (result.success) {
      if (fromAssignmentId) {
        setAssignments(assignments.filter(a => a.id !== fromAssignmentId).concat(result.data));
      } else {
        setAssignments([...assignments, result.data]);
      }
    } else {
      alert('Error al asignar invitado a la mesa');
    }

    setDraggedGuest(null);
  };

  const handleRemoveGuest = async (assignmentId) => {
    if (!window.confirm('¿Quitar este invitado de la mesa?')) return;

    const result = await removeGuestFromTable(assignmentId);
    
    if (result.success) {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    } else {
      alert('Error al quitar invitado');
    }
  };

  const handleCreateTable = async () => {
    const tableNumber = tables.length + 1;
    const result = await createTable(`Mesa ${tableNumber}`, 10);
    
    if (result.success) {
      setTables([...tables, result.data]);
    }
  };

  const handleDeleteTable = async (tableId) => {
    const table = tables.find(t => t.id === tableId);
    const tableGuests = assignments.filter(a => a.table_id === tableId);
    
    if (tableGuests.length > 0) {
      if (!window.confirm(`La ${table.name} tiene ${tableGuests.length} invitado(s) asignado(s). ¿Eliminar mesa y liberar invitados?`)) {
        return;
      }
    } else {
      if (!window.confirm(`¿Eliminar ${table.name}?`)) {
        return;
      }
    }

    const result = await deleteTable(tableId);
    
    if (result.success) {
      setTables(tables.filter(t => t.id !== tableId));
      setAssignments(assignments.filter(a => a.table_id !== tableId));
    } else {
      alert('Error al eliminar mesa');
    }
  };

  const handleReorderWithinTable = async (tableId, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const tableGuests = assignments.filter(a => a.table_id === tableId);
    
    // Crear mapa de ocupación de sillas
    let seatAssignments = Array(10).fill(null); // Asumiendo capacidad de 10
    let currentSeat = 0;
    
    tableGuests.forEach((assignment, idx) => {
      let seats = 1;
      if (assignment.source_type === 'invitation') {
        const guest = confirmedInvitationGuests.find(g => g.id === assignment.guest_id);
        seats = guest?.attendance_count || 1;
      } else {
        seats = assignment.guest_name.split(' y ').length;
      }
      
      for (let i = 0; i < seats; i++) {
        if (currentSeat + i < seatAssignments.length) {
          seatAssignments[currentSeat + i] = { assignment, isFirst: i === 0, orderIndex: idx, seats };
        }
      }
      currentSeat += seats;
    });

    const fromItem = seatAssignments[fromIndex];
    if (!fromItem || !fromItem.isFirst) return;

    let newPosition = 0;
    for (let i = 0; i < toIndex; i++) {
      const item = seatAssignments[i];
      if (item && item.isFirst) {
        newPosition++;
      }
    }

    if (fromItem.orderIndex < newPosition) {
      newPosition--;
    }

    const newOrder = [...tableGuests];
    const [movedGuest] = newOrder.splice(fromItem.orderIndex, 1);
    newOrder.splice(newPosition, 0, movedGuest);
    
    const otherAssignments = assignments.filter(a => a.table_id !== tableId);
    setAssignments([...otherAssignments, ...newOrder]);
  };

  const handleGuestClick = (guest, sourceType) => {
    setSelectedGuest({ guest, sourceType });
    setShowMobileModal(true);
  };

  const handleMobileAssign = async (tableId) => {
    if (!selectedGuest) return;

    const table = tables.find(t => t.id === tableId);
    const currentOccupancy = getCurrentTableOccupancy(tableId);
    const { guest, sourceType } = selectedGuest;
    const guestSeats = getGuestSeatCount(guest, sourceType);

    if (currentOccupancy + guestSeats > table.capacity) {
      alert(`La ${table.name} no tiene suficiente espacio. Ocupación actual: ${currentOccupancy}/${table.capacity}. Este invitado necesita ${guestSeats} asiento(s).`);
      setShowMobileModal(false);
      setSelectedGuest(null);
      return;
    }

    let guestName, guestId;

    if (sourceType === 'invitation') {
      guestName = guest.names.join(', ');
      guestId = guest.id;
    } else {
      guestName = guest.full_name;
      guestId = guest.id;
    }

    const result = await assignGuestToTable(tableId, guestName, sourceType, guestId);

    if (result.success) {
      setAssignments([...assignments, result.data]);
      setShowMobileModal(false);
      setSelectedGuest(null);
    } else {
      alert('Error al asignar invitado a la mesa');
    }
  };

  const handleCancelMobile = () => {
    setShowMobileModal(false);
    setSelectedGuest(null);
  };

  if (loading) {
    return <div className="loading-tables">Cargando mesas...</div>;
  }

  return (
    <div className="table-assignment-container">
      <div className="tables-layout">
        <div className="unassigned-section">
          <h2>📋 Invitados Sin Asignar</h2>
          
          <div className="unassigned-group">
            <h3>De Invitación ({unassignedInvitationGuests.length})</h3>
            <div className="guests-pool">
              {unassignedInvitationGuests.map((guest) => {
                const seatCount = getGuestSeatCount(guest, 'invitation');
                // Solo mostrar +1 si hay 1 solo nombre Y attendance_count > 1
                const displayName = guest.names.length === 1 && seatCount > 1 
                  ? `${guest.names[0]} +${seatCount - 1}` 
                  : guest.names.join(', ');
                return (
                  <div
                    key={`inv-${guest.id}`}
                    className={`draggable-guest invitation ${selectedGuest?.guest?.id === guest.id ? 'selected' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, guest, 'invitation')}
                    onClick={() => handleGuestClick(guest, 'invitation')}
                  >
                    <span className="table-guest-name">{displayName}</span>
                    <span className="guest-seats">👥 {seatCount}</span>
                    <span className="guest-badge">📨</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="unassigned-group">
            <h3>De Save The Date ({unassignedSTDGuests.length})</h3>
            <div className="guests-pool">
              {unassignedSTDGuests.map((guest) => {
                const seatCount = getGuestSeatCount(guest, 'savethedate');
                return (
                  <div
                    key={`std-${guest.id}`}
                    className={`draggable-guest savethedate ${selectedGuest?.guest?.id === guest.id ? 'selected' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, guest, 'savethedate')}
                    onClick={() => handleGuestClick(guest, 'savethedate')}
                  >
                    <span className="table-guest-name">{guest.full_name}</span>
                    <span className="guest-seats">👥 {seatCount}</span>
                    <span className="guest-badge">📅</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tables-section">
          <div className="tables-header">
            <h2>🪑 Mesas ({tables.length})</h2>
            <div className="header-actions">
              <button onClick={() => exportTablesData(tables, assignments)} className="btn-export-excel">
                📥 Descargar Excel
              </button>
              <button onClick={handleCreateTable} className="btn-add-table">
                + Agregar Mesa
              </button>
            </div>
          </div>

          <div className="tables-grid">
            {tables
              .sort((a, b) => {
                // Obtener ocupación de cada mesa
                const occupancyA = getCurrentTableOccupancy(a.id);
                const occupancyB = getCurrentTableOccupancy(b.id);
                
                // Determinar si están llenas (100% o más)
                const isFullA = occupancyA >= a.capacity;
                const isFullB = occupancyB >= b.capacity;
                
                // Las mesas llenas van al final, el resto mantiene orden por ID
                if (isFullA && !isFullB) return 1;     // A llena → después
                if (!isFullA && isFullB) return -1;    // B llena → después
                
                // Si ambas están en el mismo estado (ambas llenas o ambas NO llenas)
                // mantener orden por ID (orden de creación)
                return a.id - b.id;
              })
              .map((table) => {
              const tableGuests = assignments.filter(a => a.table_id === table.id);
              const currentOccupancy = getCurrentTableOccupancy(table.id);
              const isFull = currentOccupancy >= table.capacity;

              return (
                <div
                  key={table.id}
                  className={`table-card ${isFull ? 'full' : currentOccupancy === 0 ? 'empty' : 'partial'}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, table.id)}
                >
                  <div className="table-header">
                    <h3>{table.name}</h3>
                    <div className="table-header-actions">
                      <span className={`table-count ${isFull ? 'full-indicator' : ''}`}>
                        {currentOccupancy}/{table.capacity}
                        {currentOccupancy === 0 && ' 🆕'}
                        {isFull && ' ✅'}
                      </span>
                      <button
                        className="btn-view-list"
                        onClick={() => setViewTableModal(table)}
                        title="Ver lista de invitados"
                      >
                        📜
                      </button>
                      <button
                        className="btn-delete-table"
                        onClick={() => handleDeleteTable(table.id)}
                        title="Eliminar mesa"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="table-guests">
                    {tableGuests.length === 0 ? (
                      <div className="empty-table">
                        Arrastra invitados aquí
                      </div>
                    ) : (
                      <div className="circular-table-view">
                        <div className="table-center">
                          <span className="table-center-text">{table.name}</span>
                        </div>
                        <div className="chairs-container">
                          {[...Array(table.capacity)].map((_, index) => {
                            // Calcular posición en círculo
                            const angle = (index * 360) / table.capacity - 90; // -90 para empezar arriba
                            const radius = 120; // Radio del círculo
                            const x = Math.cos((angle * Math.PI) / 180) * radius;
                            const y = Math.sin((angle * Math.PI) / 180) * radius;
                            
                            // Buscar si hay un invitado en esta posición
                            let assignment = null;
                            let isOccupied = false;
                            let guestSeats = 0;
                            let isDisabled = false;
                            
                            // Calcular ocupación por invitado
                            let currentSeat = 0;
                            for (let i = 0; i < tableGuests.length; i++) {
                              const guest = tableGuests[i];
                              let seats = 1;
                              
                              if (guest.source_type === 'invitation') {
                                const originalGuest = confirmedInvitationGuests.find(g => g.id === guest.guest_id);
                                seats = originalGuest?.attendance_count || 1;
                              } else {
                                seats = guest.guest_name.split(' y ').length;
                              }
                              
                              // Si este asiento está en el rango de este invitado
                              if (index >= currentSeat && index < currentSeat + seats) {
                                assignment = guest;
                                guestSeats = seats;
                                
                                if (index === currentSeat) {
                                  isOccupied = true; // Primera silla del invitado
                                } else {
                                  isDisabled = true; // Sillas extra deshabilitadas
                                }
                                break;
                              }
                              
                              currentSeat += seats;
                            }
                            
                            return (
                              <div
                                key={index}
                                className={`chair ${isOccupied ? 'occupied' : ''} ${isDisabled ? 'disabled' : ''} ${!isOccupied && !isDisabled ? 'empty' : ''}`}
                                style={{
                                  transform: `translate(${x}px, ${y}px)`,
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  if (draggedChairIndex !== null && draggedGuest?.tableId === table.id) {
                                    // Reordenar dentro de la misma mesa
                                    handleReorderWithinTable(table.id, draggedChairIndex, index);
                                    setDraggedChairIndex(null);
                                    setDraggedGuest(null);
                                  } else if (draggedGuest) {
                                    // Agregar nuevo invitado desde fuera o desde otra mesa
                                    handleDrop(e, table.id);
                                    setDraggedChairIndex(null);
                                  }
                                }}
                              >
                                {isOccupied && assignment && (
                                  <>
                                    <div
                                      className="chair-guest"
                                      draggable
                                      onDragStart={(e) => {
                                        // Marcar que estamos arrastrando dentro de la misma mesa
                                        setDraggedChairIndex(index);
                                        
                                        let originalGuest = null;
                                        if (assignment.source_type === 'invitation') {
                                          originalGuest = confirmedInvitationGuests.find(g => g.id === assignment.guest_id);
                                        } else {
                                          originalGuest = confirmedSTDGuests.find(g => g.id === assignment.guest_id);
                                        }
                                        if (originalGuest) {
                                          setDraggedGuest({ 
                                            guest: originalGuest, 
                                            sourceType: assignment.source_type, 
                                            fromAssignmentId: assignment.id,
                                            tableId: table.id
                                          });
                                          e.dataTransfer.effectAllowed = 'move';
                                        }
                                      }}
                                      onDragEnd={() => {
                                        setDraggedChairIndex(null);
                                        setDraggedGuest(null);
                                      }}
                                    >
                                      <span className="chair-guest-name">{assignment.guest_name}</span>
                                      {guestSeats > 1 && <span className="chair-guest-count">👥 {guestSeats}</span>}
                                    </div>
                                    <button
                                      className="btn-remove-chair"
                                      onClick={() => handleRemoveGuest(assignment.id)}
                                      title="Quitar de mesa"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                                {isDisabled && (
                                  <div className="chair-disabled-marker">+1</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showMobileModal && (
        <div className="mobile-modal-overlay" onClick={handleCancelMobile}>
          <div className="mobile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-modal-header">
              <h3>Selecciona una mesa</h3>
              <button className="mobile-close-btn" onClick={handleCancelMobile}>×</button>
            </div>
            <div className="mobile-modal-guest">
              <span className="mobile-guest-name">
                {selectedGuest?.sourceType === 'invitation' 
                  ? selectedGuest.guest.names.join(', ')
                  : selectedGuest?.guest?.full_name}
              </span>
              <span className={`mobile-guest-badge ${selectedGuest?.sourceType}`}>
                {selectedGuest?.sourceType === 'invitation' ? '📨' : '📅'}
              </span>
            </div>
            <div className="mobile-tables-list">
              {tables.map((table) => {
                const currentOccupancy = getCurrentTableOccupancy(table.id);
                const guestSeats = selectedGuest ? getGuestSeatCount(selectedGuest.guest, selectedGuest.sourceType) : 0;
                const isFull = currentOccupancy + guestSeats > table.capacity;
                
                return (
                  <button
                    key={table.id}
                    className={`mobile-table-btn ${isFull ? 'full' : ''}`}
                    onClick={() => handleMobileAssign(table.id)}
                    disabled={isFull}
                  >
                    <span className="mobile-table-name">{table.name}</span>
                    <span className="mobile-table-count">
                      {currentOccupancy}/{table.capacity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista de lista */}
      {viewTableModal && (
        <div className="table-list-modal-overlay" onClick={() => setViewTableModal(null)}>
          <div className="table-list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="table-list-header">
              <h2>{viewTableModal.name}</h2>
              <button className="modal-close-btn" onClick={() => setViewTableModal(null)}>×</button>
            </div>
            <div className="table-list-content">
              {(() => {
                const tableGuests = assignments.filter(a => a.table_id === viewTableModal.id);
                const currentOccupancy = getCurrentTableOccupancy(viewTableModal.id);
                
                return (
                  <>
                    <div className="table-list-summary">
                      <span className="summary-item">
                        <strong>Ocupación:</strong> {currentOccupancy}/{viewTableModal.capacity} asientos
                      </span>
                      <span className="summary-item">
                        <strong>Invitados:</strong> {tableGuests.length}
                      </span>
                    </div>
                    
                    {tableGuests.length === 0 ? (
                      <div className="empty-list">No hay invitados asignados a esta mesa</div>
                    ) : (
                      <div className="guests-list-modal">
                        {tableGuests.map((assignment) => {
                          let seats = 1;
                          if (assignment.source_type === 'invitation') {
                            const guest = confirmedInvitationGuests.find(g => g.id === assignment.guest_id);
                            seats = guest?.attendance_count || 1;
                          } else {
                            seats = assignment.guest_name.split(' y ').length;
                          }
                          
                          return (
                            <div key={assignment.id} className={`guest-list-item ${assignment.source_type}`}>
                              <div className="guest-list-info">
                                <span className="guest-list-badge">
                                  {assignment.source_type === 'invitation' ? '📨' : '📅'}
                                </span>
                                <span className="guest-list-name">{assignment.guest_name}</span>
                              </div>
                              <span className="guest-list-seats">👥 {seats} asiento{seats > 1 ? 's' : ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableAssignment;
