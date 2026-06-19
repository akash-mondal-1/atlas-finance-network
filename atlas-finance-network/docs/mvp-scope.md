# MVP Scope: Atlas Finance Network

This document outlines the scope of the Atlas Finance Network MVP built for the Stellar Startup Track.

## Implemented Features

1. **Business Registration & Profiles**
   - Wallet-based authentication using simulated Stellar Wallet Kit context.
   - Business profiling with industry, country, and core details stored in PostgreSQL.

2. **Reputation Engine**
   - Deterministic rule-based reputation scoring (0-100 range).
   - Base score of 50, +10 for registration, +5 per funded invoice, +10 per settled invoice.
   - Transparent, append-only history log of reputation score changes.

3. **Invoice Management & Tokenization (Soroban)**
   - Smart Contract (`invoice_contract`) built in Rust and deployed/simulated on Soroban.
   - State machine for Tokenized Receivables: `Draft` -> `Tokenized` -> `Funded` -> `Settled`.
   - Creation of tokenized invoices linking off-chain metadata (stored in DB) to on-chain state.

4. **Liquidity Marketplace**
   - Public marketplace for investors to browse tokenized invoices.
   - Invoices are listed alongside the SME's reputation score to aid in risk assessment.

5. **Financing & Settlement Workflow**
   - Investors can fund tokenized invoices, transitioning their state on-chain and in the DB.
   - Businesses can settle (repay) invoices, unlocking reputation score boosts.

6. **Dashboards**
   - Distinct, data-rich dashboards for Businesses (active invoices, total funding) and Investors (active positions, total capital returned).

## Not Implemented Features (Out of Scope for MVP)

- Automated on-chain fiat/USDC settlement (simulated for MVP).
- True IPFS uploading for PDF invoices (mocked upload form in MVP).
- Advanced risk modeling or ML-based scoring (strictly deterministic scoring used).
- Secondary trading of tokenized invoices between multiple investors.

## Future Milestones

- **Milestone 1**: Mainnet deployment of Soroban contracts and full Freighter Wallet integration for real USDC transactions.
- **Milestone 2**: IPFS integration for decentralized storage of invoice PDFs and legal agreements.
- **Milestone 3**: Integration with Stellar's automated market makers (AMM) for secondary liquidity of invoice tokens.
- **Milestone 4**: Advanced identity verification (KYB) via Stellar ecosystem partners.
