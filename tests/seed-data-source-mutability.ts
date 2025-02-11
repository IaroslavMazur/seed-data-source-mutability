import {
  Keypair,
  Transaction,
  TransactionInstruction as TxIx,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

import { SeedDataSourceMutability } from "../target/types/seed_data_source_mutability";

describe("seed-data-source-mutability", () => {
  let context: ProgramTestContext;
  let client: BanksClient;
  let signerKeys: Keypair;
  let provider: BankrunProvider;
  let program: anchor.Program<SeedDataSourceMutability>;

  beforeEach(async () => {
    // Configure the testing environment
    context = await startAnchor("", [], []);
    client = context.banksClient;

    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    // DEV: The program must be fetched after the provider has been set, so that the data from inside a program's PDA can be accessed/used as a seed for another PDA
    program = anchor.workspace
      .SeedDataSourceMutability as anchor.Program<SeedDataSourceMutability>;

    // Initialize the sender and recipient accounts
    signerKeys = provider.wallet.payer;

    let initializeIx = await program.methods
      .initialize()
      .accounts({
        signer: signerKeys.publicKey,
      })
      .instruction();

    // Build, sign and process the transaction
    await buildSignAndProcessTxFromIx(initializeIx, signerKeys);
  });

  it("TEST 1", async () => {
    let prepareForActionIx = await program.methods
      .prepareForAction()
      .accounts({
        signer: signerKeys.publicKey,
      })
      .instruction();

    // Build, sign and process the transaction
    await buildSignAndProcessTxFromIx(prepareForActionIx, signerKeys);

    let performActionIx = await program.methods
      .performAction()
      .accounts({
        sender: signerKeys.publicKey,
      })
      .instruction();

    // Build, sign and process the transaction
    await buildSignAndProcessTxFromIx(performActionIx, signerKeys);
  });

  it("TEST 2", async () => {
    let prepareForActionIx = await program.methods
      .prepareForAction()
      .accounts({
        signer: signerKeys.publicKey,
      })
      .instruction();

    // Build, sign and process the transaction
    await buildSignAndProcessTxFromIx(prepareForActionIx, signerKeys);
  });

  // HELPER FUNCTIONS AND DATA STRUCTS

  async function buildSignAndProcessTxFromIx(ix: TxIx, signerKeys: Keypair) {
    const tx = await initializeTxWithIx(ix);

    tx.sign(signerKeys);
    const banksTxMeta = await client.processTransaction(tx);

    console.log(
      "Compute Units consumed by the Tx: {}",
      banksTxMeta.computeUnitsConsumed.toString()
    );
  }

  async function initializeTxWithIx(ix: TxIx): Promise<Transaction> {
    const res = await client.getLatestBlockhash();
    if (!res) throw new Error("Couldn't get the latest blockhash");

    let tx = new Transaction();
    tx.recentBlockhash = res[0];
    tx.add(ix);
    return tx;
  }
});
