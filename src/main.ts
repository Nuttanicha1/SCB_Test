import axios from 'axios';
import qrcode from 'qrcode';
import {v4 as uuidv4} from 'uuid';
import express from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

app.use(express.json());
app.use(bodyParser.json());

app.post("/qrcode", async (req, res) => {
    const { qrType, ppType, ppId, amount, ref1, ref2, ref3 } = req.body;
    const authCode = req.query.authCode;
  
    try {
      const getToken = await axios.post(
        "https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token",
        {
          applicationKey: api_key,
          applicationSecret: api_secret,
          authCode,
        },
        {
          headers: {
            contentType: 'application/json',
            acceptLanguage: 'EN',
            requestUId: uuidv4(),
            resourceOwnerId: api_key,
          },
        }
      );
  
      const accessToken = getToken.data.data.accessToken;
  
      const qrCodeDataResponse = await axios.post(
        "https://api-sandbox.partners.scb/partners/sandbox/v1/payment/qrcode/create",
        {
          qrType,
          ppType,
          ppId,
          amount,
          ref1,
          ref2,
          ref3,
        },
        {
          headers: {
            contentType: 'application/json',
            acceptLanguage: 'EN',
            authorization: `Bearer ${accessToken}`,
            requestUId: uuidv4(),
            resourceOwnerId: api_key,
          },
        }
      );
      const qrCodeData = qrCodeDataResponse.data.data.qrImage;
    //   const qrCodeImage = await qrcode.toDataURL(qrCodeDataResponse.data.data.qrImage);
    //   console.log(qrCodeImage);
      
      res.status(200).json({
          qrCodeData,
        });
        
      console.log("QR Code Generate successful")
    } catch (error: any) {
      console.error("Error while generating QR code:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      res.status(500).send(error);
    }
});

app.post("/payment-confirmation", async (req, res) => {
    const paymentConfirmation = req.body;
    console.log("Payment notification received:", paymentConfirmation);
    res.status(200).json({
      rescode: "00",
      resDesc: "succes",
      transactionId : "xxx",
      confirmId : "xxx"
    });
});

app.get("/check-transaction", async (req, res) => {
  const authCode = req.query.authCode;

  const {billerId, reference1, reference2, transactionDate, eventCode, partnerTransactionId, amount} = req.query;

  const apiUrl =
    `https://api-sandbox.partners.scb/partners/sandbox/v1/payment/billpayment/inquiry?eventCode=${eventCode}&billerId=${billerId}&reference1=${reference1}&transactionDate=${transactionDate}` 
    + (reference2 ? `&reference2=${reference2}` : "") 
    + (partnerTransactionId ? `&partnerTransactionId=${partnerTransactionId}` : "") 
    + (amount ? `&amount=${amount}` : "");

  try {
    const accessTokenResponse = await axios.post(
      "https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token",
      {
        applicationKey: api_key,
        applicationSecret: api_secret,
        authCode,
      },
      {
        headers: {
          contentType: 'application/json',
          acceptLanguage: 'EN',
          requestUId: "1b01dff2-b3a3-4567-adde-cd9dd73c8b6d",
          resourceOwnerId: api_key,
        },
      }
    );

    const accessToken = accessTokenResponse.data.data.accessToken;

    const response = await axios.get( apiUrl, 
      {
        headers: {
          requestUID: uuidv4(),
          resourceOwnerID: "L78C4D65AB053A428AAA1BD6BEDA9D2575",
          authorization: `Bearer ${accessToken}`,
          contentType: 'application/json',
          acceptLanguage: 'EN',
        }
      }
    );

    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      res.status(500).json(error.response.data);
    }
  }
});

// app.get("/slip-verification", async (req,res) =>{
//   const { transRef, sendingBank } = req.body;
//   try {

//     const slipVerify = await axios.get(
//       `https://api-sandbox.partners.scb/partners/sandbox/v1/payment/billpayment/transactions/${transRef}`,
//       {
//         transRef,
//         sendingBank
//       },
//       {
//         headers: {
//           contentType: 'application/json',
//           acceptLanguage: 'EN',
//           requestUId: uuidv4(),
//           resourceOwnerId: api_key,
//         },
//       }
//     );
//   } catch (error: any) {
//     console.error("Error while verifying slip:", error);
//     if (error.response) {
//       console.error("Response status:", error.response.status);
//       console.error("Response data:", error.response.data);
//     }
//     res.status(500).send(error);
//   }
// });

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});