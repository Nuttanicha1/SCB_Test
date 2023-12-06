import axios from "axios";
import qrcode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import SCBPaymentAdapter from "./Adapter";
import { IQRcode } from "./Interface/IQRcode";
import { IInquiry } from "./Interface/I​Inquiry";
import { IPaymentConfirmation } from "./Interface/IPaymentConfirmation";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());

const scbPaymentAdapter = new SCBPaymentAdapter();

app.post("/qrcode", async (req, res) => {
  const data: IQRcode = req.body;
  const result = await scbPaymentAdapter.createQRCode(data);
  res.status(result.statusCode).json(result.data);
});

app.post("/payment-confirmation", async (req, res) => {
  const paymentConfirmation: IPaymentConfirmation = req.body;
  console.log("Payment notification received:", paymentConfirmation);
  const result = await scbPaymentAdapter.paymentConfirmation(
    paymentConfirmation
  );
  res.status(result.statusCode).json(result.data);
});

app.get("/check-transaction", async (req, res) => {
  const {
    billerId,
    reference1,
    reference2,
    eventCode,
    transactionDate,
    amount,
    partnerTransactionId,
  } = req.query;

  const queryParameters: IInquiry = {
    billerId: billerId as "00300100" | "00300104",
    reference1: reference1 as string,
    reference2: reference2 as string,
    transactionDate: transactionDate as string,
    eventCode: eventCode as string,
    partnerTransactionId: partnerTransactionId as string,
    amount: amount as string | undefined,
  };

  const result = await scbPaymentAdapter.checkTransaction(queryParameters);
  res.status(result.statusCode).json(result.data);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
