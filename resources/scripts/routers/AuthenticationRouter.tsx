import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useHistory, useLocation } from 'react-router';

export default () => {
    const history = useHistory();
    const location = useLocation();
    const { path } = useRouteMatch();

    return (
        <div className={'min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#090d12]'}>
            {/* Ambient glowing gradient orbs (matching beta.juro-digital.de) */}
            <div className={'absolute -left-32 top-10 h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none'} />
            <div className={'absolute -right-32 bottom-10 h-[460px] w-[460px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none'} />
            <div className={'absolute left-1/2 -top-40 -translate-x-1/2 h-[380px] w-[700px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none'} />

            <div className={'w-full max-w-md relative z-10'}>
                <Switch location={location}>
                    <Route path={`${path}/login`} component={LoginContainer} exact />
                    <Route path={`${path}/login/checkpoint`} component={LoginCheckpointContainer} />
                    <Route path={`${path}/password`} component={ForgotPasswordContainer} exact />
                    <Route path={`${path}/password/reset/:token`} component={ResetPasswordContainer} />
                    <Route path={`${path}/checkpoint`} />
                    <Route path={'*'}>
                        <NotFound onBack={() => history.push('/auth/login')} />
                    </Route>
                </Switch>
            </div>
        </div>
    );
};
