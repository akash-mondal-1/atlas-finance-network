import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Funding, Invoice, Business, Settlement } from '@prisma/client';

type FundingWithInvoice = Funding & {
  invoice: Invoice & {
    business: Business;
    settlement: Settlement | null;
  };
};

export default async function InvestorDashboard() {
  const cookieStore = await cookies();
  const walletId = cookieStore.get('walletId')?.value;

  if (!walletId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
      </div>
    );
  }

  const fundings = await db.funding.findMany({
    where: { investorId: walletId },
    include: {
      invoice: {
        include: { business: true, settlement: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const activePositions = (fundings as FundingWithInvoice[]).filter((f: FundingWithInvoice) => f.invoice.status === 'Funded');
  const settledPositions = (fundings as FundingWithInvoice[]).filter((f: FundingWithInvoice) => f.invoice.status === 'Settled');

  const totalDeployed = activePositions.reduce((acc: number, f: FundingWithInvoice) => acc + f.amount, 0);
  const totalSettled = settledPositions.reduce((acc: number, f: FundingWithInvoice) => acc + (f.invoice.settlement?.amount || f.amount), 0);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investor Portfolio</h1>
          <p className="text-muted-foreground font-mono">{walletId}</p>
        </div>
        <Link href="/marketplace" className={buttonVariants({ variant: 'default' })}>Browse Marketplace</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Positions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{activePositions.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Capital Deployed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalDeployed.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Capital Returned</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalSettled.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
        </CardHeader>
        <CardContent>
          {fundings.length === 0 ? (
            <p className="text-muted-foreground">No investments yet. Fund invoices from the marketplace to start building your portfolio.</p>
          ) : (
            <div className="space-y-4">
              {(fundings as FundingWithInvoice[]).map((funding: FundingWithInvoice) => (
                <div key={funding.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{funding.invoice.business.name}</p>
                    <p className="text-sm text-muted-foreground">Invoice #{funding.invoice.invoiceNum} • Due: {funding.invoice.dueDate.toLocaleDateString()}</p>
                    {funding.invoice.tokenId && (
                      <p className="text-xs font-mono text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded inline-block">
                        Token ID: {funding.invoice.tokenId}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-x-4 flex items-center">
                    <span className="font-bold">${funding.amount.toLocaleString()}</span>
                    <Badge variant={funding.invoice.status === 'Settled' ? 'secondary' : 'default'}>
                      {funding.invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
