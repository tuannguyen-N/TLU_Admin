import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './config/msalConfig';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css'
import App from './App.tsx'

async function bootstrap() {
  const msalInstance = new PublicClientApplication(msalConfig);

  await msalInstance.initialize();

  const redirectResult = await msalInstance.handleRedirectPromise();
  if (redirectResult) {
    msalInstance.setActiveAccount(redirectResult.account);
  }

  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as { account: any };
      msalInstance.setActiveAccount(payload.account);
    }
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <MantineProvider>
          <Notifications position="top-right" />
          <App />
        </MantineProvider>
      </MsalProvider>
    </StrictMode>
  );
}

bootstrap();
