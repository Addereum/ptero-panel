import React from 'react';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import styled from 'styled-components/macro';
import Input from '@/components/elements/Input';

export const FileActionCheckbox = styled(Input)`
    && {
        ${tw`cursor-pointer rounded border border-white/20 bg-white/[0.04] text-primary-500 transition-all`};
        width: 1.05rem;
        height: 1.05rem;

        &:checked {
            ${tw`border-primary-500 bg-primary-600`};
        }

        &:not(:checked) {
            ${tw`hover:border-white/40`};
        }
    }
`;

export default ({ name }: { name: string }) => {
    const isChecked = ServerContext.useStoreState((state) => state.files.selectedFiles.indexOf(name) >= 0);
    const appendSelectedFile = ServerContext.useStoreActions((actions) => actions.files.appendSelectedFile);
    const removeSelectedFile = ServerContext.useStoreActions((actions) => actions.files.removeSelectedFile);

    return (
        <label className={'flex-none flex items-center justify-center pl-3.5 pr-2.5 py-3 z-10 cursor-pointer select-none m-0'}>
            <FileActionCheckbox
                name={'selectedFiles'}
                value={name}
                checked={isChecked}
                type={'checkbox'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.currentTarget.checked) {
                        appendSelectedFile(name);
                    } else {
                        removeSelectedFile(name);
                    }
                }}
            />
        </label>
    );
};
