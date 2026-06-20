import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.reputationHistory.deleteMany({});
  await prisma.settlement.deleteMany({});
  await prisma.funding.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating users and businesses...');
  // Create 3 Businesses and their Users
  const b1User = await prisma.user.create({
    data: { walletId: 'GBUSINESS111111111111111111111111111111111111111111111', role: 'BUSINESS' }
  });
  const business1 = await prisma.business.create({
    data: {
      userId: b1User.id,
      name: 'Alpha Tech Solutions',
      industry: 'Technology',
      country: 'United States',
      description: 'Custom software development and cloud consulting',
      score: 85
    }
  });

  const b2User = await prisma.user.create({
    data: { walletId: 'GBUSINESS222222222222222222222222222222222222222222222', role: 'BUSINESS' }
  });
  const business2 = await prisma.business.create({
    data: {
      userId: b2User.id,
      name: 'Green Logistics Inc',
      industry: 'Logistics',
      country: 'Germany',
      description: 'Eco-friendly freight forwarding and delivery',
      score: 70
    }
  });

  const b3User = await prisma.user.create({
    data: { walletId: 'GBUSINESS333333333333333333333333333333333333333333333', role: 'BUSINESS' }
  });
  const business3 = await prisma.business.create({
    data: {
      userId: b3User.id,
      name: 'Oceanic Food Distributors',
      industry: 'Agriculture & Food',
      country: 'Japan',
      description: 'Premium seafood importing and distribution',
      score: 95
    }
  });

  // Create Investor Users
  const investor1Wallet = 'GINVESTOR11111111111111111111111111111111111111111111';
  const investor2Wallet = 'GINVESTOR22222222222222222222222222222222222222222222';
  
  await prisma.user.createMany({
    data: [
      { walletId: investor1Wallet, role: 'INVESTOR' },
      { walletId: investor2Wallet, role: 'INVESTOR' }
    ]
  });

  console.log('Creating invoices and funding history...');

  // Business 1 Invoices (4 invoices: 1 Draft, 1 Tokenized, 1 Funded, 1 Settled)
  // Invoice 1: Draft
  await prisma.invoice.create({
    data: {
      businessId: business1.id,
      invoiceNum: 'INV-2026-001',
      customerName: 'Global Micro Corp',
      amount: 15000.00,
      dueDate: new Date('2026-08-15'),
      status: 'Draft'
    }
  });

  // Invoice 2: Tokenized
  await prisma.invoice.create({
    data: {
      businessId: business1.id,
      invoiceNum: 'INV-2026-002',
      customerName: 'HyperRetail Ltd',
      amount: 22000.00,
      dueDate: new Date('2026-09-01'),
      status: 'Tokenized',
      tokenId: 'TOKEN-alphatech002'
    }
  });

  // Invoice 3: Funded
  const inv3 = await prisma.invoice.create({
    data: {
      businessId: business1.id,
      invoiceNum: 'INV-2026-003',
      customerName: 'Apex Enterprises',
      amount: 45000.00,
      dueDate: new Date('2026-07-30'),
      status: 'Funded',
      tokenId: 'TOKEN-alphatech003'
    }
  });
  await prisma.funding.create({
    data: {
      invoiceId: inv3.id,
      investorId: investor1Wallet,
      amount: 45000.00
    }
  });

  // Invoice 4: Settled
  const inv4 = await prisma.invoice.create({
    data: {
      businessId: business1.id,
      invoiceNum: 'INV-2026-004',
      customerName: 'Sigma Industries',
      amount: 30000.00,
      dueDate: new Date('2026-06-10'),
      status: 'Settled',
      tokenId: 'TOKEN-alphatech004'
    }
  });
  await prisma.funding.create({
    data: {
      invoiceId: inv4.id,
      investorId: investor2Wallet,
      amount: 30000.00
    }
  });
  await prisma.settlement.create({
    data: {
      invoiceId: inv4.id,
      amount: 30000.00
    }
  });

  // Business 2 Invoices (3 invoices: 1 Tokenized, 2 Funded)
  // Invoice 5: Tokenized
  await prisma.invoice.create({
    data: {
      businessId: business2.id,
      invoiceNum: 'INV-GL-101',
      customerName: 'Deutsche Trade AG',
      amount: 8500.00,
      dueDate: new Date('2026-08-10'),
      status: 'Tokenized',
      tokenId: 'TOKEN-greenlog101'
    }
  });

  // Invoice 6: Funded
  const inv6 = await prisma.invoice.create({
    data: {
      businessId: business2.id,
      invoiceNum: 'INV-GL-102',
      customerName: 'Euro Logistics Group',
      amount: 14000.00,
      dueDate: new Date('2026-07-15'),
      status: 'Funded',
      tokenId: 'TOKEN-greenlog102'
    }
  });
  await prisma.funding.create({
    data: {
      invoiceId: inv6.id,
      investorId: investor1Wallet,
      amount: 14000.00
    }
  });

  // Invoice 7: Funded
  const inv7 = await prisma.invoice.create({
    data: {
      businessId: business2.id,
      invoiceNum: 'INV-GL-103',
      customerName: 'Berlin Freight Alliance',
      amount: 25000.00,
      dueDate: new Date('2026-07-25'),
      status: 'Funded',
      tokenId: 'TOKEN-greenlog103'
    }
  });
  await prisma.funding.create({
    data: {
      invoiceId: inv7.id,
      investorId: investor2Wallet,
      amount: 25000.00
    }
  });

  // Business 3 Invoices (3 invoices: 1 Tokenized, 2 Settled)
  // Invoice 8: Tokenized
  await prisma.invoice.create({
    data: {
      businessId: business3.id,
      invoiceNum: 'INV-OFD-9001',
      customerName: 'Kyoto Markets',
      amount: 60000.00,
      dueDate: new Date('2026-08-30'),
      status: 'Tokenized',
      tokenId: 'TOKEN-oceanic9001'
    }
  });

  // Invoice 9: Settled
  const inv9 = await prisma.invoice.create({
    data: {
      businessId: business3.id,
      invoiceNum: 'INV-OFD-9002',
      customerName: 'Tokyo Supply Co',
      amount: 18000.00,
      dueDate: new Date('2026-05-20'),
      status: 'Settled',
      tokenId: 'TOKEN-oceanic9002'
    }
  });
  await prisma.funding.create({
    data: {
      invoiceId: inv9.id,
      investorId: investor1Wallet,
      amount: 18000.00
    }
  });
  await prisma.settlement.create({
    data: {
      invoiceId: inv9.id,
      amount: 18000.00
    }
  });

  // Invoice 10: Settled
  const inv10 = await prisma.invoice.create({
    data: {
      businessId: business3.id,
      invoiceNum: 'INV-OFD-9003',
      customerName: 'Osaka Foods LLC',
      amount: 32000.00,
      dueDate: new Date('2026-06-05'),
      status: 'Settled',
      tokenId: 'TOKEN-oceanic9003'
    }
  });
  await prisma.funding.create({
    data: {
      invoiceId: inv10.id,
      investorId: investor2Wallet,
      amount: 32000.00
    }
  });
  await prisma.settlement.create({
    data: {
      invoiceId: inv10.id,
      amount: 32000.00
    }
  });

  // Reputation history entries
  console.log('Creating reputation history entries...');
  await prisma.reputationHistory.createMany({
    data: [
      { businessId: business1.id, scoreChange: 10, reason: 'Verified Business Registration' },
      { businessId: business1.id, scoreChange: 15, reason: 'High initial assessment' },
      { businessId: business1.id, scoreChange: 10, reason: 'Completed Repayment (INV-2026-004)' },
      
      { businessId: business2.id, scoreChange: 10, reason: 'Verified Business Registration' },
      { businessId: business2.id, scoreChange: 10, reason: 'Invoice Funded (INV-GL-102)' },
      
      { businessId: business3.id, scoreChange: 10, reason: 'Verified Business Registration' },
      { businessId: business3.id, scoreChange: 25, reason: 'Excellent credit background check' },
      { businessId: business3.id, scoreChange: 10, reason: 'Completed Repayment (INV-OFD-9002)' },
      { businessId: business3.id, scoreChange: 10, reason: 'Completed Repayment (INV-OFD-9003)' }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  });
