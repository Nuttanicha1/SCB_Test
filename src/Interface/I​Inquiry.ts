export interface IInquiry {
  billerId: "00300100" | "00300104";
  reference1: string;
  reference2?: string;
  transactionDate: String;
  eventCode: string;
  partnerTransactionId: string;
  amount?: string;
}
