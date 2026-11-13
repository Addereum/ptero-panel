import { Websocket } from './Websocket';

class BrowserSocket {
    static instances: BrowserSocket[] = [];

    onopen?: () => void;
    onclose?: (event: { code: number }) => void;
    send = jest.fn();
    close = jest.fn();

    constructor() {
        BrowserSocket.instances.push(this);
    }
}

describe('Websocket', () => {
    const originalWebSocket = globalThis.WebSocket;

    beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ['performance'] });
        BrowserSocket.instances = [];
        globalThis.WebSocket = BrowserSocket as unknown as typeof WebSocket;
    });

    afterEach(() => {
        jest.useRealTimers();
        globalThis.WebSocket = originalWebSocket;
    });

    it('automatically reconnects after a dropped connection and authenticates again', () => {
        const socket = new Websocket().setToken('token').connect('ws://localhost');
        const closed = jest.fn();
        socket.on('SOCKET_CLOSE', closed);
        const first = BrowserSocket.instances[0];
        first.onopen?.();
        first.onclose?.({ code: 1006 });

        expect(closed).toHaveBeenCalledWith(false);
        expect(BrowserSocket.instances).toHaveLength(1);
        jest.advanceTimersByTime(1000);

        const reconnected = BrowserSocket.instances[1];
        reconnected.onopen?.();
        expect(reconnected.send).toHaveBeenCalledWith(JSON.stringify({ event: 'auth', args: ['token'] }));
        socket.close();
    });

    it.each([1000, 1001, 1005, 4400, 4409])('does not reconnect after a terminal close with code %s', (code) => {
        const socket = new Websocket().connect('ws://localhost');
        const closed = jest.fn();
        socket.on('SOCKET_CLOSE', closed);
        BrowserSocket.instances[0].onclose?.({ code });
        jest.advanceTimersByTime(1000);

        expect(closed).toHaveBeenCalledWith(true);
        expect(BrowserSocket.instances).toHaveLength(1);
        socket.close();
    });

    it('cancels an already scheduled reconnect when the socket is closed', () => {
        const socket = new Websocket().connect('ws://localhost');
        BrowserSocket.instances[0].onclose?.({ code: 1006 });
        socket.close();
        jest.advanceTimersByTime(1000);

        expect(BrowserSocket.instances).toHaveLength(1);
    });

    it('emits a connection error when all automatic reconnects fail', () => {
        const socket = new Websocket().connect('ws://localhost');
        const failed = jest.fn(() => socket.close());
        const closed = jest.fn();
        socket.on('SOCKET_CONNECT_ERROR', failed);
        socket.on('SOCKET_CLOSE', closed);

        for (let i = 0; i <= 20; i++) {
            BrowserSocket.instances[i].onclose?.({ code: 1006 });
            jest.advanceTimersByTime(1000);
        }

        expect(failed).toHaveBeenCalledTimes(1);
        expect(closed).toHaveBeenCalledTimes(20);
        expect(BrowserSocket.instances).toHaveLength(21);
    });
});
