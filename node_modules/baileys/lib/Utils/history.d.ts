import { proto } from '../../WAProto/index.js';
import type { Chat, Contact, WAMessage } from '../Types/index.js';
export declare const downloadHistory: (msg: proto.Message.IHistorySyncNotification, options: RequestInit) => Promise<proto.HistorySync>;
export declare const processHistoryMessage: (item: proto.IHistorySync) => {
    chats: Chat[];
    contacts: Contact[];
    messages: WAMessage[];
    syncType: proto.HistorySync.HistorySyncType | null | undefined;
    progress: number | null | undefined;
};
export declare const downloadAndProcessHistorySyncNotification: (msg: proto.Message.IHistorySyncNotification, options: RequestInit) => Promise<{
    chats: Chat[];
    contacts: Contact[];
    messages: WAMessage[];
    syncType: proto.HistorySync.HistorySyncType | null | undefined;
    progress: number | null | undefined;
}>;
export declare const getHistoryMsg: (message: proto.IMessage) => proto.Message.IHistorySyncNotification;
//# sourceMappingURL=history.d.ts.map