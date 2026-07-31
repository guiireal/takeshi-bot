import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baileysDir = path.join(rootDir, 'node_modules', 'baileys');
const marker = '// Alterado por: Dev Gui';

const files = {
    types: path.join(baileysDir, 'lib', 'Types', 'Message.d.ts'),
    socket: path.join(baileysDir, 'lib', 'Socket', 'messages-send.js'),
    utils: path.join(baileysDir, 'lib', 'Utils', 'messages.js')
};

const read = filePath => {
    if (!existsSync(filePath)) {
        throw new Error(`Arquivo nao encontrado: ${filePath}`);
    }

    return readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
};

const write = (filePath, contents) => {
    writeFileSync(filePath, contents.endsWith('\n') ? contents : `${contents}\n`);
};

const ensureHeader = contents => (
    contents.startsWith(marker) ? contents : `${marker}\n${contents}`
);

const insertAfter = (contents, anchor, addition, sentinel, filePath) => {
    if (contents.includes(sentinel)) {
        return contents;
    }

    if (!contents.includes(anchor)) {
        throw new Error(`Anchor nao encontrado em ${filePath}: ${anchor.slice(0, 80)}`);
    }

    return contents.replace(anchor, `${anchor}\n${addition}`);
};

const insertBefore = (contents, anchor, addition, sentinel, filePath) => {
    if (contents.includes(sentinel)) {
        return contents;
    }

    if (!contents.includes(anchor)) {
        throw new Error(`Anchor nao encontrado em ${filePath}: ${anchor.slice(0, 80)}`);
    }

    return contents.replace(anchor, `${addition}\n${anchor}`);
};

const replaceRequired = (contents, search, replacement, filePath) => {
    if (contents.includes(replacement)) {
        return contents;
    }

    if (!contents.includes(search)) {
        throw new Error(`Trecho nao encontrado em ${filePath}: ${search.slice(0, 80)}`);
    }

    return contents.replace(search, replacement);
};

const replaceAllOptional = (contents, search, replacement) => {
    if (!contents.includes(search)) {
        return contents;
    }

    return contents.split(search).join(replacement);
};

const replaceBlockIfPresent = (contents, start, end, replacement, filePath) => {
    const startIndex = contents.indexOf(start);

    if (startIndex === -1) {
        return contents;
    }

    const endIndex = contents.indexOf(end, startIndex);

    if (endIndex === -1) {
        throw new Error(`Fim do bloco nao encontrado em ${filePath}: ${start}`);
    }

    return `${contents.slice(0, startIndex)}${replacement}${contents.slice(endIndex + end.length)}`;
};

const patchTypes = () => {
    const filePath = files.types;
    let contents = ensureHeader(read(filePath));

    contents = insertAfter(
        contents,
        `type ViewOnce = {
    viewOnce?: boolean;
};`,
        `export interface Carousel {
    image?: WAMediaUpload;
    video?: WAMediaUpload;
    product?: WASendableProduct;
    title?: string;
    caption?: string;
    footer?: string;
    buttons?: proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton[];
}
type Buttonable = {
    /** add buttons to the message */
    buttons?: proto.Message.ButtonsMessage.IButton[];
    /** force old buttonsMessage format instead of native flow quick replies */
    useLegacyButtons?: boolean;
};
type Templatable = {
    /** add buttons to the message (conflicts with normal buttons) */
    templateButtons?: proto.IHydratedTemplateButton[];
    footer?: string;
};
type Interactiveable = {
    /** add buttons to the message (conflicts with normal buttons) */
    interactiveButtons?: proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton[];
    title?: string;
    subtitle?: string;
    media?: boolean;
};
type Shopable = {
    shop?: proto.Message.InteractiveMessage.ShopMessage.Surface;
    id?: string;
    title?: string;
    subtitle?: string;
    media?: boolean;
};
type Collectionable = {
    collection?: {
        bizJid?: string;
        id?: string;
        version?: number;
    };
    title?: string;
    subtitle?: string;
    media?: boolean;
};
type Cardsable = {
    cards?: Carousel[];
    title?: string;
    subtitle?: string;
};`,
        'export interface Carousel',
        filePath
    );

    contents = insertAfter(
        contents,
        `type WithDimensions = {
    width?: number;
    height?: number;
};`,
        `type Listable = {
    /** Sections of the List */
    sections?: proto.Message.ListMessage.ISection[];
    /** Title of a List Message only */
    title?: string;
    /** Text of the button on the list (required) */
    buttonText?: string;
    /** force old listMessage format instead of native flow single select */
    useLegacyList?: boolean;
};`,
        'type Listable = {',
        filePath
    );

    contents = replaceAllOptional(
        contents,
        '} & Mentionable & Contextable & WithDimensions)',
        '} & Mentionable & Contextable & Buttonable & Templatable & Interactiveable & Shopable & Collectionable & Cardsable & WithDimensions)'
    );
    contents = replaceAllOptional(
        contents,
        '} & Contextable)) & {',
        '} & Contextable & Buttonable & Templatable & Interactiveable & Shopable & Collectionable & Cardsable)) & {'
    );
    contents = replaceAllOptional(
        contents,
        '} & Mentionable & Contextable & Editable) | AnyMediaMessageContent | {',
        '} & Mentionable & Contextable & Buttonable & Templatable & Interactiveable & Shopable & Collectionable & Cardsable & Listable & Editable) | AnyMediaMessageContent | {'
    );
    contents = replaceAllOptional(
        contents,
        `} & Mentionable & Contextable & Editable) | ({
    album: AlbumMessageOptions;`,
        `} & Mentionable & Contextable & Buttonable & Templatable & Editable) | ({
    album: AlbumMessageOptions;`
    );

    write(filePath, contents);
};

