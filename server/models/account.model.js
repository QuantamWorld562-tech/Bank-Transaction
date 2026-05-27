import mongoose from "mongoose";
import {Ledger} from "./ledger.model.js";

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account must be associated with user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Frozen", "Closed"],
        message: "Status may be either Active, Frozen or Closed",
      },
      default: "Active",
    },
    currency: {
      type: String,
      required: [true, "Currency is required for Creating a account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

AccountSchema.index({ user: 1, status: 1 });

AccountSchema.methods.getBalance = async function () {
  const balanceData = await Ledger.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  if (balanceData.length === 0) {
    return 0;
  }

  return balanceData[0].balance;
};

export const Account = mongoose.model("Account", AccountSchema);
