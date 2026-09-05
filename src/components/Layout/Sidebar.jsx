import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaEnvelope, 
  FaSms, 
  FaInbox,
  FaPaperPlane,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { to: '/', icon: FaHome, label: 'Tableau de bord' },
    { 
      section: 'Email',
      items: [
        { to: '/emails', icon: FaEnvelope, label: 'Emails' },
        { to: '/emails/send', icon: FaPaperPlane, label: 'Envoyer un Email' },
        { to: '/emails/charts', icon: FaChartBar, label: 'Statistiques Email' },
      ]
    },
    {
      section: 'SMS',
      items: [
        { to: '/sms', icon: FaSms, label: 'SMS' },
        { to: '/sms/send', icon: FaPaperPlane, label: 'Envoyer un SMS' },
        { to: '/sms/inbox', icon: FaInbox, label: 'Boîte de réception' },
        { to: '/sms/charts', icon: FaChartBar, label: 'Statistiques SMS' },
      ]
    }
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      <aside 
        className={`fixed left-0 top-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div className={`flex items-center space-x-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold text-gray-800">Communication</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
          >
            {sidebarOpen ? <FaChevronLeft className="w-4 h-4 text-gray-500" /> : <FaChevronRight className="w-4 h-4 text-gray-500" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-4 overflow-y-auto h-[calc(100%-8rem)]">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.section && sidebarOpen && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  {item.section}
                </p>
              )}
              <div className="space-y-1">
                {item.section ? (
                  item.items.map((subItem) => (
                    <NavLink
                      key={subItem.to}
                      to={subItem.to}
                      className={({ isActive }) =>
                        `flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center'} py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`
                      }
                    >
                      <subItem.icon className={`w-5 h-5 ${sidebarOpen ? 'min-w-5' : ''}`} />
                      {sidebarOpen && <span className="text-sm font-medium">{subItem.label}</span>}
                    </NavLink>
                  ))
                ) : (
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center'} py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`
                    }
                  >
                    <item.icon className={`w-5 h-5 ${sidebarOpen ? 'min-w-5' : ''}`} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </NavLink>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 space-y-1">
          <button className={`flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center'} w-full py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors`}>
            <FaCog className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Paramètres</span>}
          </button>
          <button className={`flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center'} w-full py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors`}>
            <FaSignOutAlt className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;