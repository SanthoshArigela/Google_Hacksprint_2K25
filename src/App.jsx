import React, { useState, useEffect } from 'react';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import ExpenseList from './pages/ExpenseList';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import AddExpense from './pages/AddExpense';
import BottomNav from './components/layout/BottomNav';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [screenData, setScreenData] = useState(null); // To pass data between screens
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Simulator flow
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('onboarding'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const navigate = (screen, data = null) => {
    setScreenData(data);
    setCurrentScreen(screen);
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onAddClick={() => navigate('add-expense')} onLogout={() => navigate('login')} />;
      case 'expenses':
        return <ExpenseList />;
      case 'insights':
        return <Insights />;
      case 'profile':
        return <Profile onLogout={() => navigate('login')} />;
      default:
        return <Home onAddClick={() => navigate('add-expense')} />;
    }
  };

  return (
    <div className="container">
      {currentScreen === 'splash' && <Splash />}
      {currentScreen === 'onboarding' && <Onboarding onFinish={() => navigate('login')} />}
      {currentScreen === 'login' && (
        <Login
          onLogin={() => navigate('dashboard')}
        />
      )}

      {currentScreen === 'dashboard' && (
        <>
          {renderDashboardContent()}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}

      {currentScreen === 'add-expense' && (
        <AddExpense
          onBack={() => navigate('dashboard')}
          onAdd={(data) => {
            console.log("Added:", data);
            navigate('dashboard');
          }}
        />
      )}
    </div>
  );
}

export default App;
