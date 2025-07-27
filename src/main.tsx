import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";

const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
const redirectUri = window.location.origin;

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    redirectUri="clarity://dev-a2jy8021kbq84xg3.us.auth0.com/android/com.duodevelopers.clarity/callback"
  >
    <App />
  </Auth0Provider>
);
