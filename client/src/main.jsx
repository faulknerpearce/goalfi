import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import { GoalfiProvider } from './context/web3/goalfiContext.jsx'
import { WalletProvider } from './context/web3/walletContext.jsx'
import { UserProvider } from './context/database/userContext.jsx'
import { WalletInitializer } from './context/web3/WalletInitializer.jsx'

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
