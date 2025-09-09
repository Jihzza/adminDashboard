export async function api(path) {
  const res = await fetch(path);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed: ${res.status}`);
  return body;
}

export const fetchAllUsers = () => api("/api/all-users");
export const fetchDagalowUsers = () => api("/api/dagalow/users");
export const fetchPerspectivUsers = () => api("/api/perspectiv/users");
export const fetchUser = (source, id) => api(`/api/${source}/users/${id}`);
export const fetchUserServices = (source, id) =>
  api(`/api/${source}/users/${id}/services`);

// Bug reports
export const fetchBugsAll = () => api("/api/bugs");
export const fetchBugsDaGalow = () => api("/api/dagalow/bugs");
export const fetchBugsPerspectiv = () => api("/api/perspectiv/bugs");

// Testimonials
export const fetchTestimonialsAll = () => api("/api/testimonials");
export const fetchTestimonialsDaGalow = () => api("/api/dagalow/testimonials");
export const fetchTestimonialsPerspectiv = () => api("/api/perspectiv/testimonials");

export const fetchApptsMonthAll = (year, month) =>
  api(`/api/appointments/month?year=${year}&month=${month}`);

export const fetchApptsMonthDagalow = (year, month) =>
  api(`/api/dagalow/appointments/month?year=${year}&month=${month}`);

export const fetchApptsMonthPerspectiv = (year, month) =>
  api(`/api/perspectiv/appointments/month?year=${year}&month=${month}`);


export const fetchPitchRequests = () => api("/api/pitch-requests");
