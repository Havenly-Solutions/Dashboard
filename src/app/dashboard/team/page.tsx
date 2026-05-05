'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/apiClientClient';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  inviter: { email: string; firstName: string; lastName: string } | null;
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function fetchTeam(): Promise<TeamMember[]> {
  const json = await apiClient('/api/team');
  return json.data;
}

async function inviteMember(body: {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}) {
  return apiClient('/api/team/invite', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── Role badge colours ───────────────────────────────────────────────────────

const ROLE_COLOURS: Record<string, string> = {
  FOUNDER:        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  CHIEF_OFFICER:  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  MANAGER:        'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  PA:             'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  NGO_PARTNER:    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  DEVELOPER:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  INVESTOR:       'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

const ALLOWED_ROLES = [
  'CHIEF_OFFICER',
  'MANAGER',
  'DEVELOPER',
  'PA',
  'NGO_PARTNER',
  'INVESTOR',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const queryClient = useQueryClient();
  const { confirm, modal } = useConfirmDelete();

  const { data: members, isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeam,
  });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'MANAGER',
  });
  const [inviteError, setInviteError] = useState('');
  const [actionError, setActionError] = useState('');

  const invite = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      setForm({ firstName: '', lastName: '', email: '', role: 'MANAGER' });
      setInviteError('');
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (err: Error) => setInviteError(err.message),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      return apiClient(`/api/team/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      setActionError('');
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (err: Error) => {
      setActionError(err.message);
      toast.error(err.message || 'Failed to remove member');
    },
  });

  const roleChange = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return apiClient(`/api/team/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      setActionError('');
      toast.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (err: Error) => {
      setActionError(err.message);
      toast.error(err.message || 'Failed to update role');
    },
  });

  if (userRole !== 'FOUNDER' && userRole !== 'CHIEF_OFFICER') {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        You do not have permission to manage the team.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Team</h1>
        <p className="mt-1 text-sm text-gray-500">
          Invite members and manage roles. New members appear instantly — no refresh needed.
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-medium text-gray-900 dark:text-white">
          Invite a team member
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="col-span-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          />
          <input
            className="col-span-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          />
          <input
            className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <select
            title="Select Role"
            className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            {ALLOWED_ROLES.map(r => (
              <option key={r} value={r}>{r.replace('_', ' ').toLowerCase()}</option>
            ))}
          </select>
        </div>

        {inviteError && (
          <p className="mt-3 text-sm text-red-500">{inviteError}</p>
        )}

        {actionError && (
          <p className="mt-3 text-sm text-red-500">{actionError}</p>
        )}

        <button
          className="mt-4 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          disabled={invite.isPending || !form.email || !form.firstName || !form.lastName}
          onClick={() => invite.mutate(form)}
        >
          {invite.isPending ? 'Sending...' : 'Send invite'}
        </button>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-gray-400">Loading team...</div>
      )}

      {error && (
        <div className="text-center text-sm text-red-500">Failed to load team members.</div>
      )}

      {members && (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Invited by</th>
                {userRole === 'FOUNDER' && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {members.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {userRole === 'FOUNDER' && m.role !== 'FOUNDER' ? (
                      <select
                        title="Change Member Role"
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        value={m.role}
                        onChange={(e) => roleChange.mutate({ id: m.id, role: e.target.value })}
                        disabled={roleChange.isPending}
                      >
                        {ALLOWED_ROLES.map(r => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLOURS[m.role] ?? 'bg-gray-100 text-gray-700'}`}>
                        {m.role.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.mustChangePassword ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Pending setup
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.lastLoginAt
                      ? new Date(m.lastLoginAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.inviter ? `${m.inviter.firstName} ${m.inviter.lastName}` : '—'}
                  </td>
                  {userRole === 'FOUNDER' && (
                    <td className="px-4 py-3">
                      {m.role !== 'FOUNDER' && (
                        <button
                          onClick={() => confirm(
                            'Remove Team Member',
                            `Are you sure you want to remove ${m.email} from the team? This action cannot be undone.`,
                            () => removeMember.mutateAsync(m.id),
                            'Remove Member'
                          )}
                          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                          disabled={removeMember.isPending}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal}
    </div>
  );
}
