"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Save, Trash2, ArrowLeft } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    billingEmail: '',
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      // Get user's organizations
      const response = await fetch('/api/organizations');
      const data = await response.json();

      if (data.success && data.organizations.length > 0) {
        const org = data.organizations[0]; // Get first org
        setOrganization(org);
        setFormData({
          name: org.name,
          billingEmail: org.billingEmail || '',
        });
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setOrganization(data.organization);
        alert('Organization updated successfully');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Organization</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an organization to get started
            </p>
            <Button>Create Organization</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization profile and settings
        </p>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Update your organization information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              value={organization.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used in URLs and API calls
            </p>
          </div>

          <div>
            <Label htmlFor="billingEmail">Billing Email</Label>
            <Input
              id="billingEmail"
              type="email"
              value={formData.billingEmail}
              onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
              placeholder="billing@company.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Invoices and billing notifications will be sent here
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription and usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg capitalize">{organization.plan} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {organization.status === 'active' ? 'Active subscription' : 'Inactive'}
              </p>
            </div>
            <Badge className={
              organization.plan === 'enterprise' ? 'bg-purple-600' :
              organization.plan === 'business' ? 'bg-blue-600' :
              organization.plan === 'professional' ? 'bg-green-600' :
              'bg-gray-600'
            }>
              {organization.plan.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">
                {organization.memberCount || 1} / {organization.maxUsers === 999999 ? '∞' : organization.maxUsers}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documents/Month</p>
              <p className="text-2xl font-bold">
                {organization.currentDocumentCount || 0} / {organization.maxDocuments === 999999 ? '∞' : organization.maxDocuments}
              </p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/pricing'}>
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 dark:border-red-900">
            <div>
              <h4 className="font-semibold">Delete Organization</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
