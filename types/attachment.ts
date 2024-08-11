import { Attachment as SDKAttachment } from '@ai-sdk/ui-utils'

/**
 * An attachment that can be sent along with a message.
 */
export interface Attachment extends Partial<SDKAttachment> {
    /**
     * The name of the attachment, usually the file name.
     */
    name?: string;

    /**
     * A string indicating the [media type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type).
     * By default, it's extracted from the pathname's extension.
     */
    contentType?: string;

    /**
     * The URL of the attachment. It can either be a URL to a hosted file or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs).
     */
    url: string;
}
