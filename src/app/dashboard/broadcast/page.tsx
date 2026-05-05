'use client';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Send, PenTool } from 'lucide-react';
import AnimatedCounter from '@/components/dashboard/AnimatedCounter';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { apiClient } from '@/lib/apiClientClient';
import { ROLE_PERMISSIONS, Role } from '@/types';

export default function BroadcastPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role as Role;
  const permissions = role ? ROLE_PERMISSIONS[role] : [];
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [rsvpUrl, setRsvpUrl] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    apiClient(`/api/broadcast/recipient-count`, {
      headers: { 'Authorization': `Bearer ${(session?.user as any)?.accessToken}` }
    })
      .then(data => setRecipientCount(data.count ?? 0))
      .catch(() => setRecipientCount(0));
  }, [session]);

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setShowConfirm(false);
    const toastId = toast.loading('Initiating broadcast...', { description: `Sending to ${recipientCount} recipients` });
    try {
      const data = await apiClient(`/api/broadcast/july-tour`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${(session?.user as any)?.accessToken}`
        },
        body: JSON.stringify({ rsvpUrl: rsvpUrl || undefined }),
      });
      
      setResult(data.results || { sent: 0, failed: 0 });
      toast.success('Broadcast initiated successfully', { 
        id: toastId,
        description: `Sent: ${data.results?.sent} | Failed: ${data.results?.failed}`
      });
    } catch (err: any) {
      setError(err.message ?? 'Broadcast failed.');
      toast.error('Broadcast failed', { 
        id: toastId,
        description: err.message ?? 'Internal server error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[#1A1A2E] mb-2">
          July National Tour — Broadcast
        </h1>
        <p className="text-gray-400">
          Send the July National Tour announcement to all opted-in users.
        </p>
      </header>

      <div className="glass-card  p-6 mb-8 transition-all hover:shadow-md">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Eligible Recipients</p>
        <div className="text-4xl font-black text-[#1A1A2E]">
          {recipientCount === null ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-200" />
          ) : (
            <AnimatedCounter value={recipientCount} />
          )}
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="rsvp-url" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          RSVP URL (optional)
        </label>
        <input
          id="rsvp-url"
          type="url"
          value={rsvpUrl}
          onChange={e => setRsvpUrl(e.target.value)}
          placeholder="https://havenly.solutions/july-tour"
          className="w-full glass-card border border-gray-100 rounded-xl px-4 py-3 text-[#1A1A2E] placeholder-gray-300 focus:outline-none focus:border-[#C0392B] transition-colors font-medium"
        />
        <p className="text-[10px] text-gray-500 mt-2">Leave blank to use the default campaign destination.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-red-600 text-sm animate-shake">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {result && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 text-emerald-600 text-sm animate-fade-in">
          <CheckCircle2 size={18} />
          <span>
            Broadcast complete — Sent: <span className="font-bold tabular-nums"><AnimatedCounter value={result.sent} /></span> · Failed: <span className="font-bold tabular-nums"><AnimatedCounter value={result.failed} /></span>
          </span>
        </div>
      )}

      {/* New Story Editor Section */}
      {permissions.includes('broadcast:write') || permissions.includes('*') ? (
        <div className="mb-10 bg-white border border-[#DADCE0] rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A2E]">Content & Stories</h3>
            <p className="text-sm text-gray-500">Draft and publish narrative updates for the tour.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/broadcast/story-editor/new')}
            className="flex items-center gap-2 bg-[#F8F9FA] text-[#1A1A2E] px-5 py-2.5 rounded-full font-bold border border-[#DADCE0] hover:bg-white transition-all shadow-sm"
          >
            <PenTool size={18} />
            Create Story
          </button>
        </div>
      ) : null}

      {!showConfirm ? (
        (permissions.includes('broadcast:write') || permissions.includes('*')) && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading || recipientCount === 0}
            className="w-full bg-[#C0392B] hover:bg-[#a93226] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.98]"
          >
            Prepare Broadcast <Send size={18} />
          </button>
        )
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-600 font-bold text-lg mb-1">Final Confirmation</p>
              <p className="text-amber-700/80 text-sm leading-relaxed">
                You are about to send an email to <strong>{recipientCount?.toLocaleString()}</strong> users. This operation is irreversible and will consume API credits.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LoadingButton
              onClick={handleSend}
              loading={loading}
              className="bg-[#0B6E4F] hover:bg-[#08523b] text-white font-bold py-3"
            >
              Yes, Send Now
            </LoadingButton>
            <button
              onClick={() => setShowConfirm(false)}
              className="glass-card border border-gray-100 text-gray-500 hover:bg-gray-50 font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
