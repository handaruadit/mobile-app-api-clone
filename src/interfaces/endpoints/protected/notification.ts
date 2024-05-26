import { Types } from "mongoose";

export interface IOutputNotification {
  userId: Types.ObjectId | string;
  title?: string;
  message: string;
  read: boolean;
  level: 'info' | 'warning' | 'danger';
  createdAt: Date;
}

export interface IProtectedListNotificationOutput {
  data: IOutputNotification[];
  offset?: number;
  page?: number;
  limit: number;
  total: number;
}