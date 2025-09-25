import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-8">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-foreground">
          Hello World
        </h1>
        <p className="text-xl text-muted-foreground">
          Welcome to Whisperrchat
        </p>
        <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white" asChild>
          <Link to="/auth">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Landing;