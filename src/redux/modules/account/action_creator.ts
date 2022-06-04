import { Dispatch } from 'redux';
import { FrostError } from 'src/common/error';
import FrostAPI from '../../../network/api';

import {
    ACCOUNT_FETCHING,
    SIGNED_IN,
    SIGNED_OUT,
    FORCE_SET_ACCOUNTINFO,
} from './action';
import { AccountInfo } from './model';

export const removeFrostErrorFromStateActionCreator = () => (dispatch, getState) => {
    dispatch({
        type: FORCE_SET_ACCOUNTINFO,
        accountInfo: new AccountInfo({
            ...(getState().accountReducer || {}),
            frostErrorObj: undefined,
        }),
    });
};

export const signInActionCreatorAsync = (idOrEmail, password) => async dispatch => {
    dispatch({ type: ACCOUNT_FETCHING });
    return (new FrostAPI())
        .signIn(idOrEmail, password)
        .then(
            (result: FrostAPI) => dispatch({
                type: SIGNED_IN,
                accountInfo: new AccountInfo({
                    isSignedIn: true,
                    uuid: result.userData.uuid,
                    id: result.userData.id,
                    nick: result.userData.nickname,
                    email: result.userData.email,
                    emailVerified: result.userData.email_verified,
                    profileImageUrl: result.userData.profile_image,
                }),
            }),
            (reason: FrostError) => dispatch({
                type: SIGNED_OUT,
                accountInfo: new AccountInfo({
                    isSignedIn: false,
                    frostErrorObj: reason,
                }),
            })
        );
};

export const signUpActionCreatorAsync = (id, email, nick, password) => async dispatch => {
    dispatch({ type: ACCOUNT_FETCHING });
    (new FrostAPI())
        .signUp(id, email, password, nick)
        .then(
            (api: FrostAPI) => {
                if (api.isSignedInWithoutAsync()) {
                    dispatch({
                        type: SIGNED_IN,
                        accountInfo: new AccountInfo({
                            isSignedIn: true,
                            isSignedUp: true,

                            uuid: api.userData.uuid,
                            id: api.userData.id,
                            nick: api.userData.nickname,
                            email: api.userData.email,
                            emailVerified: api.userData.email_verified,
                            profileImageUrl: api.userData.profile_image,
                        }),
                    });
                } else {
                    // User successfully signed up, but needs email verification.
                    dispatch({
                        type: SIGNED_OUT,
                        accountInfo: new AccountInfo({
                            isSignedUp: true,
                        }),
                    });
                }
            },
            (reason: FrostError) => dispatch({
                type: SIGNED_OUT,
                accountInfo: new AccountInfo({
                    isSignedIn: false,
                    frostErrorObj: reason,
                }),
            })
        );
};

export const signOutActionCreatorAsync = () => async dispatch => {
    dispatch({ type: ACCOUNT_FETCHING });
    (new FrostAPI())
        .signOut()
        .finally(
            () => dispatch({
                type: SIGNED_OUT,
                accountInfo: new AccountInfo({ isSignedIn: false }),
            })
        );
};

export const refreshAccessTokenActionCreatorAsync = (forceRefresh = false) => async dispatch => {
    dispatch({ type: ACCOUNT_FETCHING });
    (new FrostAPI())
        .refreshAuthentications(forceRefresh)
        .then((result: FrostAPI) => dispatch({
            type: SIGNED_IN,
            accountInfo: new AccountInfo({
                isSignedIn: true,
                uuid: result.userData.uuid,
                id: result.userData.id,
                nick: result.userData.nickname,
                email: result.userData.email,
                emailVerified: result.userData.email_verified,
                profileImageUrl: result.userData.profile_image,
            }),
        }))
        .catch((reason: FrostError) => dispatch({
            type: SIGNED_OUT,
            accountInfo: new AccountInfo({
                isSignedIn: false,
                frostErrorObj: reason,
            }),
        }));
};

export const accountDeactivateActionCreatorAsync = (email: string, pw: string) => async (dispatch, getState) => {
    // Save previous state before dispatching something.
    const prevState: AccountInfo = getState().accountReducer;

    dispatch({ type: ACCOUNT_FETCHING });
    (new FrostAPI())
        .deactivate(email, pw)
        .then(() => dispatch({
            type: SIGNED_OUT,
            accountInfo: new AccountInfo({ isSignedIn: false }),
        }))
        .catch((reason: FrostError) => dispatch({
            // Guessing out what was the last action using previous account state.
            type: prevState.isSignedIn ? SIGNED_IN : SIGNED_OUT,
            accountInfo: new AccountInfo({
                // Rollback to previous state, and save FrostError obj.
                ...prevState,
                frostErrorObj: reason,
            }),
        }));
};
