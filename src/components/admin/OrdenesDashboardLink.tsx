'use client'

import React from 'react'
import Link from 'next/link'

export function OrdenesDashboardLink() {
  return (
    <div style={{ 
      padding: '0 var(--gutter-h)', 
      marginTop: 'var(--base)',
      borderTop: '1px solid var(--theme-elevation-100)',
      paddingTop: 'var(--base)',
    }}>
      <Link 
        href="/admin/dashboard-ordenes" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '4px',
          textDecoration: 'none',
          color: 'var(--theme-text)',
          backgroundColor: 'var(--theme-elevation-50)',
          transition: 'background-color 0.2s',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
        Dashboard de Ventas
      </Link>
    </div>
  )
}

export default OrdenesDashboardLink
