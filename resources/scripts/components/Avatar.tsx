import React, { useState } from 'react';
import classNames from 'classnames';
import { useStoreState } from '@/state/hooks';
import md5 from '@/lib/md5';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    name?: string;
    email?: string;
    url?: string;
    size?: number;
    className?: string;
    variant?: string;
}

const _Avatar = ({ name, email, url, size = 64, className, variant, ...props }: AvatarProps) => {
    const [hasError, setHasError] = useState(false);

    // Resolve Gravatar or direct URL
    let avatarUrl = url;
    if (!avatarUrl) {
        const target = (email || (name && name.includes('@') ? name : '')).trim().toLowerCase();
        if (target) {
            avatarUrl = `https://www.gravatar.com/avatar/${md5(target)}?s=${Math.max(size * 2, 64)}&d=mp`;
        } else if (name) {
            avatarUrl = `https://www.gravatar.com/avatar/${md5(name.trim().toLowerCase())}?s=${Math.max(size * 2, 64)}&d=mp`;
        }
    }

    if (!avatarUrl || hasError) {
        return (
            <div
                className={classNames(
                    'flex items-center justify-center w-full h-full bg-neutral-800 text-neutral-400 select-none overflow-hidden rounded-full',
                    className
                )}
            >
                <svg
                    className={'w-3/5 h-3/5 text-neutral-400'}
                    fill={'currentColor'}
                    viewBox={'0 0 24 24'}
                >
                    <path
                        fillRule={'evenodd'}
                        d={'M12 2a5 5 0 100 10 5 5 0 000-10zm-7 18a7 7 0 0114 0H5z'}
                        clipRule={'evenodd'}
                    />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={avatarUrl}
            alt={name || email || 'User Avatar'}
            onError={() => setHasError(true)}
            className={classNames('w-full h-full object-cover rounded-full select-none', className)}
            loading={'lazy'}
            {...props}
        />
    );
};

const _UserAvatar = (props: Omit<AvatarProps, 'name' | 'email'>) => {
    const user = useStoreState((state) => state.user.data);

    return (
        <_Avatar
            email={user?.email}
            name={user?.username || user?.uuid || 'system'}
            {...props}
        />
    );
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
    User: _UserAvatar,
});

export default Avatar;
