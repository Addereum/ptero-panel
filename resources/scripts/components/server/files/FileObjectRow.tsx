import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCode,
    faFileAlt,
    faFileArchive,
    faFileCode,
    faFileImage,
    faFileImport,
    faFolder,
} from '@fortawesome/free-solid-svg-icons';
import { encodePathSegments } from '@/helpers';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { FileObject } from '@/api/server/files/loadDirectory';
import FileDropdownMenu from '@/components/server/files/FileDropdownMenu';
import { ServerContext } from '@/state/server';
import { NavLink, useRouteMatch } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';
import { usePermissions } from '@/plugins/usePermissions';
import { join } from 'pathe';
import { bytesToString } from '@/lib/formatters';
import styles from './style.module.css';

const getFileIcon = (file: FileObject) => {
    if (!file.isFile) {
        return { icon: faFolder, color: 'text-amber-400' };
    }
    if (file.isSymlink) {
        return { icon: faFileImport, color: 'text-cyan-400' };
    }
    if (file.isArchiveType()) {
        return { icon: faFileArchive, color: 'text-purple-400' };
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['yml', 'yaml', 'json', 'toml', 'properties', 'conf', 'cfg', 'ini', 'env', 'pteroignore'].includes(ext || '')) {
        return { icon: faFileCode, color: 'text-cyan-400' };
    }
    if (['jar', 'sh', 'bat', 'py', 'js', 'ts', 'php'].includes(ext || '')) {
        return { icon: faCode, color: 'text-emerald-400' };
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext || '')) {
        return { icon: faFileImage, color: 'text-pink-400' };
    }
    return { icon: faFileAlt, color: 'text-neutral-400' };
};

const Clickable: React.FC<{ file: FileObject }> = memo(({ file, children }) => {
    const [canRead] = usePermissions(['file.read']);
    const [canReadContents] = usePermissions(['file.read-content']);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const match = useRouteMatch();

    return (file.isFile && (!file.isEditable() || !canReadContents)) || (!file.isFile && !canRead) ? (
        <div className={styles.details}>{children}</div>
    ) : (
        <NavLink
            className={styles.details}
            to={`${match.url}${file.isFile ? '/edit' : ''}#${encodePathSegments(join(directory, file.name))}`}
        >
            {children}
        </NavLink>
    );
}, isEqual);

const FileObjectRow = ({ file }: { file: FileObject }) => {
    const { icon, color } = getFileIcon(file);

    return (
        <div
            className={styles.file_row}
            key={file.name}
            onContextMenu={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent(`pterodactyl:files:ctx:${file.key}`, { detail: e.clientX }));
            }}
        >
            <div className={'pl-3'}>
                <SelectFileCheckbox name={file.name} />
            </div>
            <Clickable file={file}>
                <div className={`flex-none ml-3 mr-3 text-base ${color}`}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                <div className={'flex-1 truncate font-medium text-neutral-200'}>{file.name}</div>
                {file.isFile && (
                    <div className={'w-28 text-right mr-4 hidden sm:block text-xs font-mono text-neutral-400'}>
                        {bytesToString(file.size)}
                    </div>
                )}
                <div
                    className={'w-40 text-right mr-4 hidden md:block text-xs text-neutral-500'}
                    title={file.modifiedAt.toString()}
                >
                    {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                        ? format(file.modifiedAt, 'MMM do, yyyy h:mma')
                        : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                </div>
            </Clickable>
            <div className={'pr-3'}>
                <FileDropdownMenu file={file} />
            </div>
        </div>
    );
};

export default memo(FileObjectRow, (prevProps, nextProps) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
    const { isArchiveType: nextIsArchiveType, isEditable: nextIsEditable, ...nextFile } = nextProps.file;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return isEqual(prevFile, nextFile);
});
