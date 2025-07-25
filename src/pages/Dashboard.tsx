import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Music, Play, Clock, BarChart3, Settings } from "lucide-react";
import { WeeklyScheduler } from "@/components/dashboard/WeeklyScheduler";
import { PlaylistLibrary } from "@/components/dashboard/PlaylistLibrary";

const stats = [
  {
    title: "Hours Scheduled",
    value: "17",
    change: "Current schedule",
    icon: Clock,
  },
  {
    title: "Active Playlists",
    value: "6",
    change: "Available",
    icon: Music,
  },
  {
    title: "Weekly Plays (fake data)",
    value: "1,247",
    change: "+8.2%",
    icon: Play,
  },
  {
    title: "Venues",
    value: "1",
    change: "No change",
    icon: BarChart3,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-primary">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Music Dashboard</h1>
              <p className="text-white/80">Manage your venue's music schedule and playlists</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Live
              </Badge>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Weekly Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center space-x-2">
              <Music className="h-4 w-4" />
              <span>Playlist Library</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Weekly Music Scheduler</span>
                </CardTitle>
                <CardDescription>
                  Drag and drop playlists to schedule your venue's music for the entire week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyScheduler />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Available Playlists</span>
                </CardTitle>
                <CardDescription>
                  Browse and manage your curated playlist collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlaylistLibrary />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Listening Patterns</CardTitle>
                  <CardDescription>Your venue's music usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Analytics chart would go here
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Popular Playlists</CardTitle>
                  <CardDescription>Most played content this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Coffee Shop Vibes", plays: 89, percentage: 85 },
                      { name: "Dinner Jazz", plays: 67, percentage: 64 },
                      { name: "Upbeat Retail", plays: 45, percentage: 43 },
                      { name: "Chill Lounge", plays: 32, percentage: 31 },
                    ].map((playlist, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{playlist.name}</span>
                          <span>{playlist.plays} plays</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${playlist.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}