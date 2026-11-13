import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((dir) => !!dir)
            .map((dir, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: dir };
                }

                return { name: dir, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    return (
        <div className={'flex items-center gap-1.5 flex-wrap text-xs sm:text-sm text-neutral-400 overflow-x-hidden'}>
            {renderLeft}
            <div className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141a22] border border-white/[0.08] text-xs'}>
                <FontAwesomeIcon icon={faFolderOpen} className={'text-amber-400 text-xs mr-1'} />
                <NavLink
                    to={`/server/${id}/files`}
                    className={'text-neutral-300 hover:text-white transition-colors duration-150 no-underline font-medium'}
                >
                    container
                </NavLink>

                {breadcrumbs().map((crumb, index) => (
                    <React.Fragment key={index}>
                        <span className={'text-neutral-600'}>/</span>
                        {crumb.path ? (
                            <NavLink
                                to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                                className={'text-neutral-300 hover:text-white transition-colors duration-150 no-underline font-medium'}
                            >
                                {crumb.name}
                            </NavLink>
                        ) : (
                            <span className={'text-white font-semibold'}>{crumb.name}</span>
                        )}
                    </React.Fragment>
                ))}

                {file && (
                    <React.Fragment>
                        <span className={'text-neutral-600'}>/</span>
                        <span className={'text-cyan-300 font-semibold'}>{file}</span>
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};