const patchUtils = () => {
    const filePath = files.utils;
    let contents = ensureHeader(read(filePath));

    contents = insertAfter(
        contents,
        `const MessageTypeProto = {
    image: WAProto.Message.ImageMessage,
    video: WAProto.Message.VideoMessage,
    audio: WAProto.Message.AudioMessage,
    sticker: WAProto.Message.StickerMessage,
    document: WAProto.Message.DocumentMessage
};`,
        'const ButtonType = WAProto.Message.ButtonsMessage.HeaderType;',
        'const ButtonType = WAProto.Message.ButtonsMessage.HeaderType;',
        filePath
    );

    contents = insertAfter(
        contents,
        'const ButtonType = WAProto.Message.ButtonsMessage.HeaderType;',
        `const INTERACTIVE_HEADER_MEDIA_KEYS = [
    'documentMessage',
    'imageMessage',
    'videoMessage',
    'locationMessage',
    'productMessage'
];
const extractInteractiveHeaderMedia = (content) => {
    if (!content) {
        return undefined;
    }
    for (const key of INTERACTIVE_HEADER_MEDIA_KEYS) {
        if (content[key]) {
            return { [key]: content[key] };
        }
    }
    return undefined;
};
const buildInteractiveHeader = (message, content) => {
    const media = extractInteractiveHeaderMedia(content);
    return WAProto.Message.InteractiveMessage.Header.fromObject({
        title: message.title,
        subtitle: message.subtitle,
        hasMediaAttachment: !!media,
        ...(media || {})
    });
};
const normalizeNativeFlowButton = (button, index) => {
    if (!button) {
        return button;
    }
    if (typeof button.name === 'string') {
        let params = button.buttonParamsJson;
        if (typeof params === 'string' && params) {
            try {
                params = JSON.parse(params);
            }
            catch {
                return { name: button.name, buttonParamsJson: params };
            }
        }
        if (params && typeof params === 'object') {
            if (button.name === 'cta_url' && params.url && !params.merchant_url) {
                params = { ...params, merchant_url: params.url };
            }
            params = JSON.stringify(params);
        }
        return { name: button.name, buttonParamsJson: params || '{}' };
    }
    return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: button.buttonText?.displayText || button.displayText || button.text || \`Opcao \${index + 1}\`,
            id: button.buttonId || button.id || \`button_\${index + 1}\`
        })
    };
};`,
        'const normalizeNativeFlowButton =',
        filePath
    );

    contents = insertBefore(
        contents,
        `    if (hasOptionalProperty(message, 'viewOnce') && !!message.viewOnce) {`,
        `    if (hasOptionalProperty(message, 'buttons') && !!message.buttons) {
        if (message.useLegacyButtons) {
            const buttonsMessage = {
                buttons: message.buttons.map(button => ({
                    ...button,
                    type: WAProto.Message.ButtonsMessage.Button.Type.RESPONSE
                }))
            };
            if (hasNonNullishProperty(message, 'text')) {
                buttonsMessage.contentText = message.text;
                buttonsMessage.headerType = ButtonType.EMPTY;
            }
            else {
                if (hasOptionalProperty(message, 'caption')) {
                    buttonsMessage.contentText = message.caption;
                }
                const type = Object.keys(m)[0]?.replace('Message', '').toUpperCase();
                buttonsMessage.headerType = ButtonType[type] || ButtonType.EMPTY;
                Object.assign(buttonsMessage, m);
            }
            if (hasOptionalProperty(message, 'footer') && !!message.footer) {
                buttonsMessage.footerText = message.footer;
            }
            if (hasOptionalProperty(message, 'title') && !!message.title) {
                buttonsMessage.text = message.title;
                buttonsMessage.headerType = ButtonType.TEXT;
            }
            if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
                buttonsMessage.contextInfo = message.contextInfo;
            }
            if (hasOptionalProperty(message, 'mentions') && !!message.mentions) {
                buttonsMessage.contextInfo = {
                    ...(buttonsMessage.contextInfo || {}),
                    mentionedJid: message.mentions
                };
            }
            m = { buttonsMessage };
        }
        else {
            const nativeButtons = message.buttons.map(normalizeNativeFlowButton);
            const interactiveMessage = {
                body: WAProto.Message.InteractiveMessage.Body.fromObject({
                    text: message.text || message.caption || ''
                }),
                header: buildInteractiveHeader(message, m),
                nativeFlowMessage: WAProto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: nativeButtons
                })
            };
            if (hasOptionalProperty(message, 'footer') && !!message.footer) {
                interactiveMessage.footer = WAProto.Message.InteractiveMessage.Footer.fromObject({
                    text: message.footer
                });
            }
            if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
                interactiveMessage.contextInfo = message.contextInfo;
            }
            if (hasOptionalProperty(message, 'mentions') && !!message.mentions) {
                interactiveMessage.contextInfo = {
                    ...(interactiveMessage.contextInfo || {}),
                    mentionedJid: message.mentions
                };
            }
            m = { interactiveMessage };
            message.viewOnce ??= true;
        }
    }
    else if (hasOptionalProperty(message, 'templateButtons') && !!message.templateButtons) {
        const template = {
            hydratedButtons: message.templateButtons
        };
        if (hasNonNullishProperty(message, 'text')) {
            template.hydratedContentText = message.text;
        }
        else {
            if (hasOptionalProperty(message, 'caption')) {
                template.hydratedContentText = message.caption;
            }
            Object.assign(template, m);
        }
        if (hasOptionalProperty(message, 'footer') && !!message.footer) {
            template.hydratedFooterText = message.footer;
        }
        if (hasOptionalProperty(message, 'title') && !!message.title) {
            template.hydratedTitleText = message.title;
        }
        m = {
            templateMessage: {
                hydratedFourRowTemplate: template,
                hydratedTemplate: template
            }
        };
    }
    if (hasOptionalProperty(message, 'interactiveButtons') && !!message.interactiveButtons) {
        const interactiveMessage = {
            nativeFlowMessage: WAProto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: message.interactiveButtons.map(normalizeNativeFlowButton)
            })
        };
        if (hasNonNullishProperty(message, 'text') || hasOptionalProperty(message, 'caption')) {
            interactiveMessage.body = WAProto.Message.InteractiveMessage.Body.fromObject({
                text: message.text || message.caption
            });
            interactiveMessage.header = buildInteractiveHeader(message, m);
        }
        if (hasOptionalProperty(message, 'footer') && !!message.footer) {
            interactiveMessage.footer = WAProto.Message.InteractiveMessage.Footer.fromObject({
                text: message.footer
            });
        }
        if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
            interactiveMessage.contextInfo = message.contextInfo;
        }
        if (hasOptionalProperty(message, 'mentions') && !!message.mentions) {
            interactiveMessage.contextInfo = {
                ...(interactiveMessage.contextInfo || {}),
                mentionedJid: message.mentions
            };
        }
        m = { interactiveMessage };
        message.viewOnce ??= true;
    }
    if (hasOptionalProperty(message, 'cards') && !!message.cards) {
        const slides = await Promise.all(message.cards.map(async (slide) => {
            const { image, video, product, title, caption, footer, buttons } = slide;
            let header;
            if (product) {
                const { imageMessage } = await prepareWAMessageMedia({ image: product.productImage }, options);
                header = {
                    productMessage: WAProto.Message.ProductMessage.fromObject({
                        product: {
                            ...product,
                            productImage: imageMessage
                        },
                        ...slide
                    })
                };
            }
            else if (image) {
                header = await prepareWAMessageMedia({ image }, options);
            }
            else if (video) {
                header = await prepareWAMessageMedia({ video }, options);
            }
            const msg = {
                header: WAProto.Message.InteractiveMessage.Header.fromObject({
                    title,
                    hasMediaAttachment: true,
                    ...header
                }),
                body: WAProto.Message.InteractiveMessage.Body.fromObject({
                    text: caption
                }),
                footer: WAProto.Message.InteractiveMessage.Footer.fromObject({
                    text: footer
                }),
                nativeFlowMessage: WAProto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: (buttons || []).map(normalizeNativeFlowButton)
                })
            };
            return msg;
        }));
        const interactiveMessage = {
            carouselMessage: WAProto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: slides,
                messageVersion: 1
            })
        };
        if (hasNonNullishProperty(message, 'text')) {
            interactiveMessage.body = WAProto.Message.InteractiveMessage.Body.fromObject({
                text: message.text
            });
            interactiveMessage.header = WAProto.Message.InteractiveMessage.Header.fromObject({
                title: message.title,
                subtitle: message.subtitle,
                hasMediaAttachment: false
            });
        }
        if (hasOptionalProperty(message, 'footer') && !!message.footer) {
            interactiveMessage.footer = WAProto.Message.InteractiveMessage.Footer.fromObject({
                text: message.footer
            });
        }
        if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
            interactiveMessage.contextInfo = message.contextInfo;
        }
        if (hasOptionalProperty(message, 'mentions') && !!message.mentions) {
            interactiveMessage.contextInfo = {
                ...(interactiveMessage.contextInfo || {}),
                mentionedJid: message.mentions
            };
        }
        m = { interactiveMessage };
    }
    if (hasOptionalProperty(message, 'sections') && !!message.sections) {
        if (message.useLegacyList) {
            const listMessage = WAProto.Message.ListMessage.fromObject({
                sections: message.sections,
                buttonText: message.buttonText,
                title: message.title,
                footerText: message.footer,
                description: message.text,
                listType: WAProto.Message.ListMessage.ListType.SINGLE_SELECT
            });
            if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
                listMessage.contextInfo = message.contextInfo;
            }
            if (hasOptionalProperty(message, 'mentions') && !!message.mentions) {
                listMessage.contextInfo = {
                    ...(listMessage.contextInfo || {}),
                    mentionedJid: message.mentions
                };
            }
            m = { listMessage };
        }
        else {
            const sections = message.sections.map(section => ({
                title: section.title,
                highlight_label: section.highlight_label,
                rows: (section.rows || []).map((row, index) => ({
                    title: row.title,
                    description: row.description,
                    id: row.rowId || row.id || \`row_\${index + 1}\`
                }))
            }));
            const interactiveMessage = {
                body: WAProto.Message.InteractiveMessage.Body.fromObject({
                    text: message.text || ''
                }),
                header: WAProto.Message.InteractiveMessage.Header.fromObject({
                    title: message.title,
                    subtitle: message.subtitle,
                    hasMediaAttachment: false
                }),
                nativeFlowMessage: WAProto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: message.buttonText || message.title || 'Selecionar',
                                sections
                            })
                        }
                    ],
                    messageParamsJson: '{}',
                    messageVersion: 1
                })
            };
            if (hasOptionalProperty(message, 'footer') && !!message.footer) {
                interactiveMessage.footer = WAProto.Message.InteractiveMessage.Footer.fromObject({
                    text: message.footer
                });
            }
            if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
                interactiveMessage.contextInfo = message.contextInfo;
            }
            if (hasOptionalProperty(message, 'mentions') && !!message.mentions) {
                interactiveMessage.contextInfo = {
                    ...(interactiveMessage.contextInfo || {}),
                    mentionedJid: message.mentions
                };
            }
            m = { interactiveMessage };
            message.viewOnce ??= true;
        }
    }`,
        "hasOptionalProperty(message, 'buttons')",
        filePath
    );

    contents = replaceAllOptional(
        contents,
        `        m = { interactiveMessage };
    }
    if (hasOptionalProperty(message, 'cards')`,
        `        m = { interactiveMessage };
        message.viewOnce ??= true;
    }
    if (hasOptionalProperty(message, 'cards')`
    );

    contents = replaceAllOptional(
        contents,
        `        m = { interactiveMessage };
        message.viewOnce ??= true;
    }
    if (hasOptionalProperty(message, 'sections')`,
        `        m = { interactiveMessage };
    }
    if (hasOptionalProperty(message, 'sections')`
    );


    write(filePath, contents);
};

