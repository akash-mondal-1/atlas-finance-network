#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InvoiceStatus {
    Draft,
    Tokenized,
    Funded,
    Settled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Invoice {
    pub id: String,
    pub owner: Address,
    pub amount: u64,
    pub status: InvoiceStatus,
    pub funder: Option<Address>,
}

pub const INVOICE_KEY_PREFIX: Symbol = symbol_short!("Inv");

#[contract]
pub struct InvoiceContract;

#[contractimpl]
impl InvoiceContract {
    pub fn create_invoice(env: Env, id: String, owner: Address, amount: u64) {
        owner.require_auth();
        let key = (INVOICE_KEY_PREFIX, id.clone());
        if env.storage().persistent().has(&key) {
            panic!("Invoice already exists");
        }

        let invoice = Invoice {
            id: id.clone(),
            owner: owner.clone(),
            amount,
            status: InvoiceStatus::Tokenized,
            funder: None,
        };

        env.storage().persistent().set(&key, &invoice);
    }

    pub fn fund_invoice(env: Env, id: String, funder: Address) {
        funder.require_auth();
        let key = (INVOICE_KEY_PREFIX, id.clone());
        let mut invoice: Invoice = env.storage().persistent().get(&key).expect("Invoice not found");
        
        if invoice.status != InvoiceStatus::Tokenized {
            panic!("Invoice not in tokenized state");
        }

        invoice.status = InvoiceStatus::Funded;
        invoice.funder = Some(funder.clone());
        
        env.storage().persistent().set(&key, &invoice);
    }

    pub fn settle_invoice(env: Env, id: String) {
        let key = (INVOICE_KEY_PREFIX, id.clone());
        let mut invoice: Invoice = env.storage().persistent().get(&key).expect("Invoice not found");
        
        invoice.owner.require_auth();
        
        if invoice.status != InvoiceStatus::Funded {
            panic!("Invoice not in funded state");
        }

        invoice.status = InvoiceStatus::Settled;
        
        env.storage().persistent().set(&key, &invoice);
    }

    pub fn get_invoice(env: Env, id: String) -> Invoice {
        let key = (INVOICE_KEY_PREFIX, id);
        env.storage().persistent().get(&key).expect("Invoice not found")
    }
}

mod test;
