import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Target, Brain, Zap, Shield, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Smart Usage Tracking",
      description: "Monitor app switching, screen time, and session patterns automatically"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "ADHD-Friendly Design",
      description: "Clean interface with color coding and minimal cognitive load"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Distraction Detection",
      description: "AI-powered alerts for sudden app switching and burst patterns"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Visual Analytics",
      description: "Beautiful charts showing focus patterns and productivity trends"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 text-focus" />
            <h1 className="text-4xl font-bold text-foreground">FocusTrack</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            Your mindful usage companion for better focus
          </p>
          <Badge variant="secondary" className="bg-focus/10 text-focus border-focus">
            <Shield className="h-3 w-3 mr-1" />
            Android Optimized
          </Badge>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-focus/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-focus/10 text-focus">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main CTA */}
        <Card className="border-2 border-focus bg-focus/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Ready to take control of your focus?</CardTitle>
            <CardDescription className="text-lg">
              Start tracking your phone usage patterns and build better digital habits today.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              size="lg" 
              className="bg-focus hover:bg-focus/90 text-focus-foreground"
              onClick={() => navigate('/dashboard')}
            >
              <Target className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <p className="text-sm text-muted-foreground">
              Requires Android device with usage access permissions
            </p>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            <Shield className="inline h-4 w-4 mr-1" />
            Your data stays on your device. We prioritize privacy and security.
          </p>
        </div>
      </div>
    </div>
  );
}