export interface IPaymentConfirmation {
  payeeProxyId: string;
  payeeProxyType: string;
  payeeAccountNumber: string;
  payerAccountNumber: string;
  payerAccountName: string;
  payerName: string;
  sendingBankCode: string;
  receivingBankCode: string;
  amount: string;
  transactionId: string;
  transactionDateandTime: string;
  billPaymentRef1: string;
  billPaymentRef2: string;
  billPaymentRef3: string;
  currencyCode: string;
  channelCode: string;
  transactionType: string;
}
