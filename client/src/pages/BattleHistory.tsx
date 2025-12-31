import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { History, Clock, Trophy, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Streamdown } from "streamdown";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function BattleHistory() {
  const { isAuthenticated } = useAuth();
  const { data: battles, isLoading } = trpc.battles.getUserHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );
  const { data: models } = trpc.models.list.useQuery({});

  const getModelName = (modelId: number) => {
    return models?.find(m => m.id === modelId)?.name || `Model #${modelId}`;
  };

  const getWinnerBadge = (battle: any) => {
    if (!battle.winnerId) {
      return <Badge variant="outline" className="gap-1"><Minus className="w-3 h-3" />Draw</Badge>;
    }
    const isModel1Winner = battle.winnerId === battle.model1Id;
    return (
      <Badge variant="default" className="gap-1">
        <Trophy className="w-3 h-3" />
        {isModel1Winner ? getModelName(battle.model1Id) : getModelName(battle.model2Id)}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please login to view your battle history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Login to Continue</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-primary" />
            <h2>Battle History</h2>
          </div>
          <p className="text-muted-foreground">
            View all your past AI battles and results
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : battles && battles.length > 0 ? (
          <div className="space-y-4">
            {battles.map((battle) => (
              <Card key={battle.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {getModelName(battle.model1Id)} vs {getModelName(battle.model2Id)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {format(new Date(battle.createdAt), "PPpp")}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={battle.status === "completed" ? "default" : "secondary"}>
                        {battle.status}
                      </Badge>
                      {battle.status === "completed" && getWinnerBadge(battle)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{getModelName(battle.model1Id)}</span>
                        {battle.model1ResponseTime && (
                          <Badge variant="outline" className="text-xs">
                            {battle.model1ResponseTime}ms
                          </Badge>
                        )}
                      </div>
                      {battle.model1Response && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              View Response
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{getModelName(battle.model1Id)} Response</DialogTitle>
                            </DialogHeader>
                            <div className="prose prose-sm max-w-none">
                              <Streamdown>{battle.model1Response}</Streamdown>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{getModelName(battle.model2Id)}</span>
                        {battle.model2ResponseTime && (
                          <Badge variant="outline" className="text-xs">
                            {battle.model2ResponseTime}ms
                          </Badge>
                        )}
                      </div>
                      {battle.model2Response && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              View Response
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{getModelName(battle.model2Id)} Response</DialogTitle>
                            </DialogHeader>
                            <div className="prose prose-sm max-w-none">
                              <Streamdown>{battle.model2Response}</Streamdown>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No battles yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first AI battle to see your history here
              </p>
              <Button asChild>
                <a href="/arena">Go to Arena</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
