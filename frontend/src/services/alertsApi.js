import api from "./api";

export const getAlerts = async () => {
  const response = await api.get("/alerts/");
  return response.data;
};

export const getAlertById = async (id) => {
  const response = await api.get(`/alerts/${id}`);
  return response.data;
};

export const createAlert = async (alertData) => {
  const response = await api.post("/alerts/", alertData);
  return response.data;
};

export const updateAlert = async (id, alertData) => {
  const response = await api.put(`/alerts/${id}`, alertData);
  return response.data;
};

export const deleteAlert = async (id) => {
  const response = await api.delete(`/alerts/${id}`);
  return response.data;
};