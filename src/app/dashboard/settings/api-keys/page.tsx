"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle2, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  key?: string;
  permissions: any;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    permissions: {
      documents: [] as string[],
      analytics: [] as string[],
      webhooks: [] as string[],
    },
  });

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

        // Only fetch API keys if on Business/Enterprise plan
        if (['business', 'enterprise'].includes(org.plan)) {
          const keysResponse = await fetch(`/api/api-keys?organizationId=${org.id}`);
          const keysData = await keysResponse.json();

          if (keysData.success) {
            setApiKeys(keysData.apiKeys || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!organization || !createForm.name) return;

    try {
      setCreating(true);
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization.id,
          name: createForm.name,
          permissions: createForm.permissions,
        }),
      });

      const data = await response.json();

      if (data.success && data.apiKey) {
        setNewKey(data.apiKey.key);
        setShowCreateDialog(false);
        setCreateForm({
          name: '',
          permissions: { documents: [], analytics: [], webhooks: [] },
        });
        fetchData();
      } else {
        alert(data.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('API key revoked successfully');
        fetchData();
      } else {
        alert(data.error || 'Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const togglePermission = (resource: string, action: string) => {
    setCreateForm(prev => {
      const permissions = { ...prev.permissions };
      const resourcePerms = permissions[resource as keyof typeof permissions] || [];

      if (resourcePerms.includes(action)) {
        permissions[resource as keyof typeof permissions] = resourcePerms.filter(p => p !== action);
      } else {
        permissions[resource as keyof typeof permissions] = [...resourcePerms, action];
      }

      return { ...prev, permissions };
    });
  };

  const getPermissionsSummary = (permissions: any) => {
    if (!permissions) return 'No permissions';

    const perms: string[] = [];
    if (permissions.documents?.length > 0) perms.push(`Documents: ${permissions.documents.join(', ')}`);
    if (permissions.analytics?.length > 0) perms.push(`Analytics: ${permissions.analytics.join(', ')}`);
    if (permissions.webhooks?.length > 0) perms.push(`Webhooks: ${permissions.webhooks.join(', ')}`);

    return perms.join(' | ') || 'No permissions';
  };

  if (loading) {
    return <div className="p-6">Loading API keys...</div>;
  }

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Organization</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an organization to manage API keys
            </p>
            <Button>Create Organization</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if plan supports API access
  if (!['business', 'enterprise'].includes(organization.plan)) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardContent className="pt-6 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-yellow-600" />
            <h3 className="text-2xl font-bold mb-2">API Access Unavailable</h3>
            <p className="text-muted-foreground mb-6">
              API keys are available on Business and Enterprise plans
            </p>
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm font-semibold mb-2">Your current plan: {organization.plan}</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to Business ($99/month) or Enterprise ($499/month) to access API features
              </p>
            </div>
            <Button onClick={() => window.location.href = '/pricing'} size="lg">
              View Plans & Upgrade
            </Button>
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Generate and manage API keys for programmatic access
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Production API Key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A descriptive name to help you identify this key
                </p>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="space-y-3 mt-2 border rounded-lg p-4">
                  {/* Documents */}
                  <div>
                    <p className="font-semibold text-sm mb-2">Documents</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="documents-read"
                          checked={createForm.permissions.documents.includes('read')}
                          onCheckedChange={() => togglePermission('documents', 'read')}
                        />
                        <label htmlFor="documents-read" className="text-sm cursor-pointer">
                          Read - List and view documents
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="documents-write"
                          checked={createForm.permissions.documents.includes('write')}
                          onCheckedChange={() => togglePermission('documents', 'write')}
                        />
                        <label htmlFor="documents-write" className="text-sm cursor-pointer">
                          Write - Upload and create documents
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="documents-delete"
                          checked={createForm.permissions.documents.includes('delete')}
                          onCheckedChange={() => togglePermission('documents', 'delete')}
                        />
                        <label htmlFor="documents-delete" className="text-sm cursor-pointer">
                          Delete - Remove documents
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="border-t pt-3">
                    <p className="font-semibold text-sm mb-2">Analytics</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="analytics-read"
                          checked={createForm.permissions.analytics.includes('read')}
                          onCheckedChange={() => togglePermission('analytics', 'read')}
                        />
                        <label htmlFor="analytics-read" className="text-sm cursor-pointer">
                          Read - View analytics and reports
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Webhooks */}
                  {organization.plan === 'enterprise' && (
                    <div className="border-t pt-3">
                      <p className="font-semibold text-sm mb-2">Webhooks</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="webhooks-read"
                            checked={createForm.permissions.webhooks.includes('read')}
                            onCheckedChange={() => togglePermission('webhooks', 'read')}
                          />
                          <label htmlFor="webhooks-read" className="text-sm cursor-pointer">
                            Read - List webhooks
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="webhooks-write"
                            checked={createForm.permissions.webhooks.includes('write')}
                            onCheckedChange={() => togglePermission('webhooks', 'write')}
                          />
                          <label htmlFor="webhooks-write" className="text-sm cursor-pointer">
                            Write - Create and update webhooks
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={creating || !createForm.name}>
                {creating ? 'Creating...' : 'Create API Key'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display */}
      {newKey && (
        <Card className="border-green-600 bg-green-50 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              API Key Created Successfully
            </CardTitle>
            <CardDescription>
              Make sure to copy your API key now. You won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Your API Key</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newKey}
                  readOnly
                  className="font-mono bg-white dark:bg-gray-950"
                />
                <Button
                  onClick={() => copyToClipboard(newKey, 'new-key')}
                  variant="outline"
                >
                  {copiedKey === 'new-key' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Important Security Notice
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Store this key securely. Anyone with this key can access your API. Never commit it to version control or share it publicly.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setNewKey(null)} variant="outline" className="w-full">
              I've Saved My Key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Active API Keys ({apiKeys.length})
          </CardTitle>
          <CardDescription>Manage your API keys and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first API key to start using the API
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {key.keyPrefix}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.keyPrefix, key.id.toString())}
                        >
                          {copiedKey === key.id.toString() ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground max-w-md truncate">
                        {getPermissionsSummary(key.permissions)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt ? (
                        <span className="text-sm">
                          {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>How to use your API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`curl https://api.yourapp.com/v1/documents \\
  -H "Authorization: Bearer fs_your_api_key_here"`}</code>
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Base URL</h4>
            <code className="bg-muted px-3 py-1 rounded text-sm">
              {process.env.NEXT_PUBLIC_APP_URL || 'https://api.yourapp.com'}/api/v1
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Rate Limits</h4>
            <p className="text-sm text-muted-foreground">
              Business: 1,000 requests/hour | Enterprise: Unlimited
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
