import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import Input from '@/components/elements/Input';
import { Button } from '@/components/elements/button';

export default () => {
    const { search } = useLocation();
    const [filters, setFilters] = useState(() => {
        const params = new URLSearchParams(search);
        const page = Number(params.get('page') || '1');

        return { query: params.get('q')?.trim() ?? '', page: Number.isSafeInteger(page) && page > 0 ? page : 1 };
    });
    const [searchInput, setSearchInput] = useState(filters.query);
    const { query, page } = filters;
    const term = searchInput.trim();
    const isSearchPending = term !== query;
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const showOthers = rootAdmin && !!showOnlyAdmin;

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client', uuid, showOthers, page, query],
        () => getServers({ page, query: query || undefined, type: showOthers ? 'admin' : undefined })
    );

    useEffect(() => {
        if (!isSearchPending) return;

        const timeout = window.setTimeout(() => setFilters({ query: term, page: 1 }), 300);
        return () => window.clearTimeout(timeout);
    }, [isSearchPending, term]);

    useEffect(() => {
        if (!isSearchPending && servers && page > 1 && page > servers.pagination.totalPages) {
            setFilters({ query, page: 1 });
        }
    }, [isSearchPending, page, query, servers]);

    useEffect(() => {
        // Keep the current route mounted and the search field focused while syncing the address bar.
        const url = new URL(window.location.href);
        if (url.pathname !== '/') return;
        if (page > 1) url.searchParams.set('page', String(page));
        else url.searchParams.delete('page');
        if (query) url.searchParams.set('q', query);
        else url.searchParams.delete('q');
        window.history.replaceState(window.history.state, '', url);
    }, [page, query]);

    useEffect(() => {
        if (error && !isSearchPending) clearAndAddHttpError({ key: 'dashboard', error });
        else clearFlashes('dashboard');
    }, [error, isSearchPending]);

    const emptyMessage = query
        ? `No servers match “${query}”.`
        : showOthers
        ? 'There are no other servers to display.'
        : 'There are no servers associated with your account.';

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div css={tw`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
                <div role={'search'} css={tw`relative w-full sm:max-w-md`}>
                    <Input
                        type={'search'}
                        aria-label={'Search servers'}
                        placeholder={'Search servers'}
                        autoComplete={'off'}
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />
                </div>
                {rootAdmin && (
                    <Button.Text
                        type={'button'}
                        aria-pressed={showOthers}
                        className={'self-start sm:self-auto'}
                        variant={showOthers ? Button.Variants.Primary : Button.Variants.Secondary}
                        onClick={() => {
                            setShowOnlyAdmin(!showOthers);
                            setFilters({ query: term, page: 1 });
                        }}
                    >
                        Other users’ servers
                    </Button.Text>
                )}
            </div>
            {isSearchPending || (!servers && !error) ? (
                <div role={'status'}>
                    <span css={tw`sr-only`}>{term ? 'Searching servers…' : 'Loading servers…'}</span>
                    <Spinner centered size={'large'} />
                </div>
            ) : (
                servers && (
                    <Pagination data={servers} onPageSelect={(page) => setFilters({ query, page })}>
                        {({ items }) =>
                            items.length > 0 ? (
                                <div css={tw`space-y-2`}>
                                    {items.map((server) => (
                                        <ServerRow key={server.uuid} server={server} />
                                    ))}
                                </div>
                            ) : (
                                <p role={'status'} css={tw`py-6 text-center text-sm text-gray-300 break-words`}>
                                    {emptyMessage}
                                </p>
                            )
                        }
                    </Pagination>
                )
            )}
        </PageContentBlock>
    );
};
