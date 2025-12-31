import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Cpu, Search, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Models() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allModels, isLoading } = trpc.models.list.useQuery({});
  const { data: searchResults, isLoading: isSearching } = trpc.models.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const models = searchQuery.length > 0 ? searchResults : allModels;

  const getWinRate = (wins: number, losses: number, draws: number) => {
    const total = wins + losses + draws;
    if (total === 0) return "N/A";
    return ((wins / total) * 100).toFixed(1) + "%";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-8 h-8 text-primary" />
            <h2>AI Models</h2>
          </div>
          <p className="text-muted-foreground">
            Browse and search available AI models for battles
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search AI models by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Models Grid */}
        {isLoading || isSearching ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : models && models.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{model.name}</CardTitle>
                    {model.isActive === 1 && (
                      <Badge variant="default" className="gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{model.provider}</Badge>
                    {model.category && <Badge variant="secondary">{model.category}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {model.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {model.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">ELO Rating</span>
                      <span className="text-2xl font-black text-primary">{model.eloRating}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Battles</span>
                      <span className="font-mono font-semibold">{model.totalBattles}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Win Rate</span>
                      <span className="font-semibold">
                        {getWinRate(model.totalWins, model.totalLosses, model.totalDraws)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{model.totalWins}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{model.totalLosses}</div>
                        <div className="text-xs text-muted-foreground">Losses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">{model.totalDraws}</div>
                        <div className="text-xs text-muted-foreground">Draws</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <div className="text-xs font-mono text-muted-foreground">
                      ID: {model.modelId}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Cpu className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No models found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No AI models available yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
