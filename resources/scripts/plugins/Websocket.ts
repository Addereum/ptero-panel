import Sockette from 'sockette';
import { EventEmitter } from 'events';

const terminalCloseCodes = [1000, 1001, 1005, 4400, 4409];

export class Websocket extends EventEmitter {
    // The socket instance being tracked.
    private socket: Sockette | null = null;
    private isOpen = false;

    // The URL being connected to for the socket.
    private url: string | null = null;

    // The authentication token passed along with every request to the Daemon.
    // By default this token expires every 15 minutes and must therefore be
    // refreshed at a pretty continuous interval. The socket server will respond
    // with "token expiring" and "token expired" events when approaching 3 minutes
    // and 0 minutes to expiry.
    private token = '';

    // Connects to the websocket instance and sets the token for the initial request.
    connect(url: string): this {
        this.url = url;

        const socket = new Sockette(this.url, {
            timeout: 1000,
            maxAttempts: 20,
            onmessage: (e) => {
                if (this.socket !== socket) return;

                try {
                    const { event, args } = JSON.parse(e.data);
                    args ? this.emit(event, ...args) : this.emit(event);
                } catch (ex) {
                    console.warn('Failed to parse incoming websocket message.', ex);
                }
            },
            onopen: () => {
                if (this.socket !== socket) return;

                this.isOpen = true;
                this.emit('SOCKET_OPEN');
                this.authenticate();
            },
            onclose: ({ code }) => {
                if (this.socket !== socket) return;

                this.isOpen = false;
                // Sockette schedules a retry before calling onclose. Cancel it for Wings' terminal closes.
                if (code === 4400 || code === 4409) {
                    this.close();
                }

                this.emit('SOCKET_CLOSE', terminalCloseCodes.includes(code));
            },
            onerror: (error) => {
                if (this.socket === socket) this.emit('SOCKET_ERROR', error);
            },
            onmaximum: (event) => {
                if (this.socket === socket && !terminalCloseCodes.includes(event?.code)) {
                    this.emit('SOCKET_CONNECT_ERROR');
                }
            },
        });
        this.socket = socket;

        return this;
    }

    // Sets the authentication token to use when sending commands back and forth
    // between the websocket instance.
    setToken(token: string, isUpdate = false): this {
        this.token = token;

        if (isUpdate) {
            this.authenticate();
        }

        return this;
    }

    authenticate() {
        if (this.url && this.token) {
            this.send('auth', this.token);
        }
    }

    close(code?: number, reason?: string) {
        const socket = this.socket;
        this.socket = null;
        this.isOpen = false;
        this.url = null;
        this.token = '';
        socket?.close(code, reason);
    }

    open() {
        this.socket?.open();
    }

    reconnect() {
        this.socket?.reconnect();
    }

    send(event: string, payload?: string | string[]) {
        if (this.isOpen) {
            this.socket?.json({ event, args: Array.isArray(payload) ? payload : [payload] });
        }
    }
}
