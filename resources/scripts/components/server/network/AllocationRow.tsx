import React, { memo, useCallback, useState } from 'react';
import isEqual from 'react-fast-compare';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import InputSpinner from '@/components/elements/InputSpinner';
import { Textarea } from '@/components/elements/Input';
import Can from '@/components/elements/Can';
import { Button } from '@/components/elements/button/index';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Allocation } from '@/api/server/getServer';
import styled from 'styled-components/macro';
import { debounce } from 'debounce';
import setServerAllocationNotes from '@/api/server/network/setServerAllocationNotes';
import { useFlashKey } from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/components/elements/CopyOnClick';
import DeleteAllocationButton from '@/components/server/network/DeleteAllocationButton';
import setPrimaryServerAllocation from '@/api/server/network/setPrimaryServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';
import { ip } from '@/lib/formatters';
import Code from '@/components/elements/Code';

const Label = styled.label`
    ${tw`uppercase text-xs mt-1 text-neutral-400 block px-1 select-none transition-colors duration-150`}
`;

interface Props {
    allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = getServerAllocations();

    const onNotesChanged = useCallback((id: number, notes: string) => {
        mutate((data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)), false);
    }, []);

    const setAllocationNotes = debounce((notes: string) => {
        setLoading(true);
        clearFlashes();

        setServerAllocationNotes(uuid, allocation.id, notes)
            .then(() => onNotesChanged(allocation.id, notes))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    }, 750);

    const setPrimaryAllocation = () => {
        clearFlashes();
        mutate((data) => data?.map((a) => ({ ...a, isDefault: a.id === allocation.id })), false);

        setPrimaryServerAllocation(uuid, allocation.id).catch((error) => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <div
            className={'flex flex-wrap md:flex-nowrap items-center justify-between gap-4 p-4 rounded-xl mb-3'}
            style={{
                backgroundColor: '#141a22',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            }}
        >
            <div className={'flex items-center gap-3 w-full md:w-auto'}>
                <div className={'w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-400 flex-shrink-0'}>
                    <FontAwesomeIcon icon={faNetworkWired} className={'text-sm'} />
                </div>
                <div className={'flex items-center gap-3 min-w-0'}>
                    <div>
                        <div className={'flex items-center gap-2'}>
                            <CopyOnClick text={allocation.alias || `${ip(allocation.ip)}:${allocation.port}`}>
                                <span className={'font-mono text-sm font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors'}>
                                    {ip(allocation.ip)}:{allocation.port}
                                </span>
                            </CopyOnClick>
                            {allocation.isDefault && (
                                <span className={'px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'}>
                                    Primary
                                </span>
                            )}
                        </div>
                        {allocation.alias && (
                            <p className={'text-xs font-mono text-neutral-400 mt-0.5'}>
                                Alias: {allocation.alias}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className={'w-full md:flex-1 md:w-auto'}>
                <InputSpinner visible={loading}>
                    <input
                        type={'text'}
                        className={'w-full bg-neutral-900/60 border border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500/50 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 outline-none transition-colors'}
                        placeholder={'Add notes for this port...'}
                        defaultValue={allocation.notes || undefined}
                        onChange={(e) => setAllocationNotes(e.currentTarget.value)}
                    />
                </InputSpinner>
            </div>

            <div className={'flex items-center justify-end gap-2 w-full md:w-auto'}>
                {!allocation.isDefault && (
                    <>
                        <Can action={'allocation.update'}>
                            <button
                                type={'button'}
                                onClick={setPrimaryAllocation}
                                className={'px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 transition-all cursor-pointer'}
                            >
                                Make Primary
                            </button>
                        </Can>
                        <Can action={'allocation.delete'}>
                            <DeleteAllocationButton allocation={allocation.id} />
                        </Can>
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(AllocationRow, isEqual);
