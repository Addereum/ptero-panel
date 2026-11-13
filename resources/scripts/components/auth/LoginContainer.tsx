import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);

                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Sign In'}
                    subtitle={'Enter your username or email and password to continue.'}
                >
                    <div>
                        <Field
                            type={'text'}
                            label={'Username or Email'}
                            name={'username'}
                            placeholder={'Enter username or email'}
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>
                    <div css={tw`mt-4`}>
                        <div css={tw`flex items-center justify-between mb-1.5`}>
                            <label css={tw`block text-xs font-medium text-neutral-300 tracking-wide`}>
                                Password
                            </label>
                            <Link
                                to={'/auth/password'}
                                css={tw`text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors duration-150 no-underline`}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Field
                            type={'password'}
                            name={'password'}
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
                                'Sign In'
                            )}
                        </button>
                    </div>
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
