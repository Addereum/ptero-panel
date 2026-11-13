import React, { useEffect } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

interface ToastItemProps {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title?: string;
    message: string;
    onDismiss: (id: string) => void;
}

const ToastItem = ({ id, type, title, message, onDismiss }: ToastItemProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return { icon: faCheckCircle, bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
            case 'error':
                return { icon: faExclamationCircle, bg: 'bg-red-500/15 text-red-400 border-red-500/30' };
            case 'warning':
                return { icon: faExclamationTriangle, bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' };
            case 'info':
            default:
                return { icon: faInfoCircle, bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
        }
    };

    const { icon, bg } = getIcon();

    return (
        <div
            className={
                'pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-[#141a22]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl transition-all duration-200 w-80 sm:w-96'
            }
            style={{
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
            }}
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${bg}`}>
                <FontAwesomeIcon icon={icon} className={'text-sm'} />
            </div>

            <div className={'flex-1 min-w-0 pt-0.5'}>
                {title && <p className={'text-xs font-semibold text-white tracking-wide leading-tight'}>{title}</p>}
                <p className={'text-xs text-neutral-300 leading-relaxed mt-0.5 break-words'}>{message}</p>
            </div>

            <button
                type={'button'}
                onClick={() => onDismiss(id)}
                className={'text-neutral-500 hover:text-white p-1 transition-colors duration-150 flex-shrink-0 cursor-pointer bg-transparent border-0'}
                aria-label={'Dismiss notification'}
            >
                <FontAwesomeIcon icon={faTimes} className={'text-xs'} />
            </button>
        </div>
    );
};

const ToastContainer = () => {
    const flashes = useStoreState((state: ApplicationStore) => state.flashes.items);
    const dismissFlash = useStoreActions((actions: any) => actions.flashes.dismissFlash);

    // Only display the 4 most recent toasts
    const recentFlashes = flashes.slice(-4);

    if (!recentFlashes.length) {
        return null;
    }

    return (
        <aside
            aria-live={'polite'}
            aria-atomic={'true'}
            className={'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none'}
        >
            <TransitionGroup component={null}>
                {recentFlashes.map((flash) => {
                    const identifier = flash.id || flash.message;
                    return (
                        <CSSTransition key={identifier} timeout={200} classNames={'fade'}>
                            <ToastItem
                                id={identifier}
                                type={flash.type}
                                title={flash.title}
                                message={flash.message}
                                onDismiss={dismissFlash}
                            />
                        </CSSTransition>
                    );
                })}
            </TransitionGroup>
        </aside>
    );
};

export default ToastContainer;
