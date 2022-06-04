import { FrostError } from "src/common/error";

export interface AccountActionType {
    type: string;
    accountInfo: AccountInfo;
}

export interface AccountReducerType {
    (state?: AccountInfo, action: AccountActionType): AccountInfo;
}

export class AccountInfo {
    isFetching: boolean = false;
    isSignedIn: boolean | undefined = undefined;
    isSignedUp: boolean | undefined = undefined;

    uuid: number = -1;
    id: string = '';
    nick: string = '';
    email: string = '';
    emailVerified: boolean = false;
    profileImageUrl?: string;

    frostErrorObj?: FrostError;

    public constructor(accountInfoObj: Partial<AccountInfo> = {}) {
        Object.assign(this, accountInfoObj);
    }
}
