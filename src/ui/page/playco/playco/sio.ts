import { io, Manager } from 'socket.io-client';
import { FrostError } from 'src/common/error';
import FrostAPI from 'src/network/api';

const SIO_RESP_UNMOUNT_TIMEOUT = 15;
const SIO_DESCRIPTION = '재생목록의 실시간 정보를 받아오기 위한 연결';
const COMMON_ERR_MSG_ADD_MAP = {
    retryAfter5Min: '\n5분 후에 다시 시도해주세요.',
    retryAfter10Min: '\n10분 후에 다시 시도해주세요.',
    retryFullReload: '\n키보드에서 \'F5\' 버튼을 눌러서 새로고침을 해 주세요.',
    retryAfterSignIn: '\n로그인 후 이용해주세요.',
}
const COMMON_ERR_MSG_MAP = {
    safeDisconnected: SIO_DESCRIPTION + '이 종료됐어요.',

    unknownErrorRetry5Min: SIO_DESCRIPTION + '에서\n알 수 없는 문제가 생겼어요,' + COMMON_ERR_MSG_ADD_MAP.retryAfter5Min,
    unknownErrorRetryFullReload: SIO_DESCRIPTION + '에서\n알 수 없는 문제가 생겼어요,' + COMMON_ERR_MSG_ADD_MAP.retryFullReload,
    signInRequired: '이 기능은 로그인 후 사용할 수 있어요,' + COMMON_ERR_MSG_ADD_MAP.retryAfterSignIn,
    signInfoCheckFailed: '로그인 정보를 확인하는 중 문제가 발생했어요,' + COMMON_ERR_MSG_ADD_MAP.retryFullReload,
    connectFailed: SIO_DESCRIPTION + '을 만들지 못했어요,' + COMMON_ERR_MSG_ADD_MAP.retryFullReload,
    unknownDisconnected: SIO_DESCRIPTION + '이\n알 수 없는 이유로 종료됐어요,' + COMMON_ERR_MSG_ADD_MAP.retryFullReload,
    authFailed: SIO_DESCRIPTION + '을 인증하지 못했어요,' + COMMON_ERR_MSG_ADD_MAP.retryFullReload,
    authResponseFailed: SIO_DESCRIPTION + '의 인증 정보를 받지 못했어요.' + COMMON_ERR_MSG_ADD_MAP.retryFullReload,
    unknownAuthFailed: SIO_DESCRIPTION + '을 인증하는 중\n알 수 없는 문제가 생겼어요,' + COMMON_ERR_MSG_ADD_MAP.retryFullReload,
}

interface PlayCoSocketIOResponseType {
    code: number;
    subCode: string;
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
}

export interface PlayCoRoomType {
    playlist_id: number;
    playlist_hash: string;
    participants: {
        [nickname: string]: {
            nickname: string;
            data: Record<string, unknown>;
            status: {
                currently_playing: number;
            };
        }
    };
    current_play_target?: string; // NOT_USED
    db_modified?: boolean;
}

// Generate random safe string, borrowed from FrostAPI implementation
const generateRandomSecureToken = (bytes: number) => {
    const randArray = new Uint32Array(bytes);
    window.crypto.getRandomValues(randArray);
    return buf2hex(randArray);
}

