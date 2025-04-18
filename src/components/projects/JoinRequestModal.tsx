// src/components/projects/JoinRequestModal.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have this component
import { Label } from '@/components/ui/label'; // Assuming you have this component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Assuming shadcn Dialog
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSuccess: () => void; // Callback after successful request
}

export default function JoinRequestModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess,
}: JoinRequestModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user?.id || !projectId) return;

  setIsSubmitting(true);
  const toastId = toast.loading('Sending request...');

  try {
    // First check if request already exists
    const { data: existingRequest, error: checkError } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new Error('You already have a pending request for this project');
      }
      if (existingRequest.status === 'active') {
        throw new Error('You are already a member of this project');
      }
    }

    // Insert new request
    const { error } = await supabase.from('team_members').insert({
      project_id: projectId,
      user_id: user.id,
      status: 'pending',
      request_message: message || null,
      role: 'member',
      joined_at: new Date().toISOString()
    });

    if (error) throw error;

    toast.success('Request sent!', { id: toastId });
    onSuccess();
    onClose();
    setMessage('');
  } catch (error: any) {
    toast.error(error.message || 'Failed to send request', { id: toastId });
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle modal state change from Dialog component
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request to Join "{projectName}"</DialogTitle>
            <DialogDescription>
              Send a message to the project owner with your request. (Optional)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                placeholder="Explain why you'd like to join..."
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
