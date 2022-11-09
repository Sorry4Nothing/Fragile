import Soup from '@gi/soup3';
import GLib from '@gi/glib2';
import Gio from '@gi/gio2';
Gio._promisify(Soup.Session.prototype, 'send_and_read_async', 'send_and_read_finish');
const session = new Soup.Session();
export class Request {
    constructor(uri, options = {}) {
        this.uri = uri;
        this.options = options;
    }
    toSoupMessage() {
        const msg = Soup.Message.new(this.options.method || 'GET', this.uri);
        if (this.options.headers) {
            for (const headerName in this.options.headers) {
                if (Object.prototype.hasOwnProperty.call(this.options.headers, headerName)) {
                    const headerValue = this.options.headers[headerName];
                    msg.requestHeaders.append(headerName, headerValue);
                }
            }
        }
        if (this.options.body) {
            const bytes = new GLib.Bytes(Uint8Array.from(this.options.body.split('').map((c) => c.charCodeAt(0)) ?? 0));
            msg.set_request_body_from_bytes((this.options.headers || {})['content-type'], bytes);
        }
        return msg;
    }
}
export class Response {
    constructor(body, options) {
        this.body = body;
        this.options = options;
    }
    text() {
        return this.body;
    }
    json() {
        return JSON.parse(this.body);
    }
    get status() {
        return this.options.status;
    }
    get statusText() {
        return this.options.statusText;
    }
    get headers() {
        return this.options.headers;
    }
    static fromSoupMessage(msg, bodyBytes) {
        const status = msg.statusCode;
        const statusText = msg.reasonPhrase;
        const soupHeaders = msg.responseHeaders;
        const headers = {};
        soupHeaders.foreach((name, value) => {
            headers[name] = value;
        });
        let body = '';
        const bodyData = bodyBytes.get_data();
        if (bodyData) {
            const decoder = new TextDecoder();
            body = decoder.decode(bodyData);
        }
        const res = new Response(body, {
            status,
            statusText,
            headers,
        });
        return res;
    }
}
export async function fetch(uri, options) {
    const req = new Request(uri, options);
    const msg = req.toSoupMessage();
    const bytes = await session.send_and_read_async(msg, GLib.PRIORITY_HIGH, req.options.cancel ?? null);
    //const bytes = session.send_and_read(msg, null);
    const res = Response.fromSoupMessage(msg, bytes);
    return res;
}
