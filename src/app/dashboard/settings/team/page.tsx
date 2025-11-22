"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Users, UserPlus, Mail, Crown, Shield, Eye, Trash2, Copy, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Member {
  id: number;
  userId: string;
  role: string;
  joinedAt: string;
  user?: {
    email: string;
    name?: string;
  };
}

interface Invitation {
  id: number;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function TeamManagementPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member',
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

        // Get team members
        const membersResponse = await fetch(`/api/organizations/${org.id}/members`);
        const membersData = await membersResponse.json();

        if (membersData.success) {
          setMembers(membersData.members || []);
        }

        // TODO: Get pending invitations
        // const invitesResponse = await fetch(`/api/organizations/${org.id}/invitations`);
        // const invitesData = await invitesResponse.json();
        // setInvitations(invitesData.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!organization || !inviteForm.email) return;

    // Check if at user limit
    if (members.length >= organization.maxUsers && organization.maxUsers !== 999999) {
      alert(`You've reached your plan limit of ${organization.maxUsers} team members. Please upgrade to add more.`);
      return;
    }

    try {
      setInviting(true);
      const response = await fetch(`/api/organizations/${organization.id}/members/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Invitation sent to ${inviteForm.email}! They have 7 days to accept.`);
        setInviteForm({ email: '', role: 'member' });

        // Show invitation link (for demo purposes)
        if (data.invitation && data.invitationUrl) {
          const copy = await navigator.clipboard.writeText(data.invitationUrl);
          setCopiedToken(data.invitation.token);
          setTimeout(() => setCopiedToken(null), 3000);
          alert(`Invitation link copied to clipboard:\n${data.invitationUrl}`);
        }

        fetchData(); // Refresh list
      } else {
        alert(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!organization) return;

    try {
      const response = await fetch(`/api/organizations/${organization.id}/members/invite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Role updated successfully');
        fetchData();
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organization) return;

    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const response = await fetch(
        `/api/organizations/${organization.id}/members?userId=${userId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        alert('Team member removed successfully');
        fetchData();
      } else {
        alert(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'member': return <Users className="h-4 w-4 text-green-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-600';
      case 'admin': return 'bg-blue-600';
      case 'member': return 'bg-green-600';
      case 'viewer': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return <div className="p-6">Loading team...</div>;
  }

  if (!organization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Organization</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an organization to manage your team
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
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">
          Invite team members and manage their roles
        </p>
      </div>

      {/* Team Limits */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="text-2xl font-bold">
                {members.length} / {organization.maxUsers === 999999 ? '∞' : organization.maxUsers}
              </p>
            </div>
            <div>
              <Badge className={getRoleBadgeColor(organization.plan)}>
                {organization.plan.toUpperCase()} Plan
              </Badge>
            </div>
          </div>
          {members.length >= organization.maxUsers && organization.maxUsers !== 999999 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You've reached your team limit. Upgrade to {organization.plan === 'individual' ? 'Professional' : 'Business'} to add more members.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>Send an invitation to join your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="teammate@company.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Read only access</SelectItem>
                  <SelectItem value="member">Member - Standard access</SelectItem>
                  <SelectItem value="admin">Admin - Can manage team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSendInvite} disabled={inviting || !inviteForm.email}>
            <Mail className="h-4 w-4 mr-2" />
            {inviting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({members.length})
          </CardTitle>
          <CardDescription>Manage your team and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No team members yet. Invite someone to get started!
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {member.user?.name || member.userId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.email || member.userId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        {member.role === 'owner' ? (
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {member.role.toUpperCase()}
                          </Badge>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateRole(member.userId, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>What each role can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold">Owner</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full access</li>
                <li>• Manage billing</li>
                <li>• Delete organization</li>
                <li>• Manage all members</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Admin</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manage team</li>
                <li>• Invite members</li>
                <li>• Update settings</li>
                <li>• Cannot delete org</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Member</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Standard access</li>
                <li>• Upload documents</li>
                <li>• View analytics</li>
                <li>• Create reports</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold">Viewer</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Read-only access</li>
                <li>• View documents</li>
                <li>• View analytics</li>
                <li>• Cannot edit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
