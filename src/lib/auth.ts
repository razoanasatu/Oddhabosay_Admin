// app/lib/auth.ts
import { destroyCookie, parseCookies, setCookie } from "nookies";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

export function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    setCookie(null, "adminAuth", JSON.stringify({ email }), {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return true;
  }
  return false;
}

export function logout() {
  destroyCookie(null, "adminAuth");
}

export function getUser(ctx?: any) {
  const cookies = parseCookies(ctx);
  const user = cookies.adminAuth ? JSON.parse(cookies.adminAuth) : null;
  return user;
}
