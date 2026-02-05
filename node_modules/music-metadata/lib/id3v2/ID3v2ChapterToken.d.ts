import type { IGetToken } from 'strtok3';
export interface IChapterInfo {
    startTime: number;
    endTime: number;
    startOffset?: number;
    endOffset?: number;
}
/**
 * Data portion of `CHAP` sub frame
 */
export declare const ChapterInfo: IGetToken<IChapterInfo>;
