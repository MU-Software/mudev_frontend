import {
  ACCOUNT_FETCHING,
  SIGNED_IN,
  SIGNED_OUT,
  FORCE_SET_ACCOUNTINFO,
} from './action';
import {
  signInActionCreatorAsync,
  signUpActionCreatorAsync,
  signOutActionCreatorAsync,
  refreshAccessTokenActionCreatorAsync,
  accountDeactivateActionCreatorAsync,
  setAccountInfoForceActionCreator,
} from './action_creator';
import { AccountReducerType, AccountInfo } from './model';

const initialAccountState = new AccountInfo({ isSignedIn: undefined });

export const accountReducer: AccountReducerType = (state = initialAccountState, action) => {
  switch (action.type) {
    case ACCOUNT_FETCHING:
      return new AccountInfo({
        ...state,
        isFetching: true,
      });
    case SIGNED_IN:
      return action.accountInfo;
    case SIGNED_OUT:
      return action.accountInfo;
    case FORCE_SET_ACCOUNTINFO:
      return action.accountInfo;
    default:
      break;
  }
  return state;
}
