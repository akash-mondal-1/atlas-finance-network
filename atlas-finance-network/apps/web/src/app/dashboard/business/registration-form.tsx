'use client';

import { registerBusiness } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BusinessRegistrationForm({ walletId }: { walletId: string }) {
  return (
    <form action={async (formData) => { await registerBusiness(formData); }} className="space-y-4">
      <input type="hidden" name="walletId" value={walletId} />
      <div className="space-y-2">
        <Label htmlFor="name">Business Name</Label>
        <Input id="name" name="name" required placeholder="Acme Corp" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input id="industry" name="industry" required placeholder="Technology" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" required placeholder="United States" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="Software solutions" />
      </div>
      <Button type="submit" className="w-full">Register</Button>
    </form>
  );
}
