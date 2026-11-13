import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import tw from 'twin.macro';

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [email, setEmail] = useState('');

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const parsed = new URLSearchParams(location.search);
    if (email.length === 0 && parsed.get('email')) {
        setEmail(parsed.get('email') || '');
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation })
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/';
            })
            .catch((error) => {
                console.error(error);

                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={object().shape({
                password: string()
                    .required('A new password is required.')
                    .min(8, 'Your new password should be at least 8 characters in length.'),
                passwordConfirmation: string()
                    .required('Your new password does not match.')
                    // @ts-expect-error this is valid
                    .oneOf([ref('password'), null], 'Your new password does not match.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer
                    title={'Set New Password'}
                    subtitle={'Please choose and confirm your new account password.'}
                >
                    <div css={tw`mt-2`}>
                        <label css={tw`block text-xs font-medium text-neutral-300 tracking-wide mb-1.5`}>
                            Email Address
                        </label>
                        <Input value={email} disabled />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field
                            label={'New Password'}
                            name={'password'}
                            type={'password'}
                            placeholder={'••••••••'}
                            description={'Passwords must be at least 8 characters in length.'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-4`}>
                        <Field
                            label={'Confirm New Password'}
                            name={'passwordConfirmation'}
                            type={'password'}
                            placeholder={'••••••••'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <button
                            type={'submit'}
                            disabled={isSubmitting}
                            css={[
                                tw`w-full py-3 px-4 rounded-xl font-medium text-sm text-white flex items-center justify-center transition-all duration-150 border-0 cursor-pointer`,
                                isSubmitting
                                    ? tw`bg-blue-600/70 cursor-not-allowed`
                                    : tw`bg-blue-600 hover:bg-blue-500 active:scale-[0.99]`,
                            ]}
                            style={{
                                boxShadow: isSubmitting ? 'none' : '0 10px 25px -5px rgba(37, 99, 235, 0.35)',
                            }}
                        >
                            {isSubmitting ? (
                                <div css={tw`w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin`} />
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </div>
                    <div css={tw`mt-5 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs font-medium text-neutral-400 hover:text-white transition-colors duration-150 no-underline`}
                        >
                            &larr; Return to Sign In
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
