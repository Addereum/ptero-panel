import React, { useEffect, useMemo, useState } from 'react';
import {
    faHdd,
    faMemory,
    faMicrochip,
    faNetworkWired,
} from '@fortawesome/free-solid-svg-icons';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const ServerDetailsBlock = ({ className }: { className?: string }) => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const offline = connected && status === 'offline';

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
    });

    const cpuPercent = limits.cpu ? Math.min(100, (stats.cpu / limits.cpu) * 100) : Math.min(100, stats.cpu);
    const memoryPercent = limits.memory ? Math.min(100, (stats.memory / mbToBytes(limits.memory)) * 100) : 0;
    const diskPercent = limits.disk ? Math.min(100, (stats.disk / mbToBytes(limits.disk)) * 100) : 0;

    return (
        <div className={classNames('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3', className)}>
            {/* CPU Card */}
            <div className={'p-4 rounded-xl bg-[#141a22] border border-white/[0.08] shadow-sm flex flex-col justify-between'}>
                <div className={'flex items-center justify-between text-neutral-400 text-xs font-medium'}>
                    <span className={'uppercase tracking-wider'}>CPU</span>
                    <FontAwesomeIcon icon={faMicrochip} className={'text-xs text-neutral-500'} />
                </div>
                <div className={'mt-2 mb-3'}>
                    <span className={'text-xl font-semibold text-white tracking-tight'}>
                        {offline ? '0.00%' : `${stats.cpu.toFixed(1)}%`}
                    </span>
                    <span className={'text-xs text-neutral-500 ml-1.5 font-normal'}>
                        / {textLimits.cpu || <>&infin;</>}
                    </span>
                </div>
                <div className={'w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden'}>
                    <div
                        className={'h-full rounded-full bg-cyan-400 transition-all duration-300'}
                        style={{ width: `${offline ? 0 : cpuPercent}%` }}
                    />
                </div>
            </div>

            {/* Memory Card */}
            <div className={'p-4 rounded-xl bg-[#141a22] border border-white/[0.08] shadow-sm flex flex-col justify-between'}>
                <div className={'flex items-center justify-between text-neutral-400 text-xs font-medium'}>
                    <span className={'uppercase tracking-wider'}>Memory</span>
                    <FontAwesomeIcon icon={faMemory} className={'text-xs text-neutral-500'} />
                </div>
                <div className={'mt-2 mb-3'}>
                    <span className={'text-xl font-semibold text-white tracking-tight'}>
                        {offline ? '0 B' : bytesToString(stats.memory)}
                    </span>
                    <span className={'text-xs text-neutral-500 ml-1.5 font-normal'}>
                        / {textLimits.memory || <>&infin;</>}
                    </span>
                </div>
                <div className={'w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden'}>
                    <div
                        className={'h-full rounded-full bg-purple-400 transition-all duration-300'}
                        style={{ width: `${offline ? 0 : memoryPercent}%` }}
                    />
                </div>
            </div>

            {/* Disk Card */}
            <div className={'p-4 rounded-xl bg-[#141a22] border border-white/[0.08] shadow-sm flex flex-col justify-between'}>
                <div className={'flex items-center justify-between text-neutral-400 text-xs font-medium'}>
                    <span className={'uppercase tracking-wider'}>Disk</span>
                    <FontAwesomeIcon icon={faHdd} className={'text-xs text-neutral-500'} />
                </div>
                <div className={'mt-2 mb-3'}>
                    <span className={'text-xl font-semibold text-white tracking-tight'}>
                        {bytesToString(stats.disk)}
                    </span>
                    <span className={'text-xs text-neutral-500 ml-1.5 font-normal'}>
                        / {textLimits.disk || <>&infin;</>}
                    </span>
                </div>
                <div className={'w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden'}>
                    <div
                        className={'h-full rounded-full bg-neutral-300 transition-all duration-300'}
                        style={{ width: `${diskPercent}%` }}
                    />
                </div>
            </div>

            {/* Network Card */}
            <div className={'p-4 rounded-xl bg-[#141a22] border border-white/[0.08] shadow-sm flex flex-col justify-between'}>
                <div className={'flex items-center justify-between text-neutral-400 text-xs font-medium'}>
                    <span className={'uppercase tracking-wider'}>Network</span>
                    <FontAwesomeIcon icon={faNetworkWired} className={'text-xs text-neutral-500'} />
                </div>
                <div className={'mt-2 mb-3 flex items-center justify-between'}>
                    <span className={'text-xs font-semibold text-white tracking-tight font-mono'}>
                        In: <span className={'text-cyan-400'}>{bytesToString(stats.rx)}</span>
                    </span>
                    <span className={'text-neutral-600'}>|</span>
                    <span className={'text-xs font-semibold text-white tracking-tight font-mono'}>
                        Out: <span className={'text-yellow-400'}>{bytesToString(stats.tx)}</span>
                    </span>
                </div>
                <div className={'w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden'}>
                    <div
                        className={'h-full rounded-full bg-blue-400 transition-all duration-300'}
                        style={{ width: offline ? '0%' : '100%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ServerDetailsBlock;
