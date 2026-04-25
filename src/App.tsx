import { BrowserRouter } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes';

function App() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {isAuthenticated && <Navbar />}
        <main style={{ flex: 1, padding: '20px' }}>
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;