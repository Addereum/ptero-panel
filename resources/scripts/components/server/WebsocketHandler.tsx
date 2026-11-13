import React, { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { Websocket } from '@/plugins/Websocket';
import { ServerContext } from '@/state/server';
import getWebsocketToken from '@/api/server/getWebsocketToken';
import ContentContainer from '@/components/elements/ContentContainer';
import ConsoleConnectionStatus, { ConsoleConnectionState } from '@/components/server/console/ConsoleConnectionStatus';
import { SocketEvent } from '@/components/server/events';

const reconnectErrors = ['jwt: exp claim is invalid', 'jwt: created too far in past (denylist)'];
const connectionTimeout = 25_000;

const tokenFailure = (error: unknown): ConsoleConnectionState => {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 403) return 'access-denied';
    if (status === 401 || status === 419) return 'authentication-failed';

    return 'connection-failed';
};

export default ({ isConsole }: { isConsole: boolean }) => {
    const [status, setStatus] = useState<ConsoleConnectionState>('connecting');
    const [attempt, setAttempt] = useState(0);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const setServerStatus = ServerContext.useStoreActions((actions) => actions.status.setServerStatus);
    const { setInstance, setConnectionState } = ServerContext.useStoreActions((actions) => actions.socket);

    const retry = () => setAttempt((previous) => previous + 1);

    useEffect(() => {
        if (!uuid) return;

        const controller = new AbortController();
        const { signal } = controller;
        const socket = new Websocket();
        let updatingToken = false;
        let authenticated = false;
        let timeout: number | undefined;

        const clearConnectionTimeout = () => {
            window.clearTimeout(timeout);
            timeout = undefined;
        };

        const disconnect = (status: ConsoleConnectionState) => {
            clearConnectionTimeout();
            socket.close();
            controller.abort();
            setConnectionState(false);
            setInstance(null);
            setStatus(status);
        };

        const startConnectionTimeout = () => {
            if (timeout === undefined) {
                timeout = window.setTimeout(() => disconnect('unreachable'), connectionTimeout);
            }
        };

        const reconnecting = () => {
            authenticated = false;
            startConnectionTimeout();
            setConnectionState(false);
            setStatus('reconnecting');
        };

        const updateToken = async () => {
            if (updatingToken || signal.aborted) return;

            updatingToken = true;
            try {
                const data = await getWebsocketToken(uuid, signal);
                if (!signal.aborted) socket.setToken(data.token, true);
            } catch (error) {
                // An early refresh can fail while the existing token is still usable.
                if (!signal.aborted && !authenticated) disconnect(tokenFailure(error));
            } finally {
                updatingToken = false;
            }
        };

        setConnectionState(false);
        setServerStatus(null);
        setStatus('connecting');

        socket.on('auth success', () => {
            authenticated = true;
            clearConnectionTimeout();
            setConnectionState(true);
            setStatus('connected');
        });
        socket.on('SOCKET_CLOSE', (terminal: boolean) => {
            if (terminal) {
                disconnect('disconnected');
            } else {
                reconnecting();
            }
        });
        socket.on('SOCKET_CONNECT_ERROR', () => disconnect('unreachable'));
        socket.on('SOCKET_ERROR', reconnecting);
        socket.on(SocketEvent.STATUS, setServerStatus);
        socket.on(SocketEvent.DAEMON_ERROR, (message) => {
            console.warn('Got error message from daemon socket:', message);
        });

        socket.on('token expiring', updateToken);
        socket.on('token expired', () => {
            reconnecting();
            updateToken();
        });
        socket.on('jwt error', (error: string) => {
            console.warn('JWT validation error from wings:', error);
            if (reconnectErrors.some((reason) => error.toLowerCase().includes(reason))) {
                reconnecting();
                updateToken();
            } else {
                disconnect('authentication-failed');
            }
        });

        socket.on(SocketEvent.TRANSFER_STATUS, (status: string) => {
            if (status === 'starting' || status === 'success') return;

            // Request a new socket URL so transfer logs can come from the destination node.
            setAttempt((previous) => previous + 1);
        });

        getWebsocketToken(uuid, signal)
            .then(({ token, socket: url }) => {
                if (signal.aborted) return;

                startConnectionTimeout();
                socket.setToken(token).connect(url);
                setInstance(socket);
            })
            .catch((error) => {
                if (!signal.aborted) disconnect(tokenFailure(error));
            });

        return () => {
            clearConnectionTimeout();
            controller.abort();
            socket.removeAllListeners();
            socket.close();
            setInstance(null);
            setConnectionState(false);
        };
    }, [uuid, attempt, setInstance, setConnectionState, setServerStatus]);

    if (!uuid || status === 'connected' || (!isConsole && status === 'connecting')) return null;

    return (
        <ContentContainer className={'mt-4'}>
            <ConsoleConnectionStatus status={status} onRetry={retry} />
        </ContentContainer>
    );
};
