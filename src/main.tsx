import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './hooks/useCompany';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { Toaster } from './components/ui/toaster';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <HelmetProvider>
                <AuthProvider>
                    <CompanyProvider>
                        <SubscriptionProvider>
                            <App />
                            <Toaster />
                        </SubscriptionProvider>
                    </CompanyProvider>
                </AuthProvider>
            </HelmetProvider>
        </BrowserRouter>
    </React.StrictMode>
);
