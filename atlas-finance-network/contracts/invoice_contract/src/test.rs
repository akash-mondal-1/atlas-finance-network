#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_invoice_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, InvoiceContract);
    let client = InvoiceContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let funder = Address::generate(&env);
    let invoice_id = String::from_str(&env, "INV-001");
    let amount: u64 = 5000;

    // 1. Create Invoice
    client.create_invoice(&invoice_id, &owner, &amount);

    let invoice = client.get_invoice(&invoice_id);
    assert_eq!(invoice.id, invoice_id);
    assert_eq!(invoice.owner, owner);
    assert_eq!(invoice.amount, amount);
    assert_eq!(invoice.status, InvoiceStatus::Tokenized);
    assert_eq!(invoice.funder, None);

    // 2. Fund Invoice
    client.fund_invoice(&invoice_id, &funder);

    let funded_invoice = client.get_invoice(&invoice_id);
    assert_eq!(funded_invoice.status, InvoiceStatus::Funded);
    assert_eq!(funded_invoice.funder, Some(funder.clone()));

    // 3. Settle Invoice
    client.settle_invoice(&invoice_id);

    let settled_invoice = client.get_invoice(&invoice_id);
    assert_eq!(settled_invoice.status, InvoiceStatus::Settled);
}

#[test]
#[should_panic(expected = "Invoice already exists")]
fn test_create_duplicate_invoice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, InvoiceContract);
    let client = InvoiceContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let invoice_id = String::from_str(&env, "INV-002");

    client.create_invoice(&invoice_id, &owner, &1000);
    client.create_invoice(&invoice_id, &owner, &1000); // Should panic
}
