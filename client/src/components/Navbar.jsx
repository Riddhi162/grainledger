import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  {
    section: 'TRANSACTIONS',
    links: [
      {
        to: '/',
        label: 'Add Transaction',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        ),
      },
      {
        to: '/transactions/daily',
        label: 'Daily Transactions',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        to: '/transactions/party',
        label: 'Party Reports',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'MANAGE',
    links: [
      {
        to: '/manage/items',
        label: 'Items',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        ),
      },
      {
        to: '/manage/clients',
        label: 'Clients',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        to: '/manage/cities',
        label: 'Cities',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const sidebarWidth = collapsed ? '64px' : '220px';

  return (
    <aside
      style={{
        width: sidebarWidth,
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {/* Logo + Toggle */}
      <div
        style={{
          padding: '20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '68px',
          flexShrink: 0,
        }}
      >
        {/* Logo text — hidden when collapsed */}
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: '22px',
                fontWeight: '700',
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              Dalali
            </span>
            <span
              style={{
                fontSize: '9px',
                color: 'rgba(148,163,184,0.5)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              Brokerage Manager
            </span>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            color: 'rgba(148,163,184,0.8)',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(96,165,250,0.15)';
            e.currentTarget.style.color = '#60a5fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(148,163,184,0.8)';
          }}
        >
          {/* Chevron icon — flips direction based on collapsed state */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={14}
            height={14}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav sections */}
      <nav
        style={{
          flex: 1,
          padding: '12px 8px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map((group) => (
          <div key={group.section} style={{ marginBottom: '20px' }}>
            {/* Section label — hidden when collapsed */}
            {!collapsed && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  color: 'rgba(148,163,184,0.4)',
                  padding: '0 8px',
                  display: 'block',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {group.section}
              </span>
            )}

            {/* Divider shown in collapsed mode instead of label */}
            {collapsed && (
              <div
                style={{
                  height: '1px',
                  background: 'rgba(255,255,255,0.07)',
                  margin: '4px 8px 8px',
                }}
              />
            )}

            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                title={collapsed ? link.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  padding: collapsed ? '10px 0' : '9px 8px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#e2e8f0' : 'rgba(148,163,184,0.8)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(96,165,250,0.18), rgba(167,139,250,0.10))'
                    : 'transparent',
                  borderLeft: collapsed
                    ? 'none'
                    : isActive
                    ? '3px solid #60a5fa'
                    : '3px solid transparent',
                  borderRadius: collapsed && isActive ? '8px' : '8px',
                  outline: collapsed && isActive ? '1px solid rgba(96,165,250,0.4)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                })}
              >
                <span style={{ opacity: 0.85, flexShrink: 0 }}>{link.icon}</span>
                {!collapsed && link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: '12px 10px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        {/* Avatar */}
        <div
          title={collapsed ? (user?.name || 'User') : undefined}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            color: '#0f172a',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Name — hidden when collapsed */}
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#e2e8f0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'User'}
            </div>
          </div>
        )}

        {/* Logout button — hidden when collapsed (use avatar tooltip instead or show icon) */}
        {!collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(148,163,184,0.6)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.6)')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}

        {/* When collapsed, clicking avatar logs out — or show a separate logout icon */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: 'none', // hidden; user can expand to logout — or uncomment below to always show
            }}
          />
        )}
      </div>
    </aside>
  );
};

export default Navbar;