import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import requestPasswordResetEmail from '@/api/auth/requestPasswordResetEmail';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import Field from '@/components/elements/Field';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import tw from 'twin.macro';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';

interface Values {
    email: string;
}

export default () => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, addFlash } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const handleSubmission = ({ email }: Values, { setSubmitting, resetForm }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });

            return;
        }

        requestPasswordResetEmail(email, token)
            .then((response) => {
                resetForm();
                addFlash({ type: 'success', title: 'Success', message: response });
            })
            .catch((error) => {
                console.error(error);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            })
            .then(() => {
                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
            });
    };

    return (
        <Formik
            onSubmit={handleSubmission}
            initialValues={{ email: '' }}
            validationSchema={object().shape({
                email: string()
                    .email('A valid email address must be provided to continue.')
                    .required('A valid email address must be provided to continue.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Reset Password'}
                    subtitle={'Enter your email address and we will send you instructions to reset your password.'}
                >
                    <div css={tw`mt-4`}>
                        <Field
                            label={'Email Address'}
                            name={'email'}
                            type={'email'}
                            placeholder={'name@example.com'}
                            disabled={isSubmitting}
                            autoFocus
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
                                'Send Reset Instructions'
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
