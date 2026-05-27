import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be associated with a fromAccount"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be associated with a toAccount"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Completed", "Failed", "Reversed"],
        message: "Status can be either Pending, Completed, Failed or Reversed",
      },
      default: "Pending",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required for making a transaction"],
      min: [0, "Transaction amount can't be negative"],
    },
    idempotencyKey: {
      type: String,
      required: [true, "IdempotencyKey is required for making a transaction"],
      index: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", TransactionSchema);
