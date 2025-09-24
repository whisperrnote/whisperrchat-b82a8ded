import React from 'react';
import { Toaster } from './components/ui/sonner';
import Chat from './pages/Chat';

function App() {
  return (
    <>
      <Chat />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
