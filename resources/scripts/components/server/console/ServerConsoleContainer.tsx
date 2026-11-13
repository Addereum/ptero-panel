import React, { memo, useState } from 'react';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import { Alert } from '@/components/elements/alert';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { ip } from '@/lib/formatters';
import classNames from 'classnames';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);

    const [viewMode, setViewMode] = useState<'console' | 'graphs'>('console');

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((a) => a.isDefault);
        return !match ? null : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    const statusMap: Record<string, { label: string; bg: string; dot: string }> = {
        running: { label: 'Online', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
        starting: { label: 'Starting', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
        stopping: { label: 'Stopping', bg: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
        offline: { label: 'Offline', bg: 'bg-white/[0.05] text-neutral-400 border-white/[0.08]', dot: 'bg-neutral-500' },
    };

    const statusStyle = statusMap[status || 'offline'] || {
        label: status || 'Offline',
        bg: 'bg-white/[0.05] text-neutral-400 border-white/[0.08]',
        dot: 'bg-neutral-500',
    };

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}

            {/* Header: Title, Live Status Badge, Allocation Chip, Power Buttons */}
            <div className={'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4'}>
                <div className={'flex flex-wrap items-center gap-3'}>
                    <h1 className={'font-header font-semibold text-2xl text-white tracking-tight'}>
                        {name}
                    </h1>

                    {/* Status Pill */}
                    <div
                        className={classNames(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                            statusStyle.bg
                        )}
                    >
                        <span
                            className={classNames(
                                'w-2 h-2 rounded-full',
                                statusStyle.dot,
                                status === 'running' && 'animate-pulse'
                            )}
                        />
                        {statusStyle.label}
                    </div>

                    {/* Allocation Chip */}
                    {allocation && (
                        <CopyOnClick text={allocation}>
                            <button
                                type={'button'}
                                className={
                                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-150 cursor-pointer'
                                }
                            >
                                <span className={'text-neutral-500 font-sans'}>Allocation:</span>
                                <span>{allocation}</span>
                                <FontAwesomeIcon icon={faCopy} className={'text-[10px] text-neutral-400 ml-0.5'} />
                            </button>
                        </CopyOnClick>
                    )}
                </div>

                {/* Power Action Buttons */}
                <div className={'flex-shrink-0'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex items-center gap-2'} />
                    </Can>
                </div>
            </div>

            {/* 4-Card Horizontal KPI Row */}
            <ServerDetailsBlock className={'mb-4'} />

            {/* Terminal Window with macOS Chrome */}
            <div className={'rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c1017] shadow-xl mb-4'}>
                {/* macOS Window Title Bar */}
                <div className={'flex items-center justify-between px-4 py-2.5 bg-[#141a22] border-b border-white/[0.08]'}>
                    {/* Window Controls */}
                    <div className={'flex items-center gap-2'}>
                        <span className={'w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm'} />
                        <span className={'w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm'} />
                        <span className={'w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm'} />
                    </div>

                    {/* View Mode Switcher */}
                    <div className={'flex items-center p-0.5 rounded-lg bg-black/40 border border-white/[0.06]'}>
                        <button
                            type={'button'}
                            onClick={() => setViewMode('console')}
                            className={classNames(
                                'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer',
                                viewMode === 'console'
                                    ? 'bg-white/[0.1] text-white shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200'
                            )}
                        >
                            Live Console
                        </button>
                        <button
                            type={'button'}
                            onClick={() => setViewMode('graphs')}
                            className={classNames(
                                'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer',
                                viewMode === 'graphs'
                                    ? 'bg-white/[0.1] text-white shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200'
                            )}
                        >
                            Graphs
                        </button>
                    </div>

                    <div className={'w-12'} />
                </div>

                {/* Body Content */}
                {viewMode === 'console' ? (
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                ) : (
                    <div className={'p-4'}>
                        <Spinner.Suspense>
                            <StatGraphs />
                        </Spinner.Suspense>
                    </div>
                )}
            </div>

            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
