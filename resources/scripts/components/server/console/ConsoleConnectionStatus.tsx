import React from 'react';
import classNames from 'classnames';
import { Button } from '@/components/elements/button';
import Spinner from '@/components/elements/Spinner';

export type ConsoleConnectionState =
    | 'connecting'
    | 'reconnecting'
    | 'connected'
    | 'disconnected'
    | 'unreachable'
    | 'connection-failed'
    | 'authentication-failed'
    | 'access-denied';

const messages: Record<ConsoleConnectionState, { title: string; description?: string }> = {
    connecting: { title: 'Connecting to the console…' },
    reconnecting: { title: 'Reconnecting to the console…', description: 'The panel will retry automatically.' },
    connected: { title: 'Console connected' },
    disconnected: { title: 'Console disconnected', description: 'The node closed the connection.' },
    unreachable: { title: 'Node unreachable', description: 'The panel could not connect to the node.' },
    'connection-failed': { title: 'Could not prepare the console connection' },
    'authentication-failed': {
        title: 'Console authorization failed',
        description: 'The panel could not authorize this connection.',
    },
    'access-denied': { title: 'Console access denied', description: 'You do not have access to this connection.' },
};

interface Props {
    status: ConsoleConnectionState;
    onRetry: () => void;
}

export default ({ status, onRetry }: Props) => {
    const { title, description } = messages[status];
    const busy = status === 'connecting' || status === 'reconnecting';
    const canRetry = status !== 'connecting' && status !== 'connected' && status !== 'access-denied';

    return (
        <div
            className={classNames(
                'flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded border px-4 py-3 text-sm',
                busy || status === 'connected' ? 'border-gray-500 bg-gray-700' : 'border-yellow-500/50 bg-gray-700'
            )}
        >
            <div className={'flex min-w-0 items-center gap-3'} role={'status'}>
                {busy && (
                    <span className={'shrink-0'} aria-hidden={'true'}>
                        <Spinner size={'small'} />
                    </span>
                )}
                <div>
                    <p className={'font-medium text-gray-50'}>{title}</p>
                    {description && <p className={'mt-0.5 text-gray-300'}>{description}</p>}
                </div>
            </div>
            {canRetry && (
                <Button.Text type={'button'} size={Button.Sizes.Small} onClick={onRetry}>
                    Retry connection
                </Button.Text>
            )}
        </div>
    );
};
