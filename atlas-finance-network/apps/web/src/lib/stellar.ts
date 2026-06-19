import { 
  StellarWalletsKit, 
  WalletNetwork, 
  FREIGHTER_ID, 
  FreighterModule 
} from '@creit.tech/stellar-wallets-kit';
import { 
  rpc, 
  Contract, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE, 
  Address, 
  xdr, 
  ScInt 
} from '@stellar/stellar-sdk';

const CONTRACT_ID = "CAAJI6YPEPBWILAIIWSPM2RFC2IMN4KZ4YHRZWQQJSRZWLTB4TYHZOX7";
const RPC_URL = "https://soroban-testnet.stellar.org";

let _kit: StellarWalletsKit | null = null;

export function getKit(): StellarWalletsKit {
  if (typeof window === 'undefined') {
    throw new Error('Stellar Wallets Kit can only be initialized in the browser');
  }
  if (!_kit) {
    _kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [
        new FreighterModule()
      ]
    });
  }
  return _kit;
}

export const server = new rpc.Server(RPC_URL);
export const contract = new Contract(CONTRACT_ID);

export async function getConnectedPublicKey(): Promise<string> {
  const { address } = await getKit().getAddress();
  return address;
}

export async function createInvoiceOnChain(
  invoiceId: string, 
  ownerAddress: string, 
  amount: number
): Promise<string> {
  const account = await server.getAccount(ownerAddress);
  
  const args = [
    xdr.ScVal.scvString(invoiceId),
    new Address(ownerAddress).toScVal(),
    new ScInt(Math.round(amount), { type: 'u64' }).toScVal()
  ];
  
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("create_invoice", ...args))
    .setTimeout(300)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  
  const { signedTxXdr } = await getKit().signTransaction(preparedTx.toXDR(), {
    networkPassphrase: Networks.TESTNET,
    address: ownerAddress
  });
  
  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
  const sendResult = await server.sendTransaction(signedTx);
  
  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResult.errorResult)}`);
  }
  
  return pollTxResult(sendResult.hash);
}

export async function fundInvoiceOnChain(
  invoiceId: string, 
  funderAddress: string
): Promise<string> {
  const account = await server.getAccount(funderAddress);
  
  const args = [
    xdr.ScVal.scvString(invoiceId),
    new Address(funderAddress).toScVal()
  ];
  
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("fund_invoice", ...args))
    .setTimeout(300)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  
  const { signedTxXdr } = await getKit().signTransaction(preparedTx.toXDR(), {
    networkPassphrase: Networks.TESTNET,
    address: funderAddress
  });
  
  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
  const sendResult = await server.sendTransaction(signedTx);
  
  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResult.errorResult)}`);
  }
  
  return pollTxResult(sendResult.hash);
}

export async function settleInvoiceOnChain(
  invoiceId: string,
  ownerAddress: string
): Promise<string> {
  const account = await server.getAccount(ownerAddress);
  
  const args = [
    xdr.ScVal.scvString(invoiceId)
  ];
  
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("settle_invoice", ...args))
    .setTimeout(300)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  
  const { signedTxXdr } = await getKit().signTransaction(preparedTx.toXDR(), {
    networkPassphrase: Networks.TESTNET,
    address: ownerAddress
  });
  
  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
  const sendResult = await server.sendTransaction(signedTx);
  
  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResult.errorResult)}`);
  }
  
  return pollTxResult(sendResult.hash);
}

async function pollTxResult(hash: string): Promise<string> {
  let getTxResult = await server.getTransaction(hash);
  while (getTxResult.status === "NOT_FOUND") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    getTxResult = await server.getTransaction(hash);
  }
  
  if (getTxResult.status !== "SUCCESS") {
    throw new Error(`Transaction failed with status: ${getTxResult.status}`);
  }
  
  return hash;
}
