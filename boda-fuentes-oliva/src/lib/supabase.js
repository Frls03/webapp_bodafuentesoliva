import {
  validateName,
  validateMessage,
  validateNotes,
  validateAttendanceCount
} from '../utils/validation';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function apiPath(path) {
  return `${API_BASE}/api${path.startsWith('/') ? path : `/${path}`}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(apiPath(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      error: payload?.error || 'Request failed'
    };
  }

  return { success: true, data: payload };
}

export const getGuestByPassword = async (password) => {
  try {
    const result = await apiRequest('/validate-password', {
      method: 'POST',
      body: JSON.stringify({ password })
    });

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

export const getAllGuests = async () => {
  try {
    const result = await apiRequest('/get-stats');

    if (!result.success) {
      console.error('Error fetching guests:', result.error);
      return [];
    }

    return result.data?.attendance?.guests || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

export const confirmAttendance = async (guestId, attendanceData) => {
  try {
    const countValidation = validateAttendanceCount(attendanceData.count);
    const notesValidation = validateNotes(attendanceData.notes);

    if (!countValidation.isValid || !notesValidation.isValid) {
      return {
        success: false,
        error: countValidation.error || notesValidation.error
      };
    }

    const result = await apiRequest('/confirm-attendance', {
      method: 'POST',
      body: JSON.stringify({
        guestId,
        confirmed: attendanceData.confirmed,
        count: attendanceData.confirmed ? countValidation.sanitized : 0,
        notes: notesValidation.sanitized
      })
    });

    if (!result.success) {
      console.error('Error confirming attendance:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data?.data || result.data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const adminLogin = async (username, password) => {
  try {
    const result = await apiRequest('/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (!result.success) {
      console.error('Admin login error:', result.error);
      return null;
    }

    return result.data?.success ? result.data.admin : null;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

export const getAttendanceStats = async () => {
  try {
    const result = await apiRequest('/get-stats');

    if (!result.success || !result.data?.success) {
      console.error('Error fetching stats:', result.error || result.data?.error);
      return { total: 0, confirmed: 0, pending: 0, guests: [] };
    }

    return result.data.attendance;
  } catch (err) {
    console.error('Unexpected error:', err);
    return { total: 0, confirmed: 0, pending: 0, guests: [] };
  }
};

export const submitSaveTheDateRSVP = async (fullName, willAttend, notes = '') => {
  try {
    const nameValidation = validateName(fullName);
    const notesValidation = validateNotes(notes);

    if (!nameValidation.isValid || !notesValidation.isValid) {
      return {
        success: false,
        error: nameValidation.error || notesValidation.error
      };
    }

    const result = await apiRequest('/save-the-date-rsvp', {
      method: 'POST',
      body: JSON.stringify({
        fullName: nameValidation.sanitized,
        willAttend,
        notes: notesValidation.sanitized
      })
    });

    if (!result.success) {
      console.error('Error submitting Save The Date RSVP:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data?.data || result.data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const getSaveTheDateStats = async () => {
  try {
    const result = await apiRequest('/get-stats');

    if (!result.success || !result.data?.success) {
      console.error('Error fetching Save The Date stats:', result.error || result.data?.error);
      return { total: 0, confirmed: 0, declined: 0, responses: [] };
    }

    return result.data.saveTheDate;
  } catch (err) {
    console.error('Unexpected error:', err);
    return { total: 0, confirmed: 0, declined: 0, responses: [] };
  }
};

export const getTables = async () => {
  try {
    const result = await apiRequest('/manage-tables?type=tables');

    if (!result.success || !result.data?.success) {
      console.error('Error fetching tables:', result.error || result.data?.error);
      return [];
    }

    return result.data.data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

export const createTable = async (name, capacity = 10) => {
  try {
    const result = await apiRequest('/manage-tables', {
      method: 'POST',
      body: JSON.stringify({ type: 'table', name, capacity })
    });

    if (!result.success || !result.data?.success) {
      console.error('Error creating table:', result.error || result.data?.error);
      return { success: false, error: result.error || result.data?.error };
    }

    return { success: true, data: result.data.data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const deleteTable = async (tableId) => {
  try {
    const result = await apiRequest('/manage-tables', {
      method: 'DELETE',
      body: JSON.stringify({ type: 'table', id: tableId })
    });

    if (!result.success || !result.data?.success) {
      console.error('Error deleting table:', result.error || result.data?.error);
      return { success: false, error: result.error || result.data?.error };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const getTableAssignments = async () => {
  try {
    const result = await apiRequest('/manage-tables?type=assignments');

    if (!result.success || !result.data?.success) {
      console.error('Error fetching assignments:', result.error || result.data?.error);
      return [];
    }

    return result.data.data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

export const assignGuestToTable = async (tableId, guestName, sourceType, guestId = null) => {
  try {
    const result = await apiRequest('/manage-tables', {
      method: 'POST',
      body: JSON.stringify({
        type: 'assignment',
        table_id: tableId,
        guest_name: guestName,
        source_type: sourceType,
        guest_id: guestId
      })
    });

    if (!result.success || !result.data?.success) {
      console.error('Error assigning guest:', result.error || result.data?.error);
      return { success: false, error: result.error || result.data?.error };
    }

    return { success: true, data: result.data.data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const removeGuestFromTable = async (assignmentId) => {
  try {
    const result = await apiRequest('/manage-tables', {
      method: 'DELETE',
      body: JSON.stringify({ type: 'assignment', id: assignmentId })
    });

    if (!result.success || !result.data?.success) {
      console.error('Error removing guest:', result.error || result.data?.error);
      return { success: false, error: result.error || result.data?.error };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const saveGuestMessage = async (guestId, senderName, message) => {
  try {
    const nameValidation = validateName(senderName);
    const messageValidation = validateMessage(message);

    if (!nameValidation.isValid || !messageValidation.isValid) {
      return {
        success: false,
        error: nameValidation.error || messageValidation.error
      };
    }

    const result = await apiRequest('/save-message', {
      method: 'POST',
      body: JSON.stringify({
        guestId,
        senderName: nameValidation.sanitized,
        message: messageValidation.sanitized
      })
    });

    if (!result.success) {
      console.error('Error saving message:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data?.data || result.data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};

export const getAllMessages = async () => {
  try {
    const result = await apiRequest('/get-messages');

    if (!result.success || !result.data?.success) {
      console.error('Error fetching messages:', result.error || result.data?.error);
      return [];
    }

    return result.data.messages || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};
