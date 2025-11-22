"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  TrendingUp,
  Users,
  FileText,
  Zap,
  Crown,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface UsageData {
  documentsUsed: number;
  documentsLimit: number;
  documentsPercentage: number;
  teamSize: number;
  teamLimit: number;
  teamPercentage: number;
  apiCalls: number;
  plan: string;
  status: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get organization
      const orgResponse = await fetch('/api/organizations');
      const orgData = await orgResponse.json();

      if (orgData.success && orgData.organizations.length > 0) {
        const org = orgData.organizations[0];
        setOrganization(org);

        // Get usage data
        const usageResponse = await fetch(`/api/billing/usage?organizationId=${org.id}`);
        const usageData = await usageResponse.json();

        if (usageData.success) {
          setUsage(usageData.usage);
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string, interval: 'monthly' | 'annual' = 'monthly') => {
    if (!organization) return;

    try {
      setUpgrading(true);
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization.id,
          plan,
          interval,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.message || 'Stripe integration not yet configured. Add STRIPE_SECRET_KEY to enable billing.');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout');
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!organization) return;

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: organization.id }),
      });

      const data = await response.json();

      if (data.success && data.portalUrl) {
        window.open(data.portalUrl, '_blank');
      } else {
        alert(data.message || 'Stripe Customer Portal not yet configured.');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open billing portal');
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getPlanPrice = (plan: string, interval: 'monthly' | 'annual' = 'monthly') => {
    const prices: Record<string, { monthly: number; annual: number }> = {
      individual: { monthly: 0, annual: 0 },
      professional: { monthly: 29, annual: 290 },
      business: { monthly: 99, annual: 990 },
      enterprise: { monthly: 499, annual: 4990 },
    };
    return prices[plan]?.[interval] || 0;
  };

  if (loading) {
    return <div className="p-6">Loading billing information...</div>;
  }

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Organization</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an organization to manage billing
            </p>
            <Button>Create Organization</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
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
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and monitor usage
        </p>
      </div>

      {/* Current Plan */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl capitalize flex items-center gap-2">
                {organization.plan === 'enterprise' && <Crown className="h-6 w-6 text-yellow-600" />}
                {organization.plan} Plan
              </CardTitle>
              <CardDescription className="mt-2">
                {organization.status === 'active' ? (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Active subscription
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    {organization.status}
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge className={
              organization.plan === 'enterprise' ? 'bg-purple-600 text-lg px-4 py-2' :
              organization.plan === 'business' ? 'bg-blue-600 text-lg px-4 py-2' :
              organization.plan === 'professional' ? 'bg-green-600 text-lg px-4 py-2' :
              'bg-gray-600 text-lg px-4 py-2'
            }>
              {organization.plan.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                ${getPlanPrice(organization.plan, 'monthly')}<span className="text-lg text-muted-foreground">/month</span>
              </p>
              <p className="text-sm text-muted-foreground">
                or ${getPlanPrice(organization.plan, 'annual')}/year (save 17%)
              </p>
            </div>
            {organization.plan !== 'enterprise' && (
              <Button onClick={() => window.location.href = '/pricing'} size="lg">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            )}
          </div>

          {organization.stripeCustomerId && (
            <Button variant="outline" className="w-full" onClick={handleManageBilling}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Billing in Stripe
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documents Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents Usage
            </CardTitle>
            <CardDescription>Monthly document upload limit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{usage?.documentsUsed || 0}</p>
                <p className="text-sm text-muted-foreground">
                  of {usage?.documentsLimit === 999999 ? 'unlimited' : usage?.documentsLimit} documents
                </p>
              </div>
              <Badge variant={usage && usage.documentsPercentage >= 90 ? 'destructive' : 'secondary'}>
                {usage?.documentsPercentage || 0}%
              </Badge>
            </div>
            {usage && usage.documentsLimit !== 999999 && (
              <div className="space-y-2">
                <Progress
                  value={usage.documentsPercentage}
                  className="h-2"
                />
                {usage.documentsPercentage >= 90 && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    You're approaching your limit. Consider upgrading.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Size
            </CardTitle>
            <CardDescription>Number of team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{usage?.teamSize || 0}</p>
                <p className="text-sm text-muted-foreground">
                  of {usage?.teamLimit === 999999 ? 'unlimited' : usage?.teamLimit} members
                </p>
              </div>
              <Badge variant={usage && usage.teamPercentage >= 90 ? 'destructive' : 'secondary'}>
                {usage?.teamPercentage || 0}%
              </Badge>
            </div>
            {usage && usage.teamLimit !== 999999 && (
              <div className="space-y-2">
                <Progress
                  value={usage.teamPercentage}
                  className="h-2"
                />
                {usage.teamPercentage >= 90 && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    You're approaching your team limit.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Calls (for Business/Enterprise) */}
        {['business', 'enterprise'].includes(organization.plan) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Calls
              </CardTitle>
              <CardDescription>Monthly API usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{usage?.apiCalls || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    API calls this month
                  </p>
                </div>
                <Badge variant="secondary">Unlimited</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Billing Period
            </CardTitle>
            <CardDescription>Current billing cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-lg font-semibold">
                {usage?.billingPeriodStart ? new Date(usage.billingPeriodStart).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                to {usage?.billingPeriodEnd ? new Date(usage.billingPeriodEnd).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Usage resets at the end of the billing period
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Individual */}
            <div className={`p-4 border rounded-lg ${organization.plan === 'individual' ? 'border-green-600 bg-green-50 dark:bg-green-900/10' : ''}`}>
              <h4 className="font-bold text-lg mb-2">Individual</h4>
              <p className="text-2xl font-bold mb-4">Free</p>
              <ul className="text-sm space-y-2">
                <li>✓ 1 user</li>
                <li>✓ 10 documents/month</li>
                <li>✓ Email support</li>
                <li>✗ No API access</li>
              </ul>
              {organization.plan === 'individual' && (
                <Badge className="mt-4 w-full justify-center">Current Plan</Badge>
              )}
            </div>

            {/* Professional */}
            <div className={`p-4 border rounded-lg ${organization.plan === 'professional' ? 'border-green-600 bg-green-50 dark:bg-green-900/10' : ''}`}>
              <h4 className="font-bold text-lg mb-2">Professional</h4>
              <p className="text-2xl font-bold mb-4">$29<span className="text-sm text-muted-foreground">/mo</span></p>
              <ul className="text-sm space-y-2">
                <li>✓ 5 users</li>
                <li>✓ 100 documents/month</li>
                <li>✓ Priority support</li>
                <li>✓ Audit logs</li>
              </ul>
              {organization.plan === 'professional' ? (
                <Badge className="mt-4 w-full justify-center">Current Plan</Badge>
              ) : organization.plan === 'individual' ? (
                <Button
                  className="mt-4 w-full"
                  size="sm"
                  onClick={() => handleUpgrade('professional')}
                  disabled={upgrading}
                >
                  Upgrade
                </Button>
              ) : null}
            </div>

            {/* Business */}
            <div className={`p-4 border rounded-lg ${organization.plan === 'business' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : ''}`}>
              <h4 className="font-bold text-lg mb-2">Business</h4>
              <p className="text-2xl font-bold mb-4">$99<span className="text-sm text-muted-foreground">/mo</span></p>
              <ul className="text-sm space-y-2">
                <li>✓ Unlimited users</li>
                <li>✓ Unlimited documents</li>
                <li>✓ API access</li>
                <li>✓ Webhooks</li>
              </ul>
              {organization.plan === 'business' ? (
                <Badge className="mt-4 w-full justify-center">Current Plan</Badge>
              ) : ['individual', 'professional'].includes(organization.plan) ? (
                <Button
                  className="mt-4 w-full"
                  size="sm"
                  onClick={() => handleUpgrade('business')}
                  disabled={upgrading}
                >
                  Upgrade
                </Button>
              ) : null}
            </div>

            {/* Enterprise */}
            <div className={`p-4 border rounded-lg ${organization.plan === 'enterprise' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10' : ''}`}>
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Enterprise
              </h4>
              <p className="text-2xl font-bold mb-4">$499<span className="text-sm text-muted-foreground">/mo</span></p>
              <ul className="text-sm space-y-2">
                <li>✓ Everything in Business</li>
                <li>✓ SSO & SAML</li>
                <li>✓ 24/7 phone support</li>
                <li>✓ Custom SLA</li>
              </ul>
              {organization.plan === 'enterprise' ? (
                <Badge className="mt-4 w-full justify-center">Current Plan</Badge>
              ) : (
                <Button
                  className="mt-4 w-full"
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = '/contact-sales'}
                >
                  Contact Sales
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {organization.stripeCustomerId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleManageBilling}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