const patchSocket = () => {
    const filePath = files.socket;
    let contents = ensureHeader(read(filePath));

    contents = replaceAllOptional(
        contents,
        'generateParticipantHashV2, generateWAMessage, getStatusCodeForMediaRetry',
        'generateParticipantHashV2, generateWAMessage, getContentType, getStatusCodeForMediaRetry'
    );

    contents = insertAfter(
        contents,
        '    const messageRetryManager = enableRecentMessageCache ? new MessageRetryManager(logger, maxMsgRetryCount) : null;',
        `    const patchMessageRequiresBeforeSending = (msg) => {
        const hasListMessage = content => !!(content?.listMessage ||
            content?.deviceSentMessage?.message?.listMessage ||
            content?.viewOnceMessage?.message?.listMessage ||
            content?.viewOnceMessageV2?.message?.listMessage ||
            content?.viewOnceMessageV2Extension?.message?.listMessage ||
            content?.ephemeralMessage?.message?.listMessage ||
            content?.documentWithCaptionMessage?.message?.listMessage);
        if (!hasListMessage(msg)) {
            return msg;
        }
        const patchListType = content => {
            if (!content) {
                return;
            }
            if (content.listMessage) {
                content.listMessage.listType = proto.Message.ListMessage.ListType.SINGLE_SELECT;
            }
            patchListType(content.deviceSentMessage?.message);
            patchListType(content.viewOnceMessage?.message);
            patchListType(content.viewOnceMessageV2?.message);
            patchListType(content.viewOnceMessageV2Extension?.message);
            patchListType(content.ephemeralMessage?.message);
            patchListType(content.documentWithCaptionMessage?.message);
        };
        patchListType(msg);
        return msg;
    };`,
        'const patchMessageRequiresBeforeSending =',
        filePath
    );

    contents = replaceRequired(contents, 'let msgToEncrypt = patchedMessage;', 'let msgToEncrypt = patchMessageRequiresBeforeSending(patchedMessage);', filePath);
    contents = replaceRequired(contents, 'msgToEncrypt = dsmMessage;', 'msgToEncrypt = patchMessageRequiresBeforeSending(dsmMessage);', filePath);
    contents = replaceRequired(
        contents,
        `const patched = patchMessageBeforeSending ? await patchMessageBeforeSending(message, []) : message;
                const bytes = encodeNewsletterMessage(patched);`,
        `const patched = patchMessageBeforeSending ? await patchMessageBeforeSending(message, []) : message;
                const patchedMessage = patchMessageRequiresBeforeSending(patched);
                const bytes = encodeNewsletterMessage(patchedMessage);`,
        filePath
    );
    contents = replaceRequired(
        contents,
        `const bytes = encodeWAMessage(patched);
                reportingMessage = patched;`,
        `const patchedMessage = patchMessageRequiresBeforeSending(patched);
                const bytes = encodeWAMessage(patchedMessage);
                reportingMessage = patchedMessage;`,
        filePath
    );
    contents = replaceRequired(
        contents,
        `reportingMessage = Array.isArray(patchedForReporting)
                        ? patchedForReporting.find(item => item.recipientJid === jid) || patchedForReporting[0]
                        : patchedForReporting;
                }
                if (!isRetryResend) {`,
        `reportingMessage = Array.isArray(patchedForReporting)
                        ? patchedForReporting.find(item => item.recipientJid === jid) || patchedForReporting[0]
                        : patchedForReporting;
                    if (reportingMessage?.message) {
                        reportingMessage = {
                            ...reportingMessage,
                            message: patchMessageRequiresBeforeSending(reportingMessage.message)
                        };
                    }
                    else {
                        reportingMessage = patchMessageRequiresBeforeSending(reportingMessage);
                    }
                }
                if (!isRetryResend) {`,
        filePath
    );
    contents = replaceRequired(
        contents,
        'const encodedMessageToSend = isMe',
        `messageToSend = patchMessageRequiresBeforeSending(messageToSend);
                const encodedMessageToSend = isMe`,
        filePath
    );
    contents = insertBefore(
        contents,
        '            logger.debug({ msgId }, `sending message to ${participants.length} devices`);',
        `            const innerMessage = normalizeMessageContent(message) || message;
            const key = innerMessage ? getContentType(innerMessage) : null;
            if (!isNewsletter && (key === 'interactiveMessage' || key === 'buttonsMessage') && !hasNativeFlowNode(additionalNodes)) {
                const nativeFlowName = getNativeFlowName(innerMessage);
                const isSingleSelect = nativeFlowName === 'single_select';
                stanza.content.push({
                    tag: 'biz',
                    attrs: isSingleSelect
                        ? {
                            actual_actors: '2',
                            host_storage: '2',
                            privacy_mode_ts: (Math.floor(Date.now() / 1000) - 77980457).toString()
                        }
                        : {},
                    content: [
                        {
                            tag: 'interactive',
                            attrs: {
                                type: 'native_flow',
                                v: '1'
                            },
                            content: [
                                {
                                    tag: 'native_flow',
                                    attrs: isSingleSelect
                                        ? { v: '9', name: 'mixed' }
                                        : { name: nativeFlowName }
                                }
                            ]
                        },
                        ...(isSingleSelect
                            ? [
                                {
                                    tag: 'quality_control',
                                    attrs: { source_type: 'third_party' }
                                }
                            ]
                            : [])
                    ]
                });
                logger.debug({ jid, nativeFlowName }, 'adding native flow business node');
            }
            const buttonType = getButtonType(innerMessage);
            if (!isNewsletter && buttonType) {
                stanza.content.push({
                    tag: 'biz',
                    attrs: {},
                    content: [
                        {
                            tag: buttonType,
                            attrs: getButtonArgs(innerMessage)
                        }
                    ]
                });
                logger.debug({ jid }, 'adding business node');
            }`,
        'const innerMessage = normalizeMessageContent(message) || message;',
        filePath
    );
    contents = insertBefore(
        contents,
        '    const getMessageType = (message) => {',
        `    const hasNativeFlowNode = (nodeContent) => {
        if (!Array.isArray(nodeContent)) {
            return false;
        }
        return nodeContent.some(item => {
            const interactiveNode = item?.content?.[0];
            const nativeFlowNode = interactiveNode?.content?.[0];
            return item?.tag === 'biz' &&
                interactiveNode?.tag === 'interactive' &&
                interactiveNode?.attrs?.type === 'native_flow' &&
                nativeFlowNode?.tag === 'native_flow';
        });
    };
    const getNativeFlowName = (message) => {
        const interactive = message?.interactiveMessage;
        const buttons = interactive?.nativeFlowMessage?.buttons ||
            interactive?.carouselMessage?.cards?.[0]?.nativeFlowMessage?.buttons;
        return buttons?.[0]?.name || 'quick_reply';
    };
    const getButtonType = (message) => {
        if (message?.buttonsMessage) {
            return 'buttons';
        }
        if (message?.buttonsResponseMessage) {
            return 'buttons_response';
        }
        if (message?.interactiveResponseMessage) {
            return 'interactive_response';
        }
        if (message?.listMessage) {
            return 'list';
        }
        if (message?.listResponseMessage) {
            return 'list_response';
        }
    };
    const getButtonArgs = (message) => {
        if (message?.templateMessage) {
            return {};
        }
        if (message?.listMessage) {
            const type = message.listMessage.listType;
            if (!type) {
                throw new Boom('Expected list type inside message');
            }
            const listTypeName = typeof type === 'number'
                ? proto.Message.ListMessage.ListType[type]
                : type;
            return { v: '2', type: listTypeName.toLowerCase() };
        }
        return {};
    };`,
        'const hasNativeFlowNode =',
        filePath
    );

    write(filePath, contents);
};

if (!existsSync(baileysDir)) {
    throw new Error(`Baileys nao instalado em ${baileysDir}. Rode npm i antes.`);
}

patchTypes();
patchUtils();
patchSocket();

console.log('[patch-baileys] Compatibilidade Dev Gui aplicada em baileys/lib.');
