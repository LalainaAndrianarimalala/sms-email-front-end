import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaEnvelope, 
  FaSms, 
  FaInbox,
  FaPaperPlane
} from 'react-icons/fa';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: FaHome, label: 'Tableau de bord' },
    { to: '/emails', icon: FaEnvelope, label: 'Emails' },
    { to: '/emails/send', icon: FaPaperPlane, label: 'Envoyer un Email' },
    { to: '/sms', icon: FaSms, label: 'SMS' },
    { to: '/sms/send', icon: FaPaperPlane, label: 'Envoyer un SMS' },
    { to: '/sms/inbox', icon: FaInbox, label: 'Boîte de réception' },
  ];

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;