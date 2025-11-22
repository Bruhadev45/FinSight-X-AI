"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  LifeBuoy,
  Plus,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  Zap,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 1,
      subject: 'Unable to upload large PDF files',
      description: 'Getting error when trying to upload files larger than 5MB',
      priority: 'medium',
      status: 'in-progress',
      category: 'Technical Issue',
      createdAt: '2025-11-15T10:30:00Z',
      updatedAt: '2025-11-16T14:20:00Z',
    },
    {
      id: 2,
      subject: 'Question about Enterprise plan features',
      description: 'Need clarification on API rate limits for Enterprise tier',
      priority: 'low',
      status: 'open',
      category: 'Billing',
      createdAt: '2025-11-17T08:15:00Z',
      updatedAt: '2025-11-17T08:15:00Z',
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [calling, setCalling] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'Technical Issue',
    phoneNumber: '',
  });

  const createTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description || !ticketForm.phoneNumber) {
      toast.error('Please fill in all required fields including phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(ticketForm.phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setCreating(true);
    toast.info('Creating support ticket...');

    try {
      // Create ticket via API
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticketForm.subject,
          description: ticketForm.description,
          priority: ticketForm.priority,
          category: ticketForm.category,
          phoneNumber: ticketForm.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create ticket');
      }

      const newTicket: SupportTicket = data.ticket;
      setTickets([newTicket, ...tickets]);
      setShowCreateDialog(false);
      setTicketForm({
        subject: '',
        description: '',
        priority: 'medium',
        category: 'Technical Issue',
        phoneNumber: '',
      });

      toast.success('✅ Ticket created! SMS confirmation sent to your phone.');
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const initiatePhoneCall = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setCalling(true);
    toast.info('Initiating call via Twilio...');

    try {
      // Call Twilio API
      const response = await fetch('/api/support/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message: 'Support call requested from AI Financial Guardian dashboard',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Call initiated! You will receive a call shortly.');
        setPhoneNumber('');
      } else {
        throw new Error(data.error || 'Failed to initiate call');
      }
    } catch (error: any) {
      console.error('Twilio call error:', error);
      toast.error(error.message || 'Failed to initiate call. Please try again.');
    } finally {
      setCalling(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">
          Get help from our support team or create a ticket
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Chat with our team</p>
              </div>
              <Button size="sm">Start Chat</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Phone Support</h3>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Email</h3>
                <p className="text-sm text-muted-foreground">support@aifinancial.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Twilio Real-time Call Support */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Real-time Phone Support (Twilio)</CardTitle>
          </div>
          <CardDescription>
            Get instant phone support - we'll call you back within 60 seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone">Your Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll call you immediately using Twilio
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={initiatePhoneCall}
                disabled={calling}
                className="gap-2"
              >
                {calling ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Call Me Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>Track and manage your support requests</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Describe your issue and our team will get back to you shortly
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={ticketForm.category}
                      onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                        <SelectItem value="Billing">Billing</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Account">Account</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={ticketForm.priority}
                      onValueChange={(value: any) => setTicketForm({ ...ticketForm, priority: value })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of the issue"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about your issue..."
                      rows={6}
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number * (for SMS confirmation)</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={ticketForm.phoneNumber}
                      onChange={(e) => setTicketForm({ ...ticketForm, phoneNumber: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You'll receive an SMS confirmation once your ticket is created
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTicket} disabled={creating}>
                    {creating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <LifeBuoy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first support ticket to get help
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono">#{ticket.id}</TableCell>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Getting Started', articles: 12 },
              { title: 'Account & Billing', articles: 8 },
              { title: 'AI Features', articles: 15 },
              { title: 'Troubleshooting', articles: 10 },
            ].map((category, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <p className="font-semibold">{category.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.articles} articles
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
