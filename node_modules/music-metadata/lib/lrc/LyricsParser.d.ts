import { type ILyricsTag } from '../type.js';
export declare function parseLyrics(input: string): ILyricsTag;
export declare function toUnsyncedLyrics(lyrics: string): ILyricsTag;
/**
 * Parse LRC (Lyrics) formatted text
 * Ref: https://en.wikipedia.org/wiki/LRC_(file_format)
 * @param lrcString
 */
export declare function parseLrc(lrcString: string): ILyricsTag;
