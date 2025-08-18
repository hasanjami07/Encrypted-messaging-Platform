export async function getBackendUrl() {
  try {
    const res = await fetch("http://localhost:8000/backend-config");
    const data = await res.json();
    if (!data.backendPort) throw new Error("No backend port returned");
    return `http://localhost:${data.backendPort}`;
  } catch (err) {
    console.warn("Falling back to default backend URL:", err);
    return "http://localhost:8000";
  }
}
