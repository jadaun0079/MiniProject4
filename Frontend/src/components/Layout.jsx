import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TransactionModal from './TransactionModal';

const Layout = ({ children, title = 'Command Center', onTransactionAdded }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);

  const handleTransactionSaved = (newTx) => {
    if (onTransactionAdded) {
      onTransactionAdded(newTx);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex relative overflow-x-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none -z-10" />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <Navbar
          title={title}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewTransaction={() => setTransactionModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>

      {/* Global Quick Transaction Modal */}
      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        onTransactionSaved={handleTransactionSaved}
      />
    </div>
  );
};

export default Layout;
