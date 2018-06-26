import Transaction from "../../src/wallet/transaction";
import TransactionItem from "../../src/wallet/transaction-item";
import Wallet from "../../src/wallet";

describe("Transaction", () => {
    let transaction: Transaction, wallet: Wallet, recipient: string, amount: number;

    beforeEach(() => {
        wallet = new Wallet();
        amount = 50;
        recipient = "r3c1p13nt";
        transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    test("outputs the amount subtracted from wallet balance", () => {
        //find the output object who's address matches the wallet's public key
        const senderOutput  = <TransactionItem> transaction.outputItems.find(output => output.address === wallet.publicKey);

        expect(senderOutput.amount).toEqual(wallet.balance - amount);
    });

    test("amount added to recipient amount", () => {
        const recipientOutput = <TransactionItem> transaction.outputItems.find(output => output.address === recipient);

        expect(recipientOutput.amount).toEqual(amount);
    });

    test("inputs the balance of the wallet", () => {
        expect(transaction.inputItem.amount).toEqual(wallet.balance);
    });

    test("verifyTransaction - valid transaction", ()=> {
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    test("verifyTransaction - valid transaction - input balance corrupted", ()=>{
        transaction.inputItem.amount = 10000;
        //input balance isn't part of signature, so won't matter if it was corrupted
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    })

    test("verifyTransaction - invalid transaction - output corrupted", ()=>{
        transaction.outputItems[0].amount = 10000;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    })

    describe("transacting with amount that exceeds balance", () => {
        test("does NOT create the transaction and throws error", ()=>{
            amount = 50000;
            expect(() => {
                Transaction.newTransaction(wallet, recipient, amount)
            }).toThrowError('exceeds');
        });
    });   
})

