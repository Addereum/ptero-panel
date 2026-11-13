import React, { memo, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const Icon = memo(
    styled(FontAwesomeIcon)<{ $alarm: boolean }>`
        ${(props) => (props.$alarm ? tw`text-red-400` : tw`text-neutral-500`)};
    `,
    isEqual
);

const IconDescription = styled.p<{ $alarm: boolean }>`
    ${tw`text-sm ml-2`};
    ${(props) => (props.$alarm ? tw`text-white` : tw`text-neutral-400`)};
`;

const Row = styled(GreyRowBox)`
    ${tw`grid grid-cols-12 gap-4 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none`};
`;

const statusDetails = {
    running: { label: 'Online', color: tw`bg-green-900 text-green-100` },
    offline: { label: 'Offline', color: tw`bg-gray-900 text-gray-100` },
    starting: { label: 'Starting', color: tw`bg-yellow-900 text-yellow-100` },
    stopping: { label: 'Stopping', color: tw`bg-yellow-900 text-yellow-100` },
    checking: { label: 'Checking status…', color: tw`bg-gray-900 text-gray-100` },
    unreachable: { label: 'Connection failed', color: tw`bg-red-900 text-red-100` },
    suspended: { label: 'Suspended', color: tw`bg-red-900 text-red-100` },
    maintenance: { label: 'Under maintenance', color: tw`bg-yellow-900 text-yellow-100` },
    transferring: { label: 'Transferring', color: tw`bg-blue-900 text-blue-100` },
    installing: { label: 'Installing', color: tw`bg-blue-900 text-blue-100` },
    install_failed: { label: 'Installation failed', color: tw`bg-red-900 text-red-100` },
    reinstall_failed: { label: 'Reinstallation failed', color: tw`bg-red-900 text-red-100` },
    restoring_backup: { label: 'Restoring backup', color: tw`bg-blue-900 text-blue-100` },
};

interface ServerRowViewProps {
    server: Pick<
        Server,
        'name' | 'description' | 'allocations' | 'limits' | 'status' | 'isNodeUnderMaintenance' | 'isTransferring'
    >;
    stats?: ServerStats;
    statsFailed?: boolean;
    className?: string;
    to?: string;
}

function getStatus({ server, stats, statsFailed }: ServerRowViewProps): string {
    if (server.status === 'suspended') return 'suspended';
    if (server.isNodeUnderMaintenance) return 'maintenance';
    if (server.isTransferring) return 'transferring';
    if (server.status) return server.status;
    if (statsFailed || stats?.isSuspended) return 'unreachable';

    switch (stats?.status) {
        case 'running':
        case 'offline':
        case 'starting':
        case 'stopping':
            return stats.status;
        case undefined:
            return 'checking';
        default:
            return 'unreachable';
    }
}

export const ServerRowView = ({ server, stats, statsFailed, className, to }: ServerRowViewProps) => {
    const status = getStatus({ server, stats, statsFailed });
    const statusInfo = (statusDetails as Record<string, { label: string; color: any }>)[status];
    const label = statusInfo?.label || status;
    const color = statusInfo?.color || tw`bg-gray-900 text-gray-100`;
    const showStats =
        stats && (status === 'running' || status === 'offline' || status === 'starting' || status === 'stopping');
    const allocation = server.allocations.find((allocation) => allocation.isDefault);
    const { disk, memory, cpu } = server.limits;
    const diskLimit = disk > 0 ? bytesToString(mbToBytes(disk)) : 'Unlimited';
    const memoryLimit = memory > 0 ? bytesToString(mbToBytes(memory)) : 'Unlimited';
    const cpuLimit = cpu > 0 ? cpu + ' %' : 'Unlimited';

    const contents = (
        <>
            <div css={tw`flex items-center col-span-12 sm:col-span-6 lg:col-span-5 min-w-0`}>
                <div className={'icon mr-4 shrink-0'} aria-hidden={'true'}>
                    <FontAwesomeIcon icon={faServer} />
                </div>
                <div css={tw`min-w-0`}>
                    <p css={tw`text-lg break-words`}>{server.name}</p>
                    {!!server.description && (
                        <p className={'line-clamp-2'} css={tw`text-sm text-gray-300 break-words`}>
                            {server.description}
                        </p>
                    )}
                    <span css={[tw`inline-block mt-2 rounded px-2 py-1 text-xs font-medium`, color]}>{label}</span>
                </div>
            </div>
            {allocation && (
                <div css={tw`hidden lg:flex lg:col-span-3 items-center justify-center min-w-0`}>
                    <FontAwesomeIcon icon={faEthernet} css={tw`text-gray-300 flex-shrink-0`} aria-hidden={'true'} />
                    <p css={tw`text-sm text-gray-300 ml-2 break-all`}>
                        {allocation.alias || ip(allocation.ip)}:{allocation.port}
                    </p>
                </div>
            )}
            {showStats && (
                <div css={tw`hidden col-start-7 col-span-6 lg:col-start-9 lg:col-span-4 sm:grid grid-cols-3 gap-2`}>
                    <div>
                        <div css={tw`flex items-center justify-center`}>
                            <Icon icon={faMicrochip} $alarm={cpu > 0 && stats.cpuUsagePercent >= cpu * 0.9} />
                            <IconDescription $alarm={cpu > 0 && stats.cpuUsagePercent >= cpu * 0.9}>
                                {stats.cpuUsagePercent.toFixed(2)} %
                            </IconDescription>
                        </div>
                        <p css={tw`text-xs text-gray-300 text-center mt-1`}>of {cpuLimit}</p>
                    </div>
                    <div>
                        <div css={tw`flex items-center justify-center`}>
                            <Icon icon={faMemory} $alarm={isAlarmState(stats.memoryUsageInBytes, memory)} />
                            <IconDescription $alarm={isAlarmState(stats.memoryUsageInBytes, memory)}>
                                {bytesToString(stats.memoryUsageInBytes)}
                            </IconDescription>
                        </div>
                        <p css={tw`text-xs text-gray-300 text-center mt-1`}>of {memoryLimit}</p>
                    </div>
                    <div>
                        <div css={tw`flex items-center justify-center`}>
                            <Icon icon={faHdd} $alarm={isAlarmState(stats.diskUsageInBytes, disk)} />
                            <IconDescription $alarm={isAlarmState(stats.diskUsageInBytes, disk)}>
                                {bytesToString(stats.diskUsageInBytes)}
                            </IconDescription>
                        </div>
                        <p css={tw`text-xs text-gray-300 text-center mt-1`}>of {diskLimit}</p>
                    </div>
                </div>
            )}
        </>
    );

    return to ? (
        <Row as={Link} to={to} className={className}>
            {contents}
        </Row>
    ) : (
        <Row $hoverable={false} className={className}>
            {contents}
        </Row>
    );
};

export default ({ server, className }: { server: Server; className?: string }) => {
    const [stats, setStats] = useState<ServerStats>();
    const [statsFailed, setStatsFailed] = useState(false);
    const canFetchStats = !server.status && !server.isNodeUnderMaintenance && !server.isTransferring;

    useEffect(() => {
        setStats(undefined);
        setStatsFailed(false);
        if (!canFetchStats) return;

        let active = true;
        let timer: ReturnType<typeof setTimeout>;
        const refresh = async () => {
            try {
                const stats = await getServerResourceUsage(server.uuid);
                if (!active) return;
                setStats(stats);
                setStatsFailed(false);
            } catch {
                if (!active) return;
                setStatsFailed(true);
            }
            timer = setTimeout(refresh, 30000);
        };
        refresh();

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [canFetchStats, server.uuid]);

    return (
        <ServerRowView
            server={server}
            stats={stats}
            statsFailed={statsFailed}
            className={className}
            to={`/server/${server.id}`}
        />
    );
};
