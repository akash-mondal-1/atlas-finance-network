import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessRegistrationForm } from './registration-form';
import { InvoiceCreationForm } from './invoice-form';
import { SettleButton } from './settle-button';
import { Invoice, ReputationHistory } from '@prisma/client';

export default async function BusinessDashboard() {
  const cookieStore = await cookies();
  const walletId = cookieStore.get('walletId')?.value;

  if (!walletId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { walletId },
    include: {
      business: {
        include: {
          invoices: true,
          reputationHistory: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
      }
    }
  });

  const business = user?.business;

  if (!business) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Register Your Business</CardTitle>
            <CardDescription>You need to register your business before accessing the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessRegistrationForm walletId={walletId} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeInvoices = (business.invoices as Invoice[]).filter((i: Invoice) => i.status === 'Tokenized' || i.status === 'Draft');
  const fundedInvoices = (business.invoices as Invoice[]).filter((i: Invoice) => i.status === 'Funded');
  const settledInvoices = (business.invoices as Invoice[]).filter((i: Invoice) => i.status === 'Settled');
  
  const totalFundingReceived = fundedInvoices.reduce((acc: number, inv: Invoice) => acc + inv.amount, 0) + 
                               settledInvoices.reduce((acc: number, inv: Invoice) => acc + inv.amount, 0);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{business.name}</h1>
          <p className="text-muted-foreground">{business.industry} | {business.country}</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">Wallet: {walletId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Reputation Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{business.score}/100</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Funding Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFundingReceived.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Settled Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settledInvoices.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {business.invoices.length === 0 ? (
                <p className="text-muted-foreground">No invoices yet.</p>
              ) : (
                <div className="space-y-4">
                  {(business.invoices as Invoice[]).map((invoice: Invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{invoice.customerName} <span className="text-muted-foreground font-normal">#{invoice.invoiceNum}</span></p>
                        <p className="text-sm text-muted-foreground">Due: {invoice.dueDate.toLocaleDateString()}</p>
                        {invoice.tokenId && (
                          <p className="text-xs font-mono text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded inline-block">
                            Token ID: {invoice.tokenId}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-x-4 flex items-center">
                        <span className="font-bold">${invoice.amount.toLocaleString()}</span>
                        <Badge variant={invoice.status === 'Funded' ? 'default' : invoice.status === 'Settled' ? 'secondary' : 'outline'}>
                          {invoice.status}
                        </Badge>
                        {invoice.status === 'Funded' && (
                          <SettleButton invoiceId={invoice.id} tokenId={invoice.tokenId || ''} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Invoice</CardTitle>
              <CardDescription>Tokenize a new receivable</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceCreationForm businessId={business.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reputation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(business.reputationHistory as ReputationHistory[]).map((entry: ReputationHistory) => (
                  <div key={entry.id} className="flex justify-between text-sm">
                    <span>{entry.reason}</span>
                    <span className={entry.scoreChange >= 0 ? "text-green-500" : "text-red-500"}>
                      {entry.scoreChange >= 0 ? '+' : ''}{entry.scoreChange}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
