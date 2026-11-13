import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import reinstallServer from '@/api/server/reinstallServer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const skipScripts = ServerContext.useStoreState((state) => state.server.data!.skipScripts);
    const [modalVisible, setModalVisible] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Your server has begun the reinstallation process.',
                });
            })
            .catch((error) => {
                console.error(error);

                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .then(() => setModalVisible(false));
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    if (skipScripts) {
        return (
            <TitledGreyBox title={'Reinstall Server'}>
                <p css={tw`text-sm`}>
                    Reinstalling this server has been disabled because it is configured to skip its egg&apos;s install
                    script. If you would like to reinstall this server, contact a server administrator.
                </p>
            </TitledGreyBox>
        );
    }

    return (
        <div
            className={'rounded-xl overflow-hidden shadow-sm'}
            style={{
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.22)',
            }}
        >
            <Dialog.Confirm
                open={modalVisible}
                title={'Confirm server reinstallation'}
                confirm={'Yes, reinstall server'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
            >
                Your server will be stopped and some files may be deleted or modified during this process, are you sure
                you wish to continue?
            </Dialog.Confirm>
            <div
                style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.15)',
                    padding: '12px 16px',
                }}
            >
                <p className={'text-xs font-semibold uppercase tracking-wider text-red-400 m-0'}>
                    Danger Zone &bull; Reinstall Server
                </p>
            </div>
            <div style={{ padding: '16px' }}>
                <p css={tw`text-sm text-neutral-300`}>
                    Reinstalling your server will stop it, and then re-run the installation script that initially set it
                    up.&nbsp;
                    <strong css={tw`font-medium text-red-300`}>
                        Some files may be deleted or modified during this process, please back up your data before
                        continuing.
                    </strong>
                </p>
                <div css={tw`mt-6 text-right`}>
                    <button
                        type={'button'}
                        onClick={() => setModalVisible(true)}
                        className={
                            'px-4 py-2 rounded-lg text-xs font-semibold tracking-wide bg-red-500/20 hover:bg-red-500/30 border border-red-500/35 text-red-400 transition-all duration-150 cursor-pointer shadow-sm'
                        }
                    >
                        Reinstall Server
                    </button>
                </div>
            </div>
        </div>
    );
};
