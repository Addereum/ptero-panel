import React, { useCallback, useEffect, useState } from 'react';
import getFileContents from '@/api/server/files/getFileContents';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import saveFileContents from '@/api/server/files/saveFileContents';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { useHistory, useLocation, useParams } from 'react-router';
import FileNameModal from '@/components/server/files/FileNameModal';
import Can from '@/components/elements/Can';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import modes from '@/modes';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { encodePathSegments, hashToPath } from '@/helpers';
import { dirname } from 'pathe';
import CodemirrorEditor from '@/components/elements/CodemirrorEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCode, faSave } from '@fortawesome/free-solid-svg-icons';

const getNewFileDraftKey = (uuid: string, directory: string) => `pterodactyl:new-file:${uuid}:${directory}`;

export default () => {
    const [error, setError] = useState('');
    const { action } = useParams<{ action: 'new' | string }>();
    const [loading, setLoading] = useState(action === 'edit');
    const [content, setContent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState('text/plain');

    const history = useHistory();
    const { hash } = useLocation();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const { addError, addFlash, clearFlashes } = useFlash();

    const filePath = hashToPath(hash);
    const fileName = filePath.split('/').pop() || (action === 'new' ? 'untitled' : 'file');
    const directory = action === 'new' ? filePath : dirname(filePath);
    const draftKey = action === 'new' ? getNewFileDraftKey(uuid, directory) : undefined;

    const saveDraft = useCallback(
        (value: string) => {
            if (!draftKey) return;

            if (value.length > 0) {
                sessionStorage.setItem(draftKey, value);
            } else {
                sessionStorage.removeItem(draftKey);
            }
        },
        [draftKey]
    );

    let fetchFileContent: null | (() => Promise<string>) = null;

    useEffect(() => {
        setDirectory(directory);
    }, [directory, setDirectory]);

    useEffect(() => {
        if (!draftKey) return;

        setContent(sessionStorage.getItem(draftKey) || '');
    }, [draftKey]);

    useEffect(() => {
        if (action === 'new') return;

        setError('');
        setLoading(true);
        getFileContents(uuid, filePath)
            .then(setContent)
            .catch((error) => {
                console.error(error);
                setError(httpErrorToHuman(error));
            })
            .then(() => setLoading(false));
    }, [action, uuid, filePath]);

    const save = async (name?: string) => {
        if (!fetchFileContent) {
            return;
        }

        setLoading(true);
        clearFlashes('files:view');

        let redirecting = false;

        try {
            const content = await fetchFileContent();

            await saveFileContents(uuid, name || filePath, content);

            addFlash({
                key: 'files:view',
                type: 'success',
                title: 'Saved',
                message: `File ${name || fileName} has been saved successfully.`,
            });

            if (name) {
                if (draftKey) {
                    sessionStorage.removeItem(draftKey);
                }

                history.push(`/server/${id}/files/edit#/${encodePathSegments(name)}`);
                redirecting = true;
                return;
            }
        } catch (error) {
            console.error(error);
            addError({ message: httpErrorToHuman(error), key: 'files:view' });
        } finally {
            if (!redirecting) {
                setLoading(false);
            }
        }
    };

    // Keyboard shortcut: Cmd+S / Ctrl+S to save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (action !== 'edit') {
                    setModalVisible(true);
                } else {
                    save();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [action, save]);

    if (error) {
        return <ServerError message={error} onBack={() => history.goBack()} />;
    }

    return (
        <PageContentBlock>
            <FlashMessageRender byKey={'files:view'} css={tw`mb-4`} />

            {/* Top Toolbar: Breadcrumbs & Editor Actions */}
            <div className={'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'}>
                <ErrorBoundary>
                    <FileManagerBreadcrumbs withinFileEditor isNewFile={action !== 'edit'} />
                </ErrorBoundary>

                {/* Quick Action Button & Mode Selector */}
                <div className={'flex items-center gap-2 flex-shrink-0'}>
                    <div className={'px-3 py-1.5 rounded-xl bg-[#141a22] border border-white/[0.08] text-xs text-neutral-400'}>
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.currentTarget.value)}
                            className={'bg-transparent text-neutral-300 text-xs border-0 outline-none cursor-pointer'}
                        >
                            {modes.map((m) => (
                                <option key={`${m.name}_${m.mime}`} value={m.mime} className={'bg-[#141a22] text-white'}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className={'hidden md:inline-flex items-center px-2 py-1 rounded-lg bg-white/[0.04] text-[10px] font-mono text-neutral-400 border border-white/[0.06]'}>
                        ⌘S to Save
                    </span>

                    {action === 'edit' ? (
                        <Can action={'file.update'}>
                            <button
                                type={'button'}
                                onClick={() => save()}
                                disabled={loading}
                                className={'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all duration-150 cursor-pointer border-0 disabled:opacity-50'}
                            >
                                <FontAwesomeIcon icon={faSave} className={'text-xs'} />
                                Save
                            </button>
                        </Can>
                    ) : (
                        <Can action={'file.create'}>
                            <button
                                type={'button'}
                                onClick={() => setModalVisible(true)}
                                disabled={loading}
                                className={'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all duration-150 cursor-pointer border-0 disabled:opacity-50'}
                            >
                                <FontAwesomeIcon icon={faFileCode} className={'text-xs'} />
                                Create File
                            </button>
                        </Can>
                    )}
                </div>
            </div>

            {hash.replace(/^#/, '').endsWith('.pteroignore') && (
                <div className={'mb-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-xs leading-relaxed'}>
                    <p className={'m-0'}>
                        You are editing a <code className={'font-mono bg-black/40 px-1 py-0.5 rounded text-white'}>.pteroignore</code>{' '}
                        file. Any files or directories listed in here will be excluded from backups.
                    </p>
                </div>
            )}

            <FileNameModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
                onFileNamed={(name) => {
                    setModalVisible(false);
                    save(name);
                }}
            />

            {/* Monaco/VS-Code Style Editor Frame */}
            <div className={'rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl bg-[#0a0d12] relative'}>
                {/* Editor Header Tab */}
                <div className={'flex items-center justify-between px-4 py-2 bg-[#121820] border-b border-white/[0.08]'}>
                    <div className={'flex items-center gap-2 text-xs font-mono text-neutral-300'}>
                        <FontAwesomeIcon icon={faFileCode} className={'text-cyan-400 text-xs'} />
                        <span className={'text-white font-semibold'}>{fileName}</span>
                    </div>
                    <span className={'text-[11px] text-neutral-500'}>UTF-8</span>
                </div>

                <div className={'relative'}>
                    <SpinnerOverlay visible={loading} />
                    <CodemirrorEditor
                        mode={mode}
                        filename={hash.replace(/^#/, '')}
                        onModeChanged={setMode}
                        initialContent={content}
                        fetchContent={(value) => {
                            fetchFileContent = value;
                        }}
                        onContentSaved={() => {
                            if (action !== 'edit') {
                                setModalVisible(true);
                            } else {
                                save();
                            }
                        }}
                        onContentChanged={action === 'new' ? saveDraft : undefined}
                    />
                </div>
            </div>
        </PageContentBlock>
    );
};
