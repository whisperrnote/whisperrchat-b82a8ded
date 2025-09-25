import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Hello World</h1>
        <p className="text-muted-foreground">Welcome to WhisperrChat</p>
        <Button asChild>
          <Link to="/auth">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}