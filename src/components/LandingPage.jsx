import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShaderRipple } from '@/components/shader-ripple';
import { FadeIn, BlurCard } from '@/components/ui/animated';
import { ArrowRight, MapPin, BarChart3, Shield, Zap } from 'lucide-react';

// Hummingbird Logo Component
function HummingbirdLogo({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <path d="M48 32 A13 13 0 1 1 48 58 L48 32"/>
        <path d="M61 40 L98 36 L61 50 Z"/>
        <path d="M55 50 L78 80 L25 65 Z"/>
        <path d="M25 65 L8 85 L18 58 Z"/>
      </g>
    </svg>
  );
}

export function LandingPage({ onEnter }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen w-full relative bg-stone-950">
      {/* Shader Ripple Background - Official @aliimam component */}
      <div className="absolute inset-0 w-full h-full">
        <ShaderRipple
          color1="#f59e0b"
          color2="#4f46e5"
          color3="#c2410c"
          backgroundColor="#0c0a09"
          rotation={90}
          mod={0.5}
          colorLayers={9}
          lineWidth={0.0005}
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <FadeIn delay={200} duration={800}>
          <BlurCard className="max-w-2xl w-full p-8 sm:p-12 text-center" blur="xl">
            <FadeIn delay={400}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-stone-600">
                <HummingbirdLogo className="w-4 h-4 mr-2" />
                UAS Flight Simulation Study
              </Badge>
            </FadeIn>

            <div className="mb-6">
              <FadeIn delay={500} direction="none">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground mb-2">
                  AP Research
                </h1>
              </FadeIn>
              <FadeIn delay={700} direction="none">
                <p className="text-xl sm:text-2xl font-light text-muted-foreground tracking-wide">
                  UAS Routing Efficiency Analysis
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={900}>
              <p className="text-lg text-stone-400 mb-8">
                by <span className="font-semibold text-foreground">Aarush Bhadragiri</span>
              </p>
            </FadeIn>

            <FadeIn delay={1100}>
              <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-border/50">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">5,400</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Simulations</div>
                </div>
                <div className="text-center border-x border-border/50">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">5</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">6</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Drones</div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={1300}>
              <Button
                onClick={onEnter}
                size="lg"
                className="group h-14 px-8 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Enter Application
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </FadeIn>
          </BlurCard>
        </FadeIn>

        <FadeIn delay={1500} className="mt-8">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: MapPin, label: 'Multi-City Analysis' },
              { icon: BarChart3, label: 'GIS Integration' },
              { icon: Shield, label: 'Privacy Zones' },
              { icon: Zap, label: 'Real-time Weather' }
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/40 backdrop-blur-sm border border-stone-700/30 text-sm text-stone-400"
              >
                <feature.icon className="h-4 w-4" />
                {feature.label}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={1700} className="absolute bottom-8">
          <p className="text-xs text-stone-600">
            Dallas • New York • San Francisco • Chicago • Los Angeles
          </p>
        </FadeIn>
      </div>
    </div>
  );
}

export default LandingPage;
