import { type ID3v2MajorVersion } from './ID3v2Token.js';
import type { IWarningCollector } from '../common/MetadataCollector.js';
export interface IFrameFlags {
    status: {
        tag_alter_preservation: boolean;
        file_alter_preservation: boolean;
        read_only: boolean;
    };
    format: {
        grouping_identity: boolean;
        compression: boolean;
        encryption: boolean;
        unsynchronisation: boolean;
        data_length_indicator: boolean;
    };
}
export interface IFrameHeader {
    id: string;
    length: number;
    flags?: IFrameFlags;
}
/**
 * Frame header length (bytes) depending on ID3v2 major version.
 */
export declare function getFrameHeaderLength(majorVer: number): 6 | 10;
/**
 * Factory: parse a frame header from its header bytes (6 for v2.2, 10 for v2.3/v2.4).
 *
 * Note: It only *parses* and does light validation. It does not read payload bytes.
 */
export declare function readFrameHeader(uint8Array: Uint8Array, majorVer: ID3v2MajorVersion, warningCollector: IWarningCollector): IFrameHeader;
