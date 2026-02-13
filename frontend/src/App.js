import { useState } from "react";
import "@/App.css";
import Dashboard from "./components/Dashboard";
import BOMGrid from "./components/BOMGrid";
import COReadinessReview from "./components/COReadinessReview";
import ItemDetailDrawer from "./components/ItemDetailDrawer";
import { Toaster } from "sonner";

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDrawer = () => {
    setSelectedItem(null);
  };

  return (
    <div className="App">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '2px',
          },
        }}
      />
      
      {currentView === 'dashboard' && (
        <Dashboard
          onNavigateToBOM={() => setCurrentView('bom-grid')}
          onNavigateToCO={() => setCurrentView('co-readiness')}
        />
      )}
      
      {currentView === 'bom-grid' && (
        <>
          <BOMGrid
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onNavigateToCO={() => setCurrentView('co-readiness')}
            onSelectItem={handleSelectItem}
          />
          {selectedItem && (
            <ItemDetailDrawer
              item={selectedItem}
              onClose={handleCloseDrawer}
            />
          )}
        </>
      )}
      
      {currentView === 'co-readiness' && (
        <COReadinessReview
          onNavigateToDashboard={() => setCurrentView('dashboard')}
          onNavigateToBOM={() => setCurrentView('bom-grid')}
        />
      )}
    </div>
  );
}

export default App;
