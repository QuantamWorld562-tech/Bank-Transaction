import express from "express";
import { CreateAccount, getAccountBalance, getUserAccountsController } from "../controllers/account.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router=express.Router();

router.route("/").post(isAuthenticated, CreateAccount);
router.route("/").get(isAuthenticated, getUserAccountsController);
router.route("/balance/:accountId").get(isAuthenticated, getAccountBalance);

export default router;