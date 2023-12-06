import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { IPaymentConfirmation } from "./Interface/IPaymentConfirmation";
import { IQRcode } from "./Interface/IQRcode";
import { IInquiry } from "./Interface/I​Inquiry";

class SCBPaymentAdapter {
  private api_key: string;
  private api_secret: string;
  private main_url: string;
  private headers: {};

  constructor() {
    this.api_key = process.env.API_KEY || "";
    this.api_secret = process.env.API_SECRET || "";
    this.main_url = process.env.MAIN_URL || "";
    this.headers = {
      contentType: "application/json",
      acceptLanguage: "EN",
      resourceOwnerId: this.api_key,
    };
  }

  private async sendRequest(config: AxiosRequestConfig) {
    try {
      const response = await axios(config);
      return response;
    } catch (error: any) {
      console.error("Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  }

  async getAccessToken() {
    const response = await this.sendRequest({
      method: "post",
      url: `${this.main_url}/oauth/token`,
      data: {
        applicationKey: this.api_key,
        applicationSecret: this.api_secret,
      },
      headers: {
        ...this.headers,
        requestUId: uuidv4(),
      },
    });

    return response.data.data.accessToken;
  }

  async createQRCode(data: IQRcode) {
    const accessToken = await this.getAccessToken();
    const response = await this.sendRequest({
      method: "post",
      url: `${this.main_url}/payment/qrcode/create`,
      data: data,
      headers: {
        ...this.headers,
        authorization: `Bearer ${accessToken}`,
        requestUId: uuidv4(),
      },
    });
    const result = response.data.data;
    console.log("QR Code Generate successfully");
    return {
      statusCode: 200,
      data: result,
    };
  }

  async paymentConfirmation(paymentData: IPaymentConfirmation) {
    console.log("Payment notification received:", paymentData);
    return {
      statusCode: 200,
      data: {
        resCode: "00",
        resDesc: "success",
        transactionId: paymentData.transactionId,
        confirmId: paymentData.transactionId,
      },
    };
  }

  async checkTransaction(queryParameters: IInquiry) {
    const queryParams = new URLSearchParams();

    for (const [param, paramValue] of Object.entries(queryParameters)) {
      if (paramValue !== undefined && paramValue !== null) {
        if (param === "transactionDate" && paramValue instanceof Date) {
          queryParams.append(param, paramValue.toISOString()); // Adjust date formatting if needed
        } else {
          queryParams.append(param, paramValue.toString());
        }
      }
    }

    const accessToken = await this.getAccessToken();
    const apiUrl = `${
      this.main_url
    }/payment/billpayment/inquiry?${queryParams.toString()}`;

    const response = await this.sendRequest({
      method: "get",
      url: apiUrl,
      headers: {
        ...this.headers,
        authorization: `Bearer ${accessToken}`,
        requestUId: uuidv4(),
      },
    });

    const result = response.data.data;
    console.log("Transaction check successfully");
    return {
      statusCode: 200,
      data: result,
    };
  }
}

export default SCBPaymentAdapter;
