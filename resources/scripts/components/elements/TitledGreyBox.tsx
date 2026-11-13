import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div
        className={className}
        style={{
            backgroundColor: '#141a22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
    >
        <div
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.025)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '12px 16px',
            }}
        >
            {typeof title === 'string' ? (
                <p css={tw`text-xs font-semibold uppercase tracking-wider text-neutral-300 m-0`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-400`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div style={{ padding: '16px' }}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
