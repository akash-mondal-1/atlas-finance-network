import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FundButton } from './fund-button';
import { Invoice, Business } from '@prisma/client';

type InvoiceWithBusiness = Invoice & {
  business: Business;
};

export default async function Marketplace() {
  const cookieStore = await cookies();
  const walletId = cookieStore.get('walletId')?.value;

  const tokenizedInvoices = await db.invoice.findMany({
    where: { status: 'Tokenized' },
    include: { business: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Liquidity Marketplace</h1>
        <p className="text-xl text-muted-foreground">Browse and fund tokenized SME invoices with verifiable on-chain reputation.</p>
      </div>

      {tokenizedInvoices.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-lg text-muted-foreground">No invoices currently available for funding.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(tokenizedInvoices as InvoiceWithBusiness[]).map((invoice: InvoiceWithBusiness) => (
            <Card key={invoice.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">Atlas Reputation: {invoice.business.score}/100</Badge>
                  <span className="text-sm font-mono text-muted-foreground">{invoice.tokenId?.slice(0,10)}...</span>
                </div>
                <CardTitle className="text-xl">{invoice.business.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{invoice.business.industry} • {invoice.business.country}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold">${invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{invoice.dueDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{invoice.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token ID</span>
                  <span className="font-mono text-xs text-muted-foreground">{invoice.tokenId}</span>
                </div>
              </CardContent>
              <CardFooter>
                <FundButton invoiceId={invoice.id} tokenId={invoice.tokenId || ''} walletId={walletId || ''} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
