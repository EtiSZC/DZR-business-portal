import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Music, Calendar, Smartphone, Shield, Clock, Users, 
  BarChart3, Settings, Wifi, Download, PlayCircle, Volume2,
  HeadphonesIcon, Globe, Zap
} from "lucide-react";

const mainFeatures = [
  {
    icon: Music,
    title: "Professional Music Library",
    description: "Access to thousands of professionally curated playlists designed specifically for business environments",
    details: [
      "2000+ curated playlists",
      "Genre-specific collections",
      "Mood-based categories",
      "Regular content updates",
      "Commercial-use licensed music"
    ]
  },
  {
    icon: Calendar,
    title: "Smart Scheduling System",
    description: "Plan your entire week with our intuitive drag-and-drop calendar interface",
    details: [
      "Weekly visual scheduler",
      "Drag & drop playlist assignment",
      "Automatic playlist transitions",
      "Schedule templates",
      "Conflict detection"
    ]
  },
  {
    icon: Smartphone,
    title: "Mobile App Control",
    description: "Complete control of your venue's music from your smartphone or tablet",
    details: [
      "Real-time music control",
      "Remote volume adjustment",
      "Playlist switching",
      "Schedule modifications",
      "Multi-location management"
    ]
  },
  {
    icon: Shield,
    title: "Licensed & Compliant",
    description: "All music is properly licensed for commercial use, ensuring full legal compliance",
    details: [
      "PRO licensing included",
      "Commercial use rights",
      "Legal compliance guarantee",
      "Licensing documentation",
      "Regular compliance updates"
    ]
  }
];

const additionalFeatures = [
  {
    icon: Clock,
    title: "24/7 Automated Operation",
    description: "Set your schedule and let the system run automatically"
  },
  {
    icon: Users,
    title: "Multi-Location Management",
    description: "Manage multiple venues from a single dashboard"
  },
  {
    icon: BarChart3,
    title: "Music Analytics",
    description: "Insights into your music usage and customer preferences"
  },
  {
    icon: Settings,
    title: "Easy Setup",
    description: "Simple plug-and-play setup with existing sound systems"
  },
  {
    icon: Wifi,
    title: "Cloud-Based",
    description: "No local storage needed, everything streams from the cloud"
  },
  {
    icon: Download,
    title: "Offline Mode",
    description: "Download playlists for uninterrupted music during outages"
  },
  {
    icon: PlayCircle,
    title: "Seamless Transitions",
    description: "Smooth crossfading between tracks and playlists"
  },
  {
    icon: Volume2,
    title: "Auto Volume Control",
    description: "Automatic volume leveling for consistent audio experience"
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-6">
          <Badge className="bg-white/20 text-white border-white/30">
            <Zap className="w-4 h-4 mr-2" />
            Professional Music Solution
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold">Powerful Features for Your Business</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Everything you need to create the perfect atmosphere for your customers, 
            from automated scheduling to real-time control.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Core Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for independent businesses that demand professional results
            </p>
          </div>

          <div className="space-y-16">
            {mainFeatures.map((feature, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                  </div>
                  
                  <p className="text-lg text-muted-foreground">{feature.description}</p>
                  
                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <Card className="bg-card border shadow-elegant p-8">
                    <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-16 h-16 text-primary/30" />
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Additional Features</h2>
            <p className="text-xl text-muted-foreground">
              Even more ways to enhance your venue's audio experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 bg-white">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Features */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold">Mobile App Control</h2>
              <p className="text-xl text-muted-foreground">
                Complete control of your venue's music right from your pocket. 
                Our mobile app puts professional music management at your fingertips.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <PlayCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Instant Playback Control</h3>
                    <p className="text-muted-foreground">Start, stop, or skip tracks instantly from anywhere in your venue</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Volume2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Volume Management</h3>
                    <p className="text-muted-foreground">Adjust volume levels for different areas or times of day</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Multi-Location Support</h3>
                    <p className="text-muted-foreground">Manage multiple venues from a single app interface</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90" asChild>
                <Link to="/mobile-app">Download Mobile App</Link>
              </Button>
            </div>
            
            <div className="relative">
              <Card className="bg-card border shadow-elegant p-12">
                <div className="aspect-square bg-muted/30 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-24 h-24 text-primary/30" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">Experience All Features</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Try Deezer Business risk-free for 14 days and see how our features can transform your venue's atmosphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-black bg-white hover:bg-white/90 text-lg px-8" asChild>
              <Link to="/dashboard">View Demo Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}