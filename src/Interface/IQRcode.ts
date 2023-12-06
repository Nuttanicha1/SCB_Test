import { Response, Request } from "express";
export interface IQRcode {
  qrType: string;
  ppType: string;
  ppId: string;
  amount: string;
  ref1: string;
  ref2?: string;
  ref3: string;
}
