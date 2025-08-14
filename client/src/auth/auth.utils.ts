export const getRoleFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
  } catch {
    return null;
  }
};


export const getUserIdFromToken = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["nameid"] ? Number(payload["nameid"]) : null;
  } catch {
    return null;
  }
};
export const setSession = (token: string) => {
  if (token) localStorage.setItem("token", token);
};

export const getSession = (): string | null => {
  return localStorage.getItem("token");
};

export const removeSession = () => {
  localStorage.removeItem("token");
};

export const isValidToken = (token: string): boolean => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch {
    return false;
  }
};

