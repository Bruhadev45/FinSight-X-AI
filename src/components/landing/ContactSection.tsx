"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function ContactSection() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Form submitted:", formData);
        alert("Thank you for your interest! We'll be in touch soon.");
        setFormData({ name: "", email: "", company: "", message: "" });
    };

    return (
        <section id="contact" className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Side - Contact Info */}
                <div>
                    <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                        GET IN TOUCH
                    </Badge>
                    <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 font-space-grotesk">
                        Contact Us
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                        Ready to transform your financial operations with AI? Get in touch with our team
                        to schedule a personalized demo or discuss your specific needs.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h4>
                                <p className="text-slate-600 dark:text-slate-300">contact@finsightxai.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                                <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Phone</h4>
                                <p className="text-slate-600 dark:text-slate-300">+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Address</h4>
                                <p className="text-slate-600 dark:text-slate-300">
                                    123 Innovation Drive<br />
                                    San Francisco, CA 94105
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Contact Form */}
                <Card className="bg-white dark:bg-slate-900 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Send us a message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Name *
                                </label>
                                <Input
                                    required
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email *
                                </label>
                                <Input
                                    required
                                    type="email"
                                    placeholder="your.email@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Company
                                </label>
                                <Input
                                    placeholder="Your company name"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Message *
                                </label>
                                <Textarea
                                    required
                                    placeholder="Tell us about your needs..."
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                                <Send className="h-5 w-5 mr-2" />
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
