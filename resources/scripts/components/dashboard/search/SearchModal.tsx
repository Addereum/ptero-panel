import React, { useEffect, useRef, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Field, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { object, string } from 'yup';
import debounce from 'debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faServer } from '@fortawesome/free-solid-svg-icons';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { ip } from '@/lib/formatters';

type Props = RequiredModalProps;

interface Values {
    term: string;
}

const ServerResult = styled(Link)`
    ${tw`flex items-center justify-between p-3.5 rounded-lg no-underline transition-all duration-150`};
    background-color: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.05);

    &:hover {
        background-color: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.25);
        transform: translateY(-0.5px);
    }

    &:not(:last-of-type) {
        ${tw`mb-2`};
    }
`;

const SearchWatcher = () => {
    const { values, submitForm } = useFormikContext<Values>();

    useEffect(() => {
        if (values.term.length >= 3) {
            submitForm();
        }
    }, [values.term]);

    return null;
};

export default ({ ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);
    const isAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [servers, setServers] = useState<Server[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const { clearAndAddHttpError, clearFlashes } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes
    );

    const search = debounce(({ term }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('search');
        setHasSearched(true);

        getServers({ query: term, type: isAdmin ? 'admin-all' : undefined })
            .then((servers) => setServers(servers.items.filter((_, index) => index < 5)))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ key: 'search', error });
            })
            .then(() => setSubmitting(false))
            .then(() => ref.current?.focus());
    }, 500);

    useEffect(() => {
        if (props.visible) {
            setHasSearched(false);
            setServers([]);
            if (ref.current) ref.current.focus();
        }
    }, [props.visible]);

    return (
        <Formik
            onSubmit={search}
            validationSchema={object().shape({
                term: string().min(3, 'Please enter at least three characters to begin searching.'),
            })}
            initialValues={{ term: '' } as Values}
        >
            {({ isSubmitting, values }) => (
                <Modal {...props}>
                    <Form>
                        <SearchWatcher />
                        <div
                            className={
                                'flex items-center gap-3 px-3.5 py-3 rounded-lg bg-neutral-900/60 border border-white/[0.08] focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-150'
                            }
                        >
                            <FontAwesomeIcon icon={faSearch} className={'text-neutral-400 text-sm flex-shrink-0'} />
                            <Field
                                innerRef={ref}
                                autoFocus
                                name={'term'}
                                autoComplete={'off'}
                                placeholder={'Search servers by name, UUID or allocation…'}
                                className={
                                    'w-full bg-transparent border-0 p-0 text-sm sm:text-base text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-0 leading-normal'
                                }
                            />
                            {isSubmitting ? (
                                <FontAwesomeIcon icon={faSpinner} spin className={'text-blue-400 text-xs flex-shrink-0'} />
                            ) : (
                                <span
                                    className={
                                        'hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-neutral-400 border border-white/[0.08] flex-shrink-0'
                                    }
                                >
                                    ESC
                                </span>
                            )}
                        </div>
                        <div className={'flex items-center justify-between mt-2.5 px-1 text-xs text-neutral-400'}>
                            <span>
                                {values.term.length < 3
                                    ? 'Enter at least 3 characters to search across servers.'
                                    : isSubmitting
                                    ? 'Searching…'
                                    : `${servers.length} results found`}
                            </span>
                        </div>
                    </Form>
                    {servers.length > 0 ? (
                        <div css={tw`mt-4 pt-3 border-t border-white/[0.06]`}>
                            <p className={'text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2.5 px-1'}>
                                Matching Servers
                            </p>
                            {servers.map((server) => (
                                <ServerResult
                                    key={server.uuid}
                                    to={`/server/${server.id}`}
                                    onClick={() => props.onDismissed()}
                                >
                                    <div className={'flex items-center gap-3 min-w-0 flex-1 mr-4'}>
                                        <div className={'w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 text-neutral-400'}>
                                            <FontAwesomeIcon icon={faServer} className={'text-xs'} />
                                        </div>
                                        <div className={'min-w-0 flex-1'}>
                                            <p className={'text-sm font-medium text-neutral-100 truncate'}>{server.name}</p>
                                            <p className={'mt-0.5 text-xs text-neutral-400 font-mono truncate'}>
                                                {server.allocations
                                                    .filter((alloc) => alloc.isDefault)
                                                    .map((allocation) => (
                                                        <span key={allocation.ip + allocation.port.toString()}>
                                                            {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                                        </span>
                                                    ))}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={'flex-none text-right'}>
                                        <span className={'text-xs py-1 px-2.5 bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-md font-medium'}>
                                            {server.node}
                                        </span>
                                    </div>
                                </ServerResult>
                            ))}
                        </div>
                    ) : hasSearched && !isSubmitting && values.term.length >= 3 ? (
                        <div className={'mt-4 pt-4 border-t border-white/[0.06] text-center py-6 text-sm text-neutral-400'}>
                            No servers found matching &ldquo;{values.term}&rdquo;
                        </div>
                    ) : null}
                </Modal>
            )}
        </Formik>
    );
};
