import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import useEventListener from '@/plugins/useEventListener';
import SearchModal from '@/components/dashboard/search/SearchModal';
import Tooltip from '@/components/elements/tooltip/Tooltip';

export default () => {
    const [visible, setVisible] = useState(false);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (['input', 'textarea'].indexOf(((e.target as HTMLElement).tagName || 'input').toLowerCase()) < 0) {
            if (!visible && e.metaKey && e.key.toLowerCase() === '/') {
                setVisible(true);
            }
        }
    });

    return (
        <>
            {visible && <SearchModal appear visible={visible} onDismissed={() => setVisible(false)} />}
            <Tooltip placement={'bottom'} content={'Search (⌘/)'}>
                <button
                    type={'button'}
                    onClick={() => setVisible(true)}
                    className={
                        'flex items-center gap-2 h-8 px-3 rounded-full bg-white/[0.035] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] text-neutral-400 hover:text-neutral-200 text-xs transition-all duration-150 cursor-pointer focus:outline-none'
                    }
                >
                    <FontAwesomeIcon icon={faSearch} className={'text-xs opacity-70'} />
                    <span className={'hidden sm:inline font-normal'}>Search...</span>
                    <span className={'hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-neutral-400 border border-white/[0.06]'}>
                        ⌘/
                    </span>
                </button>
            </Tooltip>
        </>
    );
};
