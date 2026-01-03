import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, BookOpen, Target, Clock } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg animate-float">
            <Sparkles className="h-8 w-8" />
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
            Path <span className="text-gradient">Weaver</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Stop randomly watching tutorials. Get an AI-powered, personalized learning path 
            tailored to your goals, skill level, and schedule.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg">
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Personalized Paths</h3>
            <p className="text-muted-foreground">
              AI analyzes your goals and creates a step-by-step roadmap with real resources
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
              <Target className="h-7 w-7 text-accent" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Track Progress</h3>
            <p className="text-muted-foreground">
              Mark steps complete, see your progress, and stay motivated on your journey
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-success/10">
              <Clock className="h-7 w-7 text-success" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI Assistant</h3>
            <p className="text-muted-foreground">
              Get help anytime with our AI that understands your learning context
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}