import type { LIDMapping, SignalKeyStoreWithTransaction } from '../Types/index.js';
import type { ILogger } from '../Utils/logger.js';
export declare class LIDMappingStore {
    private readonly mappingCache;
    private readonly keys;
    private readonly logger;
    private pnToLIDFunc?;
    constructor(keys: SignalKeyStoreWithTransaction, logger: ILogger, pnToLIDFunc?: (jids: string[]) => Promise<LIDMapping[] | undefined>);
    /**
     * Store LID-PN mapping - USER LEVEL
     */
    storeLIDPNMappings(pairs: LIDMapping[]): Promise<void>;
    /**
     * Get LID for PN - Returns device-specific LID based on user mapping
     */
    getLIDForPN(pn: string): Promise<string | null>;
    getLIDsForPNs(pns: string[]): Promise<LIDMapping[] | null>;
    /**
     * Get PN for LID - USER LEVEL with device construction
     */
    getPNForLID(lid: string): Promise<string | null>;
}
//# sourceMappingURL=lid-mapping.d.ts.map