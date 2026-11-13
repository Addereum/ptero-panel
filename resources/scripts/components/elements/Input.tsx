import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

const light = css<Props>`
    ${tw`text-neutral-100`};
    background-color: rgba(13, 18, 25, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    &:focus {
        ${tw`border-blue-500`}
    }

    &:disabled {
        ${tw`opacity-60`};
    }
`;

const checkboxStyle = css<Props>`
    ${tw`bg-neutral-500 cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4 text-primary-400 border border-neutral-300 rounded-sm`};
    color-adjust: exact;
    background-origin: border-box;
    transition: all 75ms linear, box-shadow 25ms linear;

    &:checked {
        ${tw`border-transparent bg-no-repeat bg-center`};
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
        background-color: currentColor;
        background-size: 100% 100%;
    }

    &:focus {
        ${tw`outline-none border-primary-300`};
        box-shadow: 0 0 0 1px rgba(9, 103, 210, 0.25);
    }
`;

const inputStyle = css<Props>`
    // Reset to normal styling.
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0`};
    ${tw`px-3.5 py-2.5 border rounded-xl text-sm transition-all duration-150`};
    ${tw`border-neutral-700 hover:border-neutral-500 text-neutral-100 shadow-none focus:ring-0 placeholder-neutral-500`};
    background-color: rgba(13, 18, 25, 0.9);

    & + .input-help {
        ${tw`mt-1.5 text-xs`};
        ${(props) => (props.hasError ? tw`text-red-300` : tw`text-neutral-400`)};
    }

    &:required,
    &:invalid {
        ${tw`shadow-none`};
    }

    &:not(:disabled):not(:read-only):focus {
        ${tw`border-blue-500 ring-2 ring-blue-500/20`};
        ${(props) => props.hasError && tw`border-red-400 ring-red-400/20`};
    }

    &:disabled {
        ${tw`opacity-60 cursor-not-allowed`};
        background-color: rgba(30, 38, 51, 0.4);
    }

    ${(props) => props.isLight && light};
    ${(props) => props.hasError && tw`text-red-200 border-red-500 hover:border-red-400`};
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            ${tw`rounded-full`};
        }
    }
`;
const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
