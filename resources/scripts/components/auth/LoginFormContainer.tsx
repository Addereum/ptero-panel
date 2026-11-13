import React, { forwardRef } from 'react';
import { Form } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
    subtitle?: string;
};

export default forwardRef<HTMLFormElement, Props>(({ title, subtitle, ...props }, ref) => {
    const siteName = useStoreState((state) => state.settings.data?.name) || 'Pterodactyl';

    return (
        <div css={tw`w-full max-w-[440px] mx-auto relative z-10`}>
            {/* Glassmorphism Auth Card */}
            <div
                css={tw`rounded-2xl p-6 sm:p-8 relative border`}
                style={{
                    backgroundColor: 'rgba(20, 26, 34, 0.88)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
                }}
            >
                {/* Header */}
                <div css={tw`mb-6`}>
                    <div
                        css={tw`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border`}
                        style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                            boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.25)',
                        }}
                    >
                        <img src={'/assets/svgs/pterodactyl.svg'} css={tw`w-7 h-7 object-contain`} alt={siteName} />
                    </div>

                    <div css={tw`flex items-center gap-2 mb-1`}>
                        <span css={tw`text-xs font-semibold tracking-wider uppercase text-blue-400`}>
                            {siteName}
                        </span>
                    </div>

                    <h1 css={tw`text-2xl font-bold tracking-tight text-white m-0`}>
                        {title || 'Sign In'}
                    </h1>

                    <p css={tw`text-sm text-neutral-400 mt-1 mb-0`}>
                        {subtitle || 'Enter your credentials to access your account.'}
                    </p>
                </div>

                {/* Alerts */}
                <FlashMessageRender css={tw`mb-5`} />

                {/* Auth Form */}
                <Form {...props} ref={ref}>
                    {props.children}
                </Form>
            </div>

            {/* Footer */}
            <p css={tw`text-center text-xs text-neutral-500 mt-6`}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    rel={'noopener nofollow noreferrer'}
                    href={'https://pterodactyl.io'}
                    target={'_blank'}
                    css={tw`no-underline text-neutral-400 hover:text-white transition-colors duration-150`}
                >
                    Pterodactyl Software
                </a>
            </p>
        </div>
    );
});
