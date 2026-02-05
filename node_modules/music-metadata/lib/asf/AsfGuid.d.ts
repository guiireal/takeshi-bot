/**
 * Ref:
 * - https://tools.ietf.org/html/draft-fleischman-asf-01, Appendix A: ASF GUIDs
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/10_asf_guids.html
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/index.html
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/10_asf_guids.html
 *
 * ASF File Structure:
 * - https://msdn.microsoft.com/en-us/library/windows/desktop/ee663575(v=vs.85).aspx
 *
 * ASF GUIDs:
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/10_asf_guids.html
 * - https://github.com/dji-sdk/FFmpeg/blob/master/libavformat/asf.c
 */
export default class AsfGuid {
    static HeaderObject: AsfGuid;
    static DataObject: AsfGuid;
    static SimpleIndexObject: AsfGuid;
    static IndexObject: AsfGuid;
    static MediaObjectIndexObject: AsfGuid;
    static TimecodeIndexObject: AsfGuid;
    static FilePropertiesObject: AsfGuid;
    static StreamPropertiesObject: AsfGuid;
    static HeaderExtensionObject: AsfGuid;
    static CodecListObject: AsfGuid;
    static ScriptCommandObject: AsfGuid;
    static MarkerObject: AsfGuid;
    static BitrateMutualExclusionObject: AsfGuid;
    static ErrorCorrectionObject: AsfGuid;
    static ContentDescriptionObject: AsfGuid;
    static ExtendedContentDescriptionObject: AsfGuid;
    static ContentBrandingObject: AsfGuid;
    static StreamBitratePropertiesObject: AsfGuid;
    static ContentEncryptionObject: AsfGuid;
    static ExtendedContentEncryptionObject: AsfGuid;
    static DigitalSignatureObject: AsfGuid;
    static PaddingObject: AsfGuid;
    static ExtendedStreamPropertiesObject: AsfGuid;
    static AdvancedMutualExclusionObject: AsfGuid;
    static GroupMutualExclusionObject: AsfGuid;
    static StreamPrioritizationObject: AsfGuid;
    static BandwidthSharingObject: AsfGuid;
    static LanguageListObject: AsfGuid;
    static MetadataObject: AsfGuid;
    static MetadataLibraryObject: AsfGuid;
    static IndexParametersObject: AsfGuid;
    static MediaObjectIndexParametersObject: AsfGuid;
    static TimecodeIndexParametersObject: AsfGuid;
    static CompatibilityObject: AsfGuid;
    static AdvancedContentEncryptionObject: AsfGuid;
    static AudioMedia: AsfGuid;
    static VideoMedia: AsfGuid;
    static CommandMedia: AsfGuid;
    static JFIF_Media: AsfGuid;
    static Degradable_JPEG_Media: AsfGuid;
    static FileTransferMedia: AsfGuid;
    static BinaryMedia: AsfGuid;
    static ASF_Index_Placeholder_Object: AsfGuid;
    static fromBin(bin: Uint8Array, offset?: number): AsfGuid;
    /**
     * Decode GUID in format like "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
     * @param objectId Binary GUID
     * @param offset Read offset in bytes, default 0
     * @returns GUID as dashed hexadecimal representation
     */
    static decode(objectId: Uint8Array, offset?: number): string;
    /**
     * Decode stream type
     * @param mediaType Media type GUID
     * @returns Media type
     */
    static decodeMediaType(mediaType: AsfGuid): 'audio' | 'video' | 'command' | 'degradable-jpeg' | 'file-transfer' | 'binary' | undefined;
    /**
     * Encode GUID
     * @param guid GUID like: "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
     * @returns Encoded Binary GUID
     */
    static encode(guid: string): Uint8Array;
    str: string;
    constructor(str: string);
    equals(guid: AsfGuid): boolean;
    toBin(): Uint8Array;
}
