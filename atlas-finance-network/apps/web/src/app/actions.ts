'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function connectUser(walletId: string) {
  let user = await db.user.findUnique({ where: { walletId } });
  if (!user) {
    user = await db.user.create({
      data: { walletId, role: 'BUSINESS' },
    });
  }
  return user;
}

export async function registerBusiness(formData: FormData) {
  const walletId = formData.get('walletId') as string;
  const name = formData.get('name') as string;
  const industry = formData.get('industry') as string;
  const country = formData.get('country') as string;
  const description = formData.get('description') as string;

  if (!walletId || !name) {
    throw new Error('Wallet ID and Name are required');
  }

  // Find or create User
  let user = await db.user.findUnique({ where: { walletId } });
  if (!user) {
    user = await db.user.create({
      data: { walletId, role: 'BUSINESS' },
    });
  }

  // Create Business
  const business = await db.business.create({
    data: {
      userId: user.id,
      name,
      industry,
      country,
      description,
      score: 60, // Starting +10 for verified business
    },
  });

  await db.reputationHistory.create({
    data: {
      businessId: business.id,
      scoreChange: 10,
      reason: 'Verified Business Registration',
    },
  });

  revalidatePath('/dashboard/business');
  return business;
}

export async function createInvoice(formData: FormData) {
  const businessId = formData.get('businessId') as string;
  const invoiceNum = formData.get('invoiceNum') as string;
  const customerName = formData.get('customerName') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const dueDate = new Date(formData.get('dueDate') as string);
  const tokenId = formData.get('tokenId') as string; // Received from client-side contract call

  const invoice = await db.invoice.create({
    data: {
      businessId,
      invoiceNum,
      customerName,
      amount,
      dueDate,
      tokenId,
      status: 'Tokenized',
    },
  });

  revalidatePath('/dashboard/business');
  revalidatePath('/marketplace');
  return invoice;
}

export async function fundInvoice(invoiceId: string, investorWalletId: string) {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.status !== 'Tokenized') {
    throw new Error('Invoice not available for funding');
  }

  // Find or create Investor User
  let investor = await db.user.findUnique({ where: { walletId: investorWalletId } });
  if (!investor) {
    investor = await db.user.create({ data: { walletId: investorWalletId, role: 'INVESTOR' } });
  }

  // Update DB
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: 'Funded' },
    });

    await tx.funding.create({
      data: {
        invoiceId,
        investorId: investorWalletId,
        amount: invoice.amount,
      },
    });

    // +5 reputation for funded invoice
    const business = await tx.business.update({
      where: { id: invoice.businessId },
      data: { score: { increment: 5 } },
    });

    await tx.reputationHistory.create({
      data: {
        businessId: business.id,
        scoreChange: 5,
        reason: 'Invoice Funded',
      },
    });
  });

  revalidatePath('/marketplace');
  revalidatePath('/dashboard/investor');
}

export async function settleInvoice(invoiceId: string) {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.status !== 'Funded') {
    throw new Error('Invoice cannot be settled');
  }

  // Update DB
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: 'Settled' },
    });

    await tx.settlement.create({
      data: {
        invoiceId,
        amount: invoice.amount,
      },
    });

    // +10 reputation for completed repayment
    const business = await tx.business.update({
      where: { id: invoice.businessId },
      data: { score: { increment: 10 } },
    });

    await tx.reputationHistory.create({
      data: {
        businessId: business.id,
        scoreChange: 10,
        reason: 'Completed Repayment',
      },
    });
  });

  revalidatePath('/dashboard/business');
  revalidatePath('/dashboard/investor');
}
