import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';

interface PowerButtonProps {
    className?: string;
}

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);

    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (!connected) return;

        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (!connected || status === 'offline') {
            setOpen(false);
        }
    }, [connected, status]);

    return (
        <div className={className}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <button
                    type={'button'}
                    className={
                        'px-4 py-2 rounded-lg text-xs font-semibold tracking-wide bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/15 cursor-pointer shadow-sm'
                    }
                    disabled={!connected || status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    Start
                </button>
            </Can>
            <Can action={'control.restart'}>
                <button
                    type={'button'}
                    className={
                        'px-4 py-2 rounded-lg text-xs font-semibold tracking-wide bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-200 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/[0.06] cursor-pointer shadow-sm'
                    }
                    disabled={!connected || !status}
                    onClick={onButtonClick.bind(this, 'restart')}
                >
                    Restart
                </button>
            </Can>
            <Can action={'control.stop'}>
                <button
                    type={'button'}
                    className={
                        'px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ' +
                        (killable
                            ? 'bg-red-600/30 hover:bg-red-600/40 border border-red-500/50 text-red-300'
                            : 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400')
                    }
                    disabled={!connected || !status || status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    {killable ? 'Kill' : 'Stop'}
                </button>
            </Can>
        </div>
    );
};
