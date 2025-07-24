import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Smartphone, Download, Apple, Play, Star, Shield, 
  Wifi, Volume2, Clock, Users, CheckCircle 
} from "lucide-react";

const features = [
  {
    icon: Volume2,
    title: "Real-time Audio Control",
    description: "Instantly adjust volume, skip tracks, or switch playlists from anywhere in your venue"
  },
  {
    icon: Clock,
    title: "Schedule Management",
    description: "View and modify your weekly music schedule on the go"
  },
  {
    icon: Users,
    title: "Multi-venue Support",
    description: "Manage multiple locations from a single app interface"
  },
  {
    icon: Wifi,
    title: "Offline Capability",
    description: "Download playlists for uninterrupted music during internet outages"
  },
  {
    icon: Shield,
    title: "Secure Connection",
    description: "Bank-level encryption ensures your music and data stay protected"
  }
];

const screenshots = [
  { name: "Dashboard", description: "Overview of all your venues" },
  { name: "Now Playing", description: "Current track and quick controls" },
  { name: "Scheduler", description: "Weekly music planning" },
  { name: "Playlists", description: "Browse and select music" }
];

export default function MobileApp() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-white/20 text-white border-white/30 w-fit">
                <Smartphone className="w-4 h-4 mr-2" />
                Available Now
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Control Your Venue's Music
                <span className="block text-business-accent">From Your Phone</span>
              </h1>
              
              <p className="text-xl text-white/90">
                The Deezer Business mobile app puts complete control of your venue's 
                atmosphere right in your pocket. Connect to your sound system and 
                manage your music professionally.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-black text-white hover:bg-black/90 flex items-center space-x-2">
                  <Apple className="w-5 h-5" />
                  <span>Download for iOS</span>
                </Button>
                <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Get it on Google Play</span>
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">4.8</span>
                  <span>App Store Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-5 h-5" />
                  <span>50K+ Downloads</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="aspect-[9/16] bg-black rounded-2xl flex items-center justify-center max-w-sm mx-auto">
                  <Smartphone className="w-24 h-24 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Powerful Mobile Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your venue's music, designed for mobile-first control
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Get up and running in minutes with our simple setup process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Download & Install</h3>
              <p className="text-muted-foreground">
                Download the Deezer Business app from your device's app store and create your account
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Connect Your System</h3>
              <p className="text-muted-foreground">
                Connect your phone to your sound system via Bluetooth, AUX, or wireless casting
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Start Playing</h3>
              <p className="text-muted-foreground">
                Choose your playlists, set your schedule, and let professional music enhance your venue
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">App Screenshots</h2>
            <p className="text-xl text-muted-foreground">
              Take a look at the clean, intuitive interface designed for busy business owners
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {screenshots.map((screenshot, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-[9/16] bg-muted/30 flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-muted-foreground" />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-sm">{screenshot.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{screenshot.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold">System Requirements</h2>
              <p className="text-xl text-muted-foreground">
                Compatible with most modern devices and sound systems
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Apple className="w-5 h-5" />
                    <span>iOS Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">iOS 13.0 or later</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">iPhone, iPad, and iPod touch</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">50MB storage space</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Internet connection required</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Android Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Android 7.0 (API level 24)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">2GB RAM minimum</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">50MB storage space</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Internet connection required</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to Download?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Get the Deezer Business mobile app and start controlling your venue's music like a pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-black text-white hover:bg-black/90 flex items-center space-x-2">
              <Apple className="w-5 h-5" />
              <span>Download for iOS</span>
            </Button>
            <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Get it on Google Play</span>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 flex items-center space-x-2" asChild>
              <Link to="/mobile-player">
                <Play className="w-5 h-5" />
                <span>Try Web Player</span>
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/70">
            Free download • No credit card required for trial
          </p>
        </div>
      </section>
    </div>
  );
}