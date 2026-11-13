import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHdd, faMemory, faMicrochip, faNetworkWired, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import classNames from 'classnames';

interface Props {
    server: Server;
    className?: string;
}

const statusMap: Record<string, { label: string; bg: string; dot: string; stripe: string }> = {
    running: {
        label: 'Online',
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        stripe: 'from-blue-500 to-emerald-400',
    },
    starting: {
        label: 'Starting',
        bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        dot: 'bg-yellow-400',
        stripe: 'from-yellow-500 to-amber-500',
    },
    stopping: {
        label: 'Stopping',
        bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        dot: 'bg-yellow-400',
        stripe: 'from-yellow-500 to-red-500',
    },
    offline: {
        label: 'Offline',
        bg: 'bg-white/[0.05] text-neutral-400 border-white/[0.08]',
        dot: 'bg-neutral-500',
        stripe: 'from-neutral-700 to-neutral-800',
    },
};

const ServerCard = ({ server, className }: Props) => {
    const [stats, setStats] = useState<ServerStats>();
    const canFetchStats = !server.status && !server.isNodeUnderMaintenance && !server.isTransferring;

    useEffect(() => {
        if (!canFetchStats) return;

        let active = true;
        let timer: ReturnType<typeof setTimeout>;

        const refresh = async () => {
            try {
                const s = await getServerResourceUsage(server.uuid);
                if (!active) return;
                setStats(s);
            } catch {
                if (!active) return;
            }
            timer = setTimeout(refresh, 30000);
        };

        refresh();

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [canFetchStats, server.uuid]);

    const allocation = server.allocations.find((a) => a.isDefault);
    const allocationStr = !allocation ? 'N/A' : `${allocation.alias || ip(allocation.ip)}:${allocation.port}`;

    const rawStatus = server.status || stats?.status || (canFetchStats ? 'offline' : 'offline');
    const statusInfo = statusMap[rawStatus] || {
        label: rawStatus || 'Offline',
        bg: 'bg-white/[0.05] text-neutral-400 border-white/[0.08]',
        dot: 'bg-neutral-500',
        stripe: 'from-neutral-700 to-neutral-800',
    };

    const isRunning = rawStatus === 'running';
    const cpuLimit = server.limits.cpu > 0 ? `${server.limits.cpu}%` : 'Unlimited';
    const memoryLimit = server.limits.memory > 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const diskLimit = server.limits.disk > 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';

    const cpuUsage = isRunning && stats ? stats.cpuUsagePercent : 0;
    const memoryUsage = isRunning && stats ? stats.memoryUsageInBytes : 0;
    const diskUsage = stats ? stats.diskUsageInBytes : 0;

    const cpuPercent = server.limits.cpu > 0 ? Math.min(100, (cpuUsage / server.limits.cpu) * 100) : Math.min(100, cpuUsage);
    const memoryPercent = server.limits.memory > 0 ? Math.min(100, (memoryUsage / mbToBytes(server.limits.memory)) * 100) : 0;

    return (
        <Link
            to={`/server/${server.id}`}
            className={classNames(
                'group relative flex flex-col justify-between p-5 rounded-2xl bg-[#141a22] hover:bg-[#18202b] border border-white/[0.08] hover:border-blue-500/40 shadow-lg hover:shadow-2xl transition-all duration-200 overflow-hidden no-underline',
                className
            )}
            style={{
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            }}
        >
            {/* Top Status Gradient Stripe */}
            <div
                className={classNames(
                    'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-70 group-hover:opacity-100 transition-opacity duration-200',
                    statusInfo.stripe
                )}
            />

            {/* Header: Icon, Name, Status Pill */}
            <div>
                <div className={'flex items-start justify-between gap-3 mb-3'}>
                    <div className={'flex items-center gap-3 min-w-0'}>
                        <div
                            className={
                                'w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200'
                            }
                        >
                            <FontAwesomeIcon icon={faServer} className={'text-sm'} />
                        </div>
                        <div className={'min-w-0'}>
                            <h3 className={'text-base font-bold text-white group-hover:text-blue-300 transition-colors duration-150 truncate m-0'}>
                                {server.name}
                            </h3>
                            <p className={'text-xs text-neutral-400 line-clamp-1 mt-0.5 mb-0'}>
                                {server.description || 'No description'}
                            </p>
                        </div>
                    </div>

                    <div
                        className={classNames(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
                            statusInfo.bg
                        )}
                    >
                        <span
                            className={classNames(
                                'w-1.5 h-1.5 rounded-full',
                                statusInfo.dot,
                                isRunning && 'animate-pulse'
                            )}
                        />
                        {statusInfo.label}
                    </div>
                </div>

                {/* Allocation / IP Badge */}
                <div className={'mb-4'}>
                    <div className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-xs font-mono text-neutral-300'}>
                        <FontAwesomeIcon icon={faNetworkWired} className={'text-[10px] text-neutral-500'} />
                        <span>{allocationStr}</span>
                    </div>
                </div>
            </div>

            {/* Resource Meters */}
            <div className={'space-y-2.5 pt-3 border-t border-white/[0.06]'}>
                {/* CPU */}
                <div>
                    <div className={'flex items-center justify-between text-xs mb-1'}>
                        <span className={'text-neutral-400 flex items-center gap-1.5'}>
                            <FontAwesomeIcon icon={faMicrochip} className={'text-[10px] text-neutral-500'} />
                            CPU
                        </span>
                        <span className={'font-mono text-neutral-200'}>
                            {isRunning ? `${cpuUsage.toFixed(1)}%` : '0.0%'} <span className={'text-neutral-500'}>/ {cpuLimit}</span>
                        </span>
                    </div>
                    <div className={'w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden'}>
                        <div
                            className={'h-full rounded-full bg-cyan-400 transition-all duration-300'}
                            style={{ width: `${cpuPercent}%` }}
                        />
                    </div>
                </div>

                {/* Memory */}
                <div>
                    <div className={'flex items-center justify-between text-xs mb-1'}>
                        <span className={'text-neutral-400 flex items-center gap-1.5'}>
                            <FontAwesomeIcon icon={faMemory} className={'text-[10px] text-neutral-500'} />
                            Memory
                        </span>
                        <span className={'font-mono text-neutral-200'}>
                            {isRunning ? bytesToString(memoryUsage) : '0 B'} <span className={'text-neutral-500'}>/ {memoryLimit}</span>
                        </span>
                    </div>
                    <div className={'w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden'}>
                        <div
                            className={'h-full rounded-full bg-purple-400 transition-all duration-300'}
                            style={{ width: `${memoryPercent}%` }}
                        />
                    </div>
                </div>

                {/* Disk */}
                <div className={'flex items-center justify-between text-xs text-neutral-400 pt-1'}>
                    <span className={'flex items-center gap-1.5'}>
                        <FontAwesomeIcon icon={faHdd} className={'text-[10px] text-neutral-500'} />
                        Disk
                    </span>
                    <span className={'font-mono text-neutral-300'}>
                        {bytesToString(diskUsage)} <span className={'text-neutral-500'}>/ {diskLimit}</span>
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ServerCard;
