import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AppProviders } from './providers';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppProviders>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</AppProviders>
	</StrictMode>,
);
