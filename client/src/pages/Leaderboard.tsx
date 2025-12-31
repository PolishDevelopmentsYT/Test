import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, TrendingDown, Medal, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = trpc.leaderboard.get.useQuery({ limit: 50 });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-mono text-muted-foreground">#{rank}</span>;
  };

  const getWinRate = (wins: number, losses: number, draws: number) => {
    const total = wins + losses + draws;
    if (total === 0) return 0;
    return ((wins / total) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h2>Leaderboard</h2>
          </div>
          <p className="text-muted-foreground">
            AI models ranked by ELO rating based on battle performance
          </p>
        </div>

        {/* Top 3 Podium */}
        {!isLoading && leaderboard && leaderboard.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* 2nd Place */}
            <Card className="border-2 border-gray-400/30 md:order-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Medal className="w-12 h-12 text-gray-400" />
                </div>
                <CardTitle className="text-2xl">{leaderboard[1].name}</CardTitle>
                <CardDescription>{leaderboard[1].provider}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="text-4xl font-black text-primary">{leaderboard[1].eloRating}</div>
                <div className="text-xs font-mono text-muted-foreground">ELO RATING</div>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="outline">{leaderboard[1].totalWins}W</Badge>
                  <Badge variant="outline">{leaderboard[1].totalLosses}L</Badge>
                  <Badge variant="outline">{leaderboard[1].totalDraws}D</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Win Rate: {getWinRate(leaderboard[1].totalWins, leaderboard[1].totalLosses, leaderboard[1].totalDraws)}%
                </div>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="border-2 border-yellow-500/50 md:order-2 md:-mt-4">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Trophy className="w-16 h-16 text-yellow-500" />
                </div>
                <CardTitle className="text-3xl">{leaderboard[0].name}</CardTitle>
                <CardDescription>{leaderboard[0].provider}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="text-5xl font-black text-primary">{leaderboard[0].eloRating}</div>
                <div className="text-xs font-mono text-muted-foreground">ELO RATING</div>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="outline">{leaderboard[0].totalWins}W</Badge>
                  <Badge variant="outline">{leaderboard[0].totalLosses}L</Badge>
                  <Badge variant="outline">{leaderboard[0].totalDraws}D</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Win Rate: {getWinRate(leaderboard[0].totalWins, leaderboard[0].totalLosses, leaderboard[0].totalDraws)}%
                </div>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="border-2 border-amber-600/30 md:order-3">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Award className="w-12 h-12 text-amber-600" />
                </div>
                <CardTitle className="text-2xl">{leaderboard[2].name}</CardTitle>
                <CardDescription>{leaderboard[2].provider}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="text-4xl font-black text-primary">{leaderboard[2].eloRating}</div>
                <div className="text-xs font-mono text-muted-foreground">ELO RATING</div>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="outline">{leaderboard[2].totalWins}W</Badge>
                  <Badge variant="outline">{leaderboard[2].totalLosses}L</Badge>
                  <Badge variant="outline">{leaderboard[2].totalDraws}D</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Win Rate: {getWinRate(leaderboard[2].totalWins, leaderboard[2].totalLosses, leaderboard[2].totalDraws)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Rankings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Rankings</CardTitle>
            <CardDescription>All AI models sorted by ELO rating</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">ELO</TableHead>
                    <TableHead className="text-right">Battles</TableHead>
                    <TableHead className="text-right">W/L/D</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard?.map((model, index) => {
                    const rank = index + 1;
                    const winRate = getWinRate(model.totalWins, model.totalLosses, model.totalDraws);
                    
                    return (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center justify-center">
                            {getRankIcon(rank)}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{model.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{model.provider}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-lg">{model.eloRating}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {model.totalBattles}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Badge variant="outline" className="text-xs">
                              {model.totalWins}W
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {model.totalLosses}L
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {model.totalDraws}D
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-semibold">{winRate}%</span>
                            {Number(winRate) >= 50 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
