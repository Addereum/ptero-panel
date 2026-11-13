import React, { useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import { useFlashKey } from '@/plugins/useFlash';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import AllocationRow from '@/components/server/network/AllocationRow';
import Button from '@/components/elements/Button';
import createServerAllocation from '@/api/server/network/createServerAllocation';
import tw from 'twin.macro';
import Can from '@/components/elements/Can';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import getServerAllocations from '@/api/swr/getServerAllocations';
import isEqual from 'react-fast-compare';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

const NetworkContainer = () => {
    const [loading, setLoading] = useState(false);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const allocationLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.allocations);
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations, isEqual);
    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);

    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const { data, error, mutate } = getServerAllocations();

    useEffect(() => {
        mutate(allocations);
    }, []);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    useDeepCompareEffect(() => {
        if (!data) return;

        setServerFromState((state) => ({ ...state, allocations: data }));
    }, [data]);

    const onCreateAllocation = () => {
        clearFlashes();

        setLoading(true);
        createServerAllocation(uuid)
            .then((allocation) => {
                setServerFromState((s) => ({ ...s, allocations: s.allocations.concat(allocation) }));
                return mutate(data?.concat(allocation), false);
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    };

    return (
        <ServerContentBlock showFlashKey={'server:network'} title={'Network'}>
            {!data ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    <div className={'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'}>
                        <div>
                            <h2 className={'text-xl font-semibold text-white tracking-tight'}>Network Allocations</h2>
                            <p className={'text-xs text-neutral-400 mt-0.5'}>
                                Manage IP addresses, port bindings, and connection endpoints assigned to this server.
                            </p>
                        </div>
                        {allocationLimit > 0 && allocationLimit > data.length && (
                            <Can action={'allocation.create'}>
                                <button
                                    type={'button'}
                                    onClick={onCreateAllocation}
                                    className={
                                        'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 shadow-sm transition-all duration-150 cursor-pointer self-start sm:self-auto'
                                    }
                                >
                                    + Create Allocation
                                </button>
                            </Can>
                        )}
                    </div>
                    {data.map((allocation) => (
                        <AllocationRow key={`${allocation.ip}:${allocation.port}`} allocation={allocation} />
                    ))}
                    {allocationLimit > 0 && (
                        <Can action={'allocation.create'}>
                            <SpinnerOverlay visible={loading} />
                            <div className={'mt-4 flex items-center justify-end'}>
                                <p className={'text-xs text-neutral-400'}>
                                    Currently using {data.length} of {allocationLimit} allowed allocations for this server.
                                </p>
                            </div>
                        </Can>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};

export default NetworkContainer;
