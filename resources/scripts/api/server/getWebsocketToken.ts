import http from '@/api/http';

interface Response {
    token: string;
    socket: string;
}

export default (server: string, signal?: AbortSignal): Promise<Response> =>
    http.get(`/api/client/servers/${server}/websocket`, { signal }).then(({ data }) => ({
        token: data.data.token,
        socket: data.data.socket,
    }));
