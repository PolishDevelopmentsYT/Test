import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Swords, Trophy, BarChart3, Zap, Brain, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Geometric decorations */}
        <div className="absolute top-20 left-10 w-64 h-64 border border-primary/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 border border-secondary/20 rotate-45"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-primary/10 -rotate-12"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                [SYSTEM.INIT] v1.0.0
              </span>
            </div>
            
            <h1 className="mb-6">
              AI BATTLE<br />ARENA
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Compare different AI models head-to-head in real-time competitions. 
              Vote on responses, track performance, and discover which AI truly excels.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/arena">
                <a>
                  <Button size="lg" className="gap-2 text-lg px-8">
                    <Swords className="w-5 h-5" />
                    Start Battle
                  </Button>
                </a>
              </Link>
              <Link href="/leaderboard">
                <a>
                  <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                    <Trophy className="w-5 h-5" />
                    View Rankings
                  </Button>
                </a>
              </Link>
            </div>
            
            {/* Technical stats display */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-black text-primary">1000+</div>
                <div className="text-xs font-mono uppercase text-muted-foreground mt-1">Battle Topics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-secondary">Multi</div>
                <div className="text-xs font-mono uppercase text-muted-foreground mt-1">AI Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-primary">Real-time</div>
                <div className="text-xs font-mono uppercase text-muted-foreground mt-1">Streaming</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-accent/30">
        <div className="container">
          <div className="text-center mb-16">
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              [FEATURES.OVERVIEW]
            </span>
            <h2 className="mt-4">Platform Capabilities</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Swords className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">1v1 Battles</CardTitle>
                <CardDescription>
                  Pit AI models against each other with custom prompts or choose from 1000+ curated topics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl">ELO Rankings</CardTitle>
                <CardDescription>
                  Dynamic leaderboard using ELO rating system based on battle results and community votes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Real-time Streaming</CardTitle>
                <CardDescription>
                  Watch AI responses generate in real-time with side-by-side comparison
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Multi-Provider</CardTitle>
                <CardDescription>
                  Support for OpenAI, Anthropic, Google, and more AI model providers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Analytics</CardTitle>
                <CardDescription>
                  Comprehensive statistics, performance metrics, and voting patterns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Battle History</CardTitle>
                <CardDescription>
                  Track all your battles, votes, and compare results over time
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-12 text-center">
              <h2 className="mb-4">Ready to Compare?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your first AI battle and contribute to the community-driven rankings
              </p>
              <Link href="/arena">
                <a>
                  <Button size="lg" className="gap-2 text-lg px-8">
                    <Swords className="w-5 h-5" />
                    Enter the Arena
                  </Button>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-mono">AI Battle Arena</span> © 2025
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="font-mono">v1.0.0</span>
              <span className="font-mono">[SYSTEM.READY]</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
