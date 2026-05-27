import { Account } from "../models/account.model.js";

export const CreateAccount = async (req, res) => {
  try {
    const user = req.user;
    const account = await Account.create({
      user: user._id,
    });

    return res.status(201).json({
      account,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getUserAccountsController = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    return res.status(200).json({ accounts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAccountBalance = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const balance = await account.getBalance();
    return res.status(200).json({ accountId: account._id, balance });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
