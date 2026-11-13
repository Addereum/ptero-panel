import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const NavigationContainer = styled.div`
    ${tw`w-full sticky top-0 z-30 shadow-sm`};
    background-color: rgba(18, 23, 29, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const NavIconButton = styled(NavLink)`
    ${tw`flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 no-underline transition-all duration-150`};
    background-color: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.06);

    &:hover {
        ${tw`text-white`};
        background-color: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateY(-0.5px);
    }

    &.active {
        color: #60a5fa;
        background-color: rgba(59, 130, 246, 0.15);
        border-color: rgba(59, 130, 246, 0.3);
    }
`;

const AdminPill = styled.a`
    ${tw`flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-medium no-underline transition-all duration-150`};
    color: #60a5fa;
    background-color: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.22);

    &:hover {
        color: #93c5fd;
        background-color: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.35);
        transform: translateY(-0.5px);
    }
`;

const UserPill = styled(NavLink)`
    ${tw`flex items-center gap-2 h-8 pl-1.5 pr-3 rounded-full text-xs font-medium no-underline transition-all duration-150`};
    color: #e2e8f0;
    background-color: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.06);

    &:hover {
        ${tw`text-white`};
        background-color: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateY(-0.5px);
    }

    &.active {
        color: #93c5fd;
        background-color: rgba(59, 130, 246, 0.15);
        border-color: rgba(59, 130, 246, 0.3);
    }
`;

const LogoutButton = styled.button`
    ${tw`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all duration-150 focus:outline-none`};
    color: #f87171;
    background-color: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.18);

    &:hover {
        color: #fca5a5;
        background-color: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.32);
        transform: translateY(-0.5px);
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const user = useStoreState((state: ApplicationStore) => state.user.data);
    const rootAdmin = user?.rootAdmin;
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <NavigationContainer>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center justify-between h-14 max-w-[1200px] px-4'}>
                <div id={'logo'} className={'flex items-center gap-3'}>
                    <Link
                        to={'/'}
                        className={
                            'flex items-center gap-2.5 no-underline text-neutral-100 hover:text-white transition-opacity duration-150'
                        }
                    >
                        <span className={'text-base font-semibold tracking-tight'}>{name}</span>
                        <span
                            className={
                                'hidden sm:inline-flex items-center text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-neutral-400 border border-white/[0.06]'
                            }
                        >
                            Client
                        </span>
                    </Link>
                </div>
                <div className={'flex items-center gap-2'}>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavIconButton to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} className={'text-xs'} />
                        </NavIconButton>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Administration Area'}>
                            <AdminPill href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} className={'text-xs'} />
                                <span className={'hidden sm:inline'}>Admin</span>
                            </AdminPill>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <UserPill to={'/account'}>
                            <span className={'flex items-center justify-center w-5 h-5 rounded-full overflow-hidden border border-white/20'}>
                                <Avatar.User />
                            </span>
                            {user?.username && (
                                <span className={'hidden sm:inline font-normal text-neutral-300'}>{user.username}</span>
                            )}
                        </UserPill>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <LogoutButton type={'button'} onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} className={'text-xs'} />
                        </LogoutButton>
                    </Tooltip>
                </div>
            </div>
        </NavigationContainer>
    );
};
