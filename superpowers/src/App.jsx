import React, { useState } from 'react';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Header from './components/Header';
import MetricsGrid from './components/MetricsGrid';
import SubscriptionTable from './components/SubscriptionTable';
import SubscriptionModal from './components/SubscriptionModal';

function AppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);

  const handleOpenModal = (sub = null) => {
    setActiveSubscription(sub);
    setModalOpen(true);
  };

  return (
    <>
      <Header />
      <main>
        <MetricsGrid />
        <SubscriptionTable onOpenModal={handleOpenModal} />
      </main>
      {modalOpen && (
        <SubscriptionModal 
          activeSubscription={activeSubscription} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <SubscriptionProvider>
      <AppContent />
    </SubscriptionProvider>
  );
}
