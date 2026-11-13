import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServerRowView } from '@/components/dashboard/ServerRow';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import ConsoleConnectionStatus, { ConsoleConnectionState } from '@/components/server/console/ConsoleConnectionStatus';
import { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';

type ServerRowProps = React.ComponentProps<typeof ServerRowView>;

const exampleServer: ServerRowProps['server'] = {
    name: 'Survival',
    description: 'Example server',
    status: null,
    isNodeUnderMaintenance: false,
    isTransferring: false,
    allocations: [{ id: 1, ip: '192.0.2.10', alias: 'games.example.test', port: 25565, notes: null, isDefault: true }],
    limits: { memory: 4096, swap: 0, disk: 10240, io: 500, cpu: 200, threads: '' },
};

const exampleStats = (status: ServerPowerState): ServerStats => ({
    status,
    isSuspended: false,
    memoryUsageInBytes: status === 'offline' ? 0 : 1073741824,
    cpuUsagePercent: status === 'offline' ? 0 : 14,
    diskUsageInBytes: 805306368,
    networkRxInBytes: 0,
    networkTxInBytes: 0,
    uptime: status === 'running' ? 7200000 : 0,
});

const examples: ServerRowProps[] = [
    { server: exampleServer, stats: exampleStats('running') },
    { server: { ...exampleServer, name: 'Creative' }, stats: exampleStats('offline') },
    { server: { ...exampleServer, name: 'Modded' }, stats: exampleStats('starting') },
    { server: { ...exampleServer, name: 'Events' }, stats: exampleStats('stopping') },
    { server: { ...exampleServer, name: 'Minigames' }, statsFailed: true },
    { server: { ...exampleServer, name: 'Test world' } },
    { server: { ...exampleServer, name: 'New world', status: 'installing' } },
];

const scenarios: Record<ConsoleConnectionState, string> = {
    connecting: 'Connecting',
    reconnecting: 'Reconnecting',
    disconnected: 'Disconnected',
    unreachable: 'Unreachable',
    'connection-failed': 'Connection setup failed',
    'authentication-failed': 'Authentication failed',
    'access-denied': 'Access denied',
    connected: 'Connected',
};

export default function ServerPreview() {
    const [connection, setConnection] = useState<ConsoleConnectionState>('unreachable');

    useEffect(() => {
        if (connection !== 'reconnecting') return;

        const timer = window.setTimeout(() => setConnection('connected'), 900);
        return () => window.clearTimeout(timer);
    }, [connection]);

    return (
        <PageContentBlock title={'Server preview'}>
            <Link to={'/'} className={'text-sm text-neutral-300 hover:text-white'}>
                Back to dashboard
            </Link>
            <h1 className={'mt-4 text-2xl font-medium text-neutral-50'}>Server preview</h1>
            <p className={'mt-1 text-sm text-neutral-400'}>These examples use sample data and require no Wings node.</p>
            <div className={'mt-6'}>
                <h2 className={'mb-2 text-lg font-medium text-neutral-100'}>Server status</h2>
                <div className={'space-y-2'}>
                    {examples.map((example) => (
                        <ServerRowView key={example.server.name} {...example} />
                    ))}
                </div>
            </div>
            <div className={'mt-6'}>
                <h2 className={'mb-2 text-lg font-medium text-neutral-100'}>Console connection</h2>
                <div className={'mb-3 max-w-xs'}>
                    <Label htmlFor={'console-preview-scenario'}>Connection scenario</Label>
                    <Select
                        id={'console-preview-scenario'}
                        value={connection}
                        onChange={(event) => setConnection(event.currentTarget.value as ConsoleConnectionState)}
                    >
                        {Object.entries(scenarios).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </Select>
                </div>
                <ConsoleConnectionStatus status={connection} onRetry={() => setConnection('reconnecting')} />
            </div>
        </PageContentBlock>
    );
}
