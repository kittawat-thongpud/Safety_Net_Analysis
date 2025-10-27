import React from 'react'

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>🛡️ Safety Net Analysis System</h1>
            <p>Advanced Engineering Analysis for Fall Protection Systems</p>
          </div>
          <div className="header-actions">
            <div className="status-indicator">
              <div className="status-dot online"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header