// From https://stackoverflow.com/a/40031979
// Buffer to hex, also borrowed from FrostAPI implementation
const buf2hex = (buffer: ArrayBufferLike) => {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

// From https://stackoverflow.com/a/39977764/5702135
const assign = (target, ...sources) =>
    Object.assign(target, ...sources.map(x =>
        Object.entries(x)
            .filter(([key, value]) => value !== undefined)
            .reduce((obj, [key, value]) => (obj[key] = value, obj), {})
    ))

let playCoSocketIOHandlerInstance: PlayCoSocketIOHandler;
export class PlayCoSocketIOHandler {
    private socketIoMgr: io.Manager;
    private socketIo: io;

    private sioToken: string;
    private sioTokenExpiresAt: Date;
    private csrfToken: string;
    private sessionId: string;

    private prevRoomStatus?: PlayCoRoomType;

    socketIoStatusMessage: string;

    onPlayCoConnected?: () => void;
    onPlaylistModified?: () => void;
    onUserStatusChanged?: (PlayCoRoomType) => void;
    onSocketIOStatusChanged?: (string) => void;

    // UTIL METHOD
    get connected() {
        return this.socketIo.connected;
    }

    // UTIL METHOD
    private getAuthBody(additionalBody?: Record<string, unknown>) {
        return assign(
            {
                sid: this.sessionId,
                sio_token: this.sioToken,
                sio_csrf_token: this.csrfToken,
            },
            additionalBody ?? {}
        )
    }

    // UTIL METHOD
    setSIOStatMsg(newMsg: string) {
        this.socketIoStatusMessage = newMsg;
        try { if (this.onSocketIOStatusChanged) this.onSocketIOStatusChanged(newMsg); } catch (e) { console.log(e); }
    }

    // UTIL METHOD
    defaultErrorHandler(reason: FrostError, shouldDisconnect = true, alternativeShowMsg?: string) {
        const self = this ?? playCoSocketIOHandlerInstance;

        if (typeof (reason) === 'object' && reason.constructor.name === 'FrostError') {
            console.log(reason.message);
            console.log(reason.debugMessage);
            console.log(reason.apiResponse);
        } else {
            console.log(reason);
        }

        // Set error message
        try {
            self.setSIOStatMsg(alternativeShowMsg ?? reason.message);
        } catch (e1) {
            console.log(alternativeShowMsg ?? reason.message);
            console.log(e1);
        }

        // Disconnect from SocketIO.
        if (shouldDisconnect) self.disconnect(false);

        return false;
    }

    // UTIL METHOD
    unsubscribeAllHooks() {
        this.onPlayCoConnected = undefined;
        this.onPlaylistModified = undefined;
        this.onUserStatusChanged = undefined;
        this.onSocketIOStatusChanged = undefined;
    }

    // EVENT HANDLER
    private socketIoEventHandler: Record<string, () => void> = {
        connect: () => {
            this.sessionId = this.socketIo.id;

            // Get SIO Token and register session
            this.refreshSIOToken(undefined, true, true);
        },
        reconnect: () => {
            // Same as connect
            this.sessionId = this.socketIo.id;

            // Get SIO Token and register session
            this.refreshSIOToken(undefined, true, true);
        },
        disconnect: (reason) => {
            console.log(`DISCONNECTED FROM PLAYCO SIO, REASON: ${reason}`)

            // Before disconnect and unconnect all hooks, we need to cleanup the UI if it's possible.
            try {
                if (this.onUserStatusChanged)
                    this.onUserStatusChanged({
                        playlist_id: this.prevRoomStatus?.playlist_id ?? -1,
                        playlist_hash: this.prevRoomStatus?.playlist_hash ?? '',
                        participants: {},
                        db_modified: true,
                    });
            } catch (e) {
                console.log(e);
            }

            this.unsubscribeAllHooks();

            this.sessionId = '';
            this.sioToken = '';
            this.sioTokenExpiresAt = new Date('Thu, 01 Jan 1970 00:00:00 GMT');
            this.csrfToken = generateRandomSecureToken(32);
        },
        REQUEST_RESPONSE_0: (data?: PlayCoSocketIOResponseType) => {
            console.log('Unknown response received! Received data >>> ---------------');
            console.log(data);
            console.log('------------------------------------------------------------');
        },
        PLAYLIST_USER_ENTERED: (data: PlayCoSocketIOResponseType) => {
            // When some user entered to this room
            const roomStatus: PlayCoRoomType = data.data.room;
            this.prevRoomStatus = roomStatus;
            try { if (this.onUserStatusChanged) this.onUserStatusChanged(roomStatus); } catch (e) { console.log(e); }
        },
        PLAYLIST_USER_EXITED: (data: PlayCoSocketIOResponseType) => {
            // When some user exited from this room
            const roomStatus: PlayCoRoomType = data.data.room;
            try { if (this.onUserStatusChanged) this.onUserStatusChanged(roomStatus); } catch (e) { console.log(e); }
        },
        PLAYLIST_MODIFIED: (data: PlayCoSocketIOResponseType) => {
            const roomStatus: PlayCoRoomType = data.data.room;
            const shouldRoomRefreshed: boolean = data.data.room.db_modified ?? false;
            this.prevRoomStatus = roomStatus;
            try { if (this.onUserStatusChanged) this.onUserStatusChanged(roomStatus); } catch (e) { console.log(e); }
            try { if (shouldRoomRefreshed && this.onPlaylistModified) this.onPlaylistModified(); } catch (e) { console.log(e); }
        },
        OFFICIAL_ANNOUNCEMENT: (data?: PlayCoSocketIOResponseType) => {
            // RESERVED
            console.log('OFFICIAL_ANNOUNCEMENT event received! Received data >>> ----');
            console.log(data)
            console.log('------------------------------------------------------------');
        },
    };

    constructor() {
        if (playCoSocketIOHandlerInstance) return playCoSocketIOHandlerInstance;

        this.socketIoMgr = new Manager('https://mudev.cc', {
            reconnectionDelayMax: 5000,
            path: '/api/dev/ws',
            transports: ['websocket',],
            upgrade: false,

            forceNew: false,
            autoConnect: false,

            closeOnBeforeunload: false,
        });

        this.socketIo = this.socketIoMgr.socket('/playco_ws');
        for (const [key, value] of Object.entries(this.socketIoEventHandler)) {
            this.socketIo.on(key, value);
        }

        playCoSocketIOHandlerInstance = this;
    }

    // EVENT MAKER
    private emitEvent(
        event: string,
        data?: Record<string, unknown>,
        onSuccess?: (response: PlayCoSocketIOResponseType) => void,
        onFailure?: (reason: FrostError, response?: PlayCoSocketIOResponseType) => void,
        isRetry?: boolean) {

        const requestId = generateRandomSecureToken(16);
        if (data) {
            data.request_id = requestId;
        } else {
            data = { request_id: requestId };
        }

        const eventName = `REQUEST_RESPONSE_${requestId}`;

        // Unregister request response handler after {SIO_RESP_UNMOUNT_TIMEOUT}sec.
        const eventHandlerTimeoutID = setTimeout(() => {
            console.log(`WARNING: ${eventName} didn't handled in ${SIO_RESP_UNMOUNT_TIMEOUT}sec, and handler is unmounted.`);
            this.socketIo.removeAllListeners(eventName);
        }, SIO_RESP_UNMOUNT_TIMEOUT * 1000);

        const eventHandler = (response?: PlayCoSocketIOResponseType) => {
            clearTimeout(eventHandlerTimeoutID); // This will clear eventHandlerTimeout.

            try {
                if (response?.success) {
                    if (onSuccess) onSuccess(response);
                } else {
                    // Response contains (success == false)
                    let dbgMsg = 'sio:emitEvent error\n';
                    dbgMsg += `(event=${event})=>\n`
                    if (response) {
                        for (const [key, value] of Object.entries(response ?? {})) {
                            if (key !== 'data') {
                                dbgMsg += `response?.${key} = ${value}\n`
                            } else {
                                dbgMsg += `response?.${key} = ${JSON.stringify(value)}\n`
                            }
                        }
                    } else { dbgMsg += `response = ${response}\n`; }

                    if (event === 'playco_connect') {
                        this.defaultErrorHandler(
                            new FrostError(
                                response?.message ?? COMMON_ERR_MSG_MAP.unknownAuthFailed,
                                dbgMsg, response?.code, false),
                            true, COMMON_ERR_MSG_MAP.unknownAuthFailed);
                        return;
                    } else if (isRetry) {
                        this.defaultErrorHandler(
                            new FrostError(
                                response?.message ?? COMMON_ERR_MSG_MAP.unknownAuthFailed,
                                dbgMsg, response?.code, false),
                            true, COMMON_ERR_MSG_MAP.unknownAuthFailed);
                        return;
                    } else if (response?.subCode.startsWith('SIO_TOKEN_')) {
                        // Refresh SIO Token and retry emitEvent.
                        this.refreshSIOToken(() => this.emitEvent(event, data, onSuccess, onFailure, true), false, true);
                        return;
                    } else {
                        this.defaultErrorHandler(
                            new FrostError(
                                response?.message || COMMON_ERR_MSG_MAP.unknownErrorRetry5Min,
                                dbgMsg, response?.code, false),
                            false, COMMON_ERR_MSG_MAP.unknownErrorRetry5Min);
                        return;
                    }
                }
            } catch (e: FrostError) {
                if (onFailure) {
                    try {
                        onFailure(e, response);
                    } catch (e1) {
                        console.log(e);
                        console.log(e1);

                        this.defaultErrorHandler(e, false, COMMON_ERR_MSG_MAP.unknownErrorRetry5Min);
                    }
                }
            }
        };

        this.socketIo.once(eventName, eventHandler);
        this.socketIo.emit(event, data);
    }

    // EVENT MAKER
    private refreshSIOToken(callback: (() => void) = (() => { /* */ }), isOnConnect = false, forceRefresh = false) {
        if (!forceRefresh && this.sioToken && this.sioTokenExpiresAt > new Date()) {
            // We assumes that token is alive.
            // If the callback is emitEvent and server returns SIO_TOKEN_EXPIRED or SIO_TOKEN_INVALID,
            // then emitEvent method will handle it properly.
            try {
                callback();
                return;
            } catch (err) {
                this.defaultErrorHandler(err);
            }
        }

        const frostAPI = new FrostAPI();
        frostAPI
            .isSignedIn(true)
            .then(
                (isSignedIn) => {
                    if (!isSignedIn) { // Check if Frost is signed in.
                        throw new FrostError(
                            COMMON_ERR_MSG_MAP.signInRequired,
                            'on refreshSIOToken, isSignedIn == false', -1, true);
                    } else if (!this.socketIo.connected || !this.sessionId) { // Check if Socket.IO is connected, and every statement is fulfilled.
                        throw new FrostError(
                            COMMON_ERR_MSG_MAP.connectFailed,
                            `this.socketIo.connected = ${this.socketIo.connected}, !this.sessionId = ${this.sessionId}`, -1, false);
                    }

                    // We need to get a new SIO Token by request.
                    this.csrfToken = generateRandomSecureToken(32);
                    return frostAPI
                        .post('playco/socketio/auth', this.getAuthBody(), true)
                        .then(
                            (result) => {
                                if (!result.success) {
                                    throw new FrostError(
                                        COMMON_ERR_MSG_MAP.authResponseFailed,
                                        '/playco/socketio/auth returns response.success == false',
                                        result.code, false, result, undefined, 'playco/socketio/auth');
                                }

                                // Get SIO token from response
                                const sioTokenData: { 'exp': string, 'token': string } = result.data.sio_token;
                                this.sioToken = sioTokenData.token;
                                this.sioTokenExpiresAt = new Date(sioTokenData.exp);

                                // Register session if this function is called on SocketIO onConnect event.
                                if (isOnConnect) {
                                    this.emitEvent(
                                        'playco_connect', this.getAuthBody(),
                                        (response) => ((this.onPlayCoConnected) ? this.onPlayCoConnected() : () => {/* */ }),
                                        // Session creation failed
                                        (reason, response) => this.defaultErrorHandler(reason, true, COMMON_ERR_MSG_MAP.authFailed)
                                    );
                                    return;
                                } else {
                                    callback();
                                    return;
                                }
                            },
                            (reason: FrostError) => { // Failed to get SIO token
                                reason.message = COMMON_ERR_MSG_MAP.authFailed;
                                throw reason;
                            },
                        );
                },
                (reason: FrostError) => {
                    reason.message = COMMON_ERR_MSG_MAP.signInfoCheckFailed;
                    throw reason;
                }
            ).catch(this.defaultErrorHandler);
    }

    // EVENT MAKER
    connect() {
        if (!this.socketIo.connected) // Connect SocketIO if it's not connected.
            // This will fire this.socketIoEventHandler.connect if the connection is successfully established.
            this.socketIo.connect();
    }

    // EVENT MAKER
    disconnect(isSafeDisconnect = true) {
        if (this.socketIo.connected) {
            this.socketIo.disconnect();

            if (isSafeDisconnect)
                this.setSIOStatMsg(COMMON_ERR_MSG_MAP.safeDisconnected);
        }
    }

    // EVENT MAKER
    enterPlaylist(playlistId: number, currentlyPlaying?: number) {
        this.refreshSIOToken(
            () => this.emitEvent(
                'playlist_enter',
                this.getAuthBody(({ playlist_id: playlistId, currently_playing: currentlyPlaying })),
                (response) => { /* */ },
                (reason, response) => { /* */ },
            )
        );
    }

    // EVENT MAKER
    leavePlaylist(playlistId: number) {
        this.refreshSIOToken(
            () => this.emitEvent(
                'playlist_leave',
                this.getAuthBody(({ playlist_id: playlistId })),
                (response) => { /* */ },
                (reason, response) => { /* */ },
            )
        );
    }

    // EVENT MAKER
    setSessionCurrentPlaying(playlistId: number, currentPlaying: number) {
        this.refreshSIOToken(
            () => this.emitEvent(
                'playlist_set_status',
                this.getAuthBody(({ playlist_id: playlistId, currently_playing: currentPlaying })),
                (response) => { /* */ },
                (reason, response) => { /* */ },
            )
        );
    }
}
