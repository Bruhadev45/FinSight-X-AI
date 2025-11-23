"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Logo, LogoText } from "@/components/Logo";
import { Shield, Lock, ArrowRight, Sparkles } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { InteractiveSandbox } from "@/components/landing/InteractiveSandbox";

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md dark:bg-slate-900/90">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <LogoText />
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => scrollToSection("features")}>
                Features
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollToSection("services")}>
                Services
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollToSection("contact")}>
                Contact
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
            </div>
            <Button size="sm" asChild className="md:hidden">
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection scrollToSection={scrollToSection} />
      <div className="relative z-10 -mt-20 mb-20">
        <InteractiveSandbox />
      </div>
      <FeaturesSection />
      <ServicesSection />
      <ContactSection />

      {/* CTA Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="py-12 sm:py-16 text-center px-4 sm:px-6">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of companies using FinSight X AI to secure their financial operations
              and gain actionable insights from their documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => scrollToSection("contact")}
              >
                Talk to Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo size={32} />
                <span className="font-bold text-slate-900 dark:text-white">FinSight X AI</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enterprise-grade financial intelligence powered by advanced AI technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600">Dashboard</Link></li>
                <li><Link href="/dashboard/advanced-features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600">Features</Link></li>
                <li>
                  <button
                    onClick={() => scrollToSection("services")}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-left"
                  >
                    Services
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-left"
                  >
                    Contact
                  </button>
                </li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600">About</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600">Terms of Service</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2024 FinSight X AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                SOC 2 Certified
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                256-bit Encryption
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}
