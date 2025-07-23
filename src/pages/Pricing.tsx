import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for small cafes and shops",
    features: [
      "Up to 100 hours of music per month",
      "Basic playlist library (500+ playlists)",
      "Weekly scheduling",
      "Mobile app access",
      "Email support",
      "1 venue location",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: 59,
    description: "Ideal for restaurants and bars",
    features: [
      "Unlimited music streaming",
      "Premium playlist library (2000+ playlists)",
      "Advanced scheduling features",
      "Mobile app with remote control",
      "Priority phone & email support",
      "Up to 3 venue locations",
      "Music analytics & insights",
      "Custom playlist requests",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 149,
    description: "For chains and multiple locations",
    features: [
      "Everything in Professional",
      "Unlimited venue locations",
      "Dedicated account manager",
      "Custom integrations",
      "White-label mobile app option",
      "Advanced analytics dashboard",
      "24/7 phone support",
      "Music licensing consultation",
      "Bulk management tools",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container text-center space-y-6">
          <Badge className="bg-white/20 text-white border-white/30">
            <Star className="w-4 h-4 mr-2" />
            14-Day Free Trial
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold">Simple, Transparent Pricing</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Choose the perfect plan for your venue. No hidden fees, no long-term contracts.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-6 py-1">
                      <Zap className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-hero hover:opacity-90' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to={plan.name === "Enterprise" ? "/contact" : "/signup"}>
                      {plan.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about our pricing</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
                <p className="text-muted-foreground">No setup fees ever. Just choose your plan and start playing music immediately.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">What's included in the free trial?</h3>
                <p className="text-muted-foreground">Full access to all Professional plan features for 14 days. No credit card required to start.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Are there any contracts?</h3>
                <p className="text-muted-foreground">No long-term contracts. Pay monthly and cancel anytime with no penalties.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Is music licensing included?</h3>
                <p className="text-muted-foreground">Yes, all our music is properly licensed for commercial use. You're fully covered.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Can I add more locations later?</h3>
                <p className="text-muted-foreground">Absolutely. You can add additional venue locations to your account at any time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join hundreds of venues already using Deezer Business to create the perfect atmosphere.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8" asChild>
            <Link to="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}