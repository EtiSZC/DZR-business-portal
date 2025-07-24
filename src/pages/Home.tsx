import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, Smartphone, Clock, Users, Shield, Zap, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Curated Playlists",
    description: "Access thousands of professionally curated playlists designed for business environments",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Plan your music week ahead with our intuitive drag-and-drop calendar system",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Control your venue's music directly from your smartphone with our dedicated app",
  },
  {
    icon: Shield,
    title: "Licensed Music",
    description: "All music is properly licensed for commercial use, keeping you compliant",
  },
  {
    icon: Clock,
    title: "24/7 Operation",
    description: "Set it and forget it - your music plays automatically around the clock",
  },
  {
    icon: Users,
    title: "Multi-Location",
    description: "Manage multiple venues from a single dashboard with individual scheduling",
  },
];

const benefits = [
  "No more repetitive playlists",
  "Professional atmosphere creation",
  "Reduced staff workload",
  "Compliance guarantee",
  "Seamless customer experience",
  "Cost-effective solution",
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Zap className="w-4 h-4 mr-2" />
              Now Available for Independent Venues
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Professional Background Music
              <span className="block text-white">Made Simple</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
              Transform your venue's atmosphere with our easy-to-use music solution. 
              Schedule, play, and manage professional playlists that keep your customers engaged.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8" asChild>
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-black bg-white hover:bg-white/90 text-lg px-8" asChild>
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for independent businesses that want professional music management without the complexity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-elegant">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4 group-hover:text-primary-glow transition-colors" />
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

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-5xl font-bold">Why Choose Deezer Business?</h2>
              <p className="text-xl text-muted-foreground">
                We understand the unique challenges independent venues face. Our solution is designed to save you time, 
                money, and ensure your customers always enjoy the perfect atmosphere.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button size="lg" variant="brand" asChild>
                <Link to="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-elegant border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Weekly Music Planning</h3>
                      <p className="text-sm text-muted-foreground">Schedule your perfect week</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Mobile Control</h3>
                      <p className="text-sm text-muted-foreground">Control from anywhere</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Professional Playlists</h3>
                      <p className="text-sm text-muted-foreground">Curated for your business</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">Ready to Transform Your Venue?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join hundreds of independent venues already using Deezer Business to create the perfect atmosphere for their customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8" asChild>
              <Link to="/signup">Start Your Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8" asChild>
              <Link to="/mobile-app">Download Mobile App</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}