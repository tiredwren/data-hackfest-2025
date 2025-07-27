import Welcome from "./Welcome";
import { Auth0Provider } from '@auth0/auth0-react';

const domain = process.env.VITE_AUTH0_DOMAIN;
const clientId = process.env.VITE_AUTH0_CLIENT_ID;

const Index = () => {
  return <Welcome />;
};

export default Index;
