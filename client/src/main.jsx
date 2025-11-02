import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import { GoalfiProvider } from './contexts/GoalfiContext.jsx'
import { WalletProvider } from './contexts/WalletContext.jsx'
import { UserProvider } from './contexts/UserContext.jsx'
import { WalletInitializer } from './utils/WalletInitializer.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <WalletProvider>
    <UserProvider>
      <GoalfiProvider>
        <WalletInitializer>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </WalletInitializer>
      </GoalfiProvider>
    </UserProvider>
  </WalletProvider>
)
