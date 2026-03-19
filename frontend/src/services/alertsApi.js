export const getAlerts = async () => {
  const response = await fetch("http://localhost:5000/api/alerts");
  return response.json();
};