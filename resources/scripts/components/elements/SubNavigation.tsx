import styled from 'styled-components/macro';
import tw from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full overflow-x-auto shadow-sm`};
    background-color: rgba(18, 23, 29, 0.78);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    & > div {
        ${tw`flex items-center mx-auto px-4 py-2`};
        max-width: 1200px;
        gap: 6px;

        & > a,
        & > div {
            ${tw`inline-flex items-center py-1.5 px-3 rounded-md text-xs font-medium text-neutral-400 no-underline whitespace-nowrap transition-all duration-150`};
            border: 1px solid transparent;

            &:not(:first-of-type) {
                ${tw`ml-0`};
            }

            &:hover {
                ${tw`text-neutral-100`};
                background-color: rgba(255, 255, 255, 0.05);
            }

            &:active,
            &.active {
                ${tw`text-white`};
                background-color: rgba(59, 130, 246, 0.15);
                border-color: rgba(59, 130, 246, 0.28);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
        }
    }
`;

export default SubNavigation;
