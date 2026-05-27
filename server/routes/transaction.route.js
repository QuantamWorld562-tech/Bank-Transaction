import express from "express";
import {
  createTransaction,
  createInitialFundsTransaction,
} from "../controllers/transaction.controller.js";
import {
  isAuthenticated,
  isSystemUser,
} from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/").post(isAuthenticated, createTransaction);
router.route("/initial-funds").post(isSystemUser, createInitialFundsTransaction);

export default router;
