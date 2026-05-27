import mongoose from "mongoose";
import { Transaction } from "../models/transaction.model.js";
import { Ledger } from "../models/ledger.model.js";
import { Account } from "../models/account.model.js";

export const createTransaction = async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  // Verify the fromAccount belongs to the authenticated user
  const fromUserAccount = await Account.findOne({ _id: fromAccount, user: req.user._id });
  if (!fromUserAccount) {
    return res.status(403).json({
      message: "Forbidden: fromAccount does not belong to you",
    });
  }

  const toUserAccount = await Account.findOne({ _id: toAccount });
  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const isTransactionAlreadyExists = await Transaction.findOne({
    idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "Completed") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "Pending") {
      return res.status(200).json({
        message: "Transaction is still Pending",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "Failed") {
      return res.status(200).json({
        message: "Transaction processing failed, please retry",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "Reversed") {
      return res.status(200).json({
        message: "Transaction was reversed, retry again",
        transaction: isTransactionAlreadyExists,
      });
    }
  }

  // Check account status
  if (
    fromUserAccount.status !== "Active" ||
    toUserAccount.status !== "Active"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be Active to process transaction",
    });
  }

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  let transaction;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    transaction = (
      await Transaction.create(
        [{ fromAccount, toAccount, amount, idempotencyKey, status: "Pending" }],
        { session },
      )
    )[0];

    await Ledger.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "Debit",
        },
      ],
      { session },
    );

    await new Promise((resolve) => setTimeout(resolve, 15 * 1000));

    await Ledger.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "Credit",
        },
      ],
      { session },
    );

    await Transaction.findOneAndUpdate(
      { _id: transaction._id },
      { status: "Completed" },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    const completedTransaction = await Transaction.findById(transaction._id);

    return res.status(200).json({
      message: "Transaction completed successfully",
      transaction: completedTransaction,
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (transaction) {
      await Transaction.findOneAndUpdate(
        { _id: transaction._id },
        { status: "Failed" },
      );
    }

    console.log(error);
    
    return res.status(400).json({
      message:
        "Transaction failed due to some issue, please retry after sometime",
      success: false,
    });
  }
};

export const createInitialFundsTransaction = async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  const toUserAccount = await Account.findOne({ _id: toAccount });
  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  // Check idempotency
  const isTransactionAlreadyExists = await Transaction.findOne({ idempotencyKey });
  if (isTransactionAlreadyExists) {
    return res.status(200).json({
      message: "Transaction already processed",
      transaction: isTransactionAlreadyExists,
    });
  }

  let transaction;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // fromAccount is the system user's account (or same as toAccount for initial deposit)
    transaction = (
      await Transaction.create(
        [{ fromAccount: toAccount, toAccount, amount, idempotencyKey, status: "Pending" }],
        { session }
      )
    )[0];

    // Only create a Credit entry — this is a bank-originated deposit, no debit needed
    await Ledger.create(
      [{ account: toAccount, amount, transaction: transaction._id, type: "Credit" }],
      { session }
    );

    await Transaction.findOneAndUpdate(
      { _id: transaction._id },
      { status: "Completed" },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Initial funds added successfully",
      transaction,
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (transaction) {
      await Transaction.findOneAndUpdate(
        { _id: transaction._id },
        { status: "Failed" }
      );
    }

    console.log(error);
    return res.status(500).json({
      message: "Initial funds transaction failed, please retry",
      success: false,
    });
  }
};
