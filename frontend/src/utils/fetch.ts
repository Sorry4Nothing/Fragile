import Soup from '@gi/soup3';
import GLib from '@gi/glib2';
import Gio from '@gi/gio2';

Gio._promisify(Soup.Session.prototype, 'send_and_read_async', 'send_and_read_finish');

const session = new Soup.Session();

type Headers = { [key: string]: string };

export type RequestOptions = {
	method?: string;
	headers?: Headers;
	body?: string;
	cancel?: Gio.Cancellable;
};

export class Request {
	constructor(public uri: string, public options: RequestOptions = {}) {}

	toSoupMessage(): Soup.Message {
		const msg = Soup.Message.new(this.options.method || 'GET', this.uri);

		if (this.options.headers) {
			for (const headerName in this.options.headers) {
				if (Object.prototype.hasOwnProperty.call(this.options.headers, headerName)) {
					const headerValue = this.options.headers[headerName];
					msg.requestHeaders.append(headerName, headerValue);
				}
			}
		}

		// TODO: request body

		return msg;
	}
}

export type ResponseOptions = {
	status: number;
	statusText: string;
	headers: Headers;
};

export class Response {
	constructor(private body: string, private options: ResponseOptions) {}

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

	static fromSoupMessage(msg: Soup.Message, bodyBytes: GLib.Bytes): Response {
		const status = msg.statusCode;
		const statusText = msg.reasonPhrase;
		const soupHeaders = msg.responseHeaders;
		const headers: Headers = {};
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

export async function fetch(uri: string, options?: RequestOptions): Promise<Response> {
	const req = new Request(uri, options);
	const msg = req.toSoupMessage();
	const bytes = await session.send_and_read_async(msg, GLib.PRIORITY_HIGH, req.options.cancel ?? null);
	//const bytes = session.send_and_read(msg, null);
	const res = Response.fromSoupMessage(msg, bytes);
	return res;
}
