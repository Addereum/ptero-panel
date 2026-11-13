import styled from 'styled-components/macro';
import tw from 'twin.macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-xs font-medium text-neutral-300 tracking-wide mb-1.5`};
`;

export default Label;
