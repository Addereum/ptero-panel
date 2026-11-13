import * as React from 'react';
import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components/macro';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const styling = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return tw`bg-red-500/10 border-red-500/30 text-red-200`;
        case 'info':
            return tw`bg-blue-500/10 border-blue-500/30 text-blue-200`;
        case 'success':
            return tw`bg-green-500/10 border-green-500/30 text-green-200`;
        case 'warning':
            return tw`bg-yellow-500/10 border-yellow-500/30 text-yellow-200`;
        default:
            return '';
    }
};

const getBackground = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return tw`bg-red-500/20 text-red-300 border border-red-500/30`;
        case 'info':
            return tw`bg-blue-500/20 text-blue-300 border border-blue-500/30`;
        case 'success':
            return tw`bg-green-500/20 text-green-300 border border-green-500/30`;
        case 'warning':
            return tw`bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
        default:
            return '';
    }
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`p-3 border items-center leading-normal rounded-xl flex w-full text-sm backdrop-blur-sm`};
    ${(props) => styling(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => (
    <Container css={tw`lg:inline-flex`} $type={type} role={'alert'}>
        {title && (
            <span
                className={'title'}
                css={[
                    tw`flex rounded-full uppercase px-2 py-1 text-xs font-bold mr-3 leading-none`,
                    getBackground(type),
                ]}
            >
                {title}
            </span>
        )}
        <span css={tw`mr-2 text-left flex-auto`}>{children}</span>
    </Container>
);
MessageBox.displayName = 'MessageBox';

export default MessageBox;
