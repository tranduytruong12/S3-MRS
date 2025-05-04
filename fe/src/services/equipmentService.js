import axios from 'axios';

const API_URL = 'http://localhost:8080/api/equipment';

// Function to get the auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all equipment
export const getAllEquipment = async () => {
  try {
    const response = await axios.get(`${API_URL}/public`);
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

// Get a single equipment by ID
export const getEquipmentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, { 
      headers: getAuthHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching equipment ${id}:`, error);
    throw error;
  }
};

// Borrow equipment
export const borrowEquipment = async (id, purpose) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/borrow`, 
      { purpose },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error borrowing equipment ${id}:`, error);
    throw error;
  }
};

// Return equipment
export const returnEquipment = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/return`, 
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error returning equipment ${id}:`, error);
    throw error;
  }
};

// For admin/staff: Create new equipment
export const createEquipment = async (equipmentData) => {
  try {
    const response = await axios.post(API_URL, 
      equipmentData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw error;
  }
};

// For admin/staff: Update equipment
export const updateEquipment = async (id, status) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, 
      { Status: status },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating equipment ${id}:`, error);
    throw error;
  }
};

// For admin: Delete equipment
export const deleteEquipment = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { 
      headers: getAuthHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting equipment ${id}:`, error);
    throw error;
  }
};

// For admin: Get equipment status report
export const getEquipmentReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/report`, { 
      headers: getAuthHeader() 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment report:', error);
    throw error;
  }
};

export default {
  getAllEquipment,
  getEquipmentById,
  borrowEquipment,
  returnEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentReport
}; 