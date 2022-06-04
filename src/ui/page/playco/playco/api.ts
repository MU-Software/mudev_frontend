import { FrostError } from "src/common/error";
import FrostAPI from "src/network/api";

import {
    PlaylistListener,
    PlaylistItem,
    Playlist,
    PlaylistConfig,
} from "./model";

export class PlayCoAPI {
    static url(playlistId?: number) { return `playco/playlists/${playlistId ?? ''}`; }
    static itemUrl(playlistId: number, itemIndex?: number) {
        if (!playlistId)
            throw new FrostError(
                '예상하지 못한 문제가 생겼어요,\n10분 후에 다시 시도해주세요.',
                'itemUrl is undefined or null',
                -1, false);
        return `playco/playlists/${playlistId}/items/${itemIndex ?? ''}`;
    }

    static getAllPlaylists() {
        return (new FrostAPI())
            .get(PlayCoAPI.url(), true)
            .then((result) => {
                // Possible response
                // - multiple_resources_found(200)
                // - resource_not_found(404)
                if (result.code === 200 && result.subCode === 'resource.multiple_result') {
                    return result.data.playco_playlists.map((v, i, a) => new Playlist(v));
                } else if (result.code === 404 && result.subCode === 'resource.not_found') {
                    return [];
                } else {
                    throw new FrostError(
                        '알 수 없는 문제가 생겼어요,\n10분 후에 다시 시도해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getAllPlaylists`,
                        result.code, false, result, undefined, PlayCoAPI.url());
                }
            });
    }

    // get playlistHashAsync(playlistId: number) {
    //     return (new FrostAPI())
    //         .head
    // }

    static getPlaylistInfo(playlistId: number) {
        return (new FrostAPI())
            .get(PlayCoAPI.itemUrl(playlistId), true)
            .then((result) => {
                // Possible response
                // - resource_found(200)
                // - resource_forbidden(403)
                // - resource_not_found(404)
                if (result.code === 200 && result.subCode === 'resource.result') {
                    const playlistObj = new Playlist({ ...result.data.playco_playlist, hash: result.header.get('etag') });
                    return playlistObj;
                } else if (result.code === 403 && result.subCode === 'resource.forbidden') {
                    throw new FrostError(
                        '해당 재생목록을 볼 권한이 없어요,\n권한과 재생목록 ID를 확인 후 다시 접속해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getPlaylistInfo`,
                        result.code, false, result, undefined, PlayCoAPI.itemUrl(playlistId));
                } else if (result.code === 404 && result.subCode === 'resource.not_found') {
                    throw new FrostError(
                        '해당 재생목록을 찾을 수 없어요,\n재생목록 ID를 다시 확인해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getPlaylistInfo`,
                        result.code, false, result, undefined, PlayCoAPI.itemUrl(playlistId));
                } else {
                    throw new FrostError(
                        '알 수 없는 문제가 생겼어요,\n10분 후에 다시 시도해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getPlaylistInfo`,
                        result.code, false, result, undefined, PlayCoAPI.itemUrl(playlistId));
                }
            });
    }

    static createPlaylist(payload: PlaylistConfig) {
        return (new FrostAPI())
            .post(PlayCoAPI.url(), payload, true)
            .then(
                (result) => {
                    if (!result.success) {
                        if (result.subCode === 'resource.unique_failed') {
                            throw new FrostError(
                                '계정 당 재생목록을 5개까지만 만드실 수 있어요,\n기존의 재생목록을 지워주세요.',
                                `${result.code} - ${result.subCode} raised on PlayCoAPI.createPlaylist`,
                                result.code, false, result, undefined, PlayCoAPI.url());
                        } else {
                            throw new FrostError(
                                '알 수 없는 문제가 생겼어요,\n10분 후에 다시 시도해주세요.',
                                `${result.code} - ${result.subCode} raised on PlayCoAPI.createPlaylist`,
                                result.code, false, result, undefined, PlayCoAPI.url());
                        }
                    }
                    return result;
                },
                (reason: FrostError) => {
                    throw reason;
                }
            );
    }

    static modifyPlaylist(playlistId: number, data: PlaylistConfig, hash: string) {
        return (new FrostAPI())
            .patch(PlayCoAPI.url(playlistId), data, true, { 'If-Match': hash })
            .then((result) => {
                // Possible response
                // - resource_modified(201)
                // - resource_forbidden(403)
                // - resource_not_found(404)
                if (200 <= result.code && result.code <= 399) {
                    return result;
                } else if (result.subCode === 'resource.forbidden') {
                    throw new FrostError(
                        '해당 재생목록을 볼 권한이 없어요,\n권한과 재생목록 ID를 확인 후 다시 접속해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getPlaylistInfo`,
                        result.code, false, result, undefined, PlayCoAPI.url(playlistId));
                } else if (result.subCode === 'resource.not_found') {
                    throw new FrostError(
                        '해당 재생목록을 찾을 수 없어요,\n재생목록 ID를 다시 확인해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getPlaylistInfo`,
                        result.code, false, result, undefined, PlayCoAPI.url(playlistId));
                } else if (result.subCode === 'resource.prediction_failed') {
                    throw new FrostError(
                        '재생목록이 다른 곳에서 수정됐어요,\n"재생목록 새로고침" 버튼을 누르신 후 다시 시도해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getPlaylistInfo`,
                        result.code, false, result, undefined, PlayCoAPI.url(playlistId));
                } else {
                    throw new FrostError(
                        '알 수 없는 문제가 생겼어요,\n10분 후에 다시 시도해주세요.',
                        `${result.code} - ${result.subCode} raised on PlayCoAPI.getPlaylistInfo`,
                        result.code, false, result, undefined, PlayCoAPI.url(playlistId));
                }
            });
    }

    static deletePlaylist(playlistId: number) {
        return (new FrostAPI())
            .delete(PlayCoAPI.url(playlistId), true)
    }

    static getPlaylistItems(playlistId: number) {
        return (new FrostAPI())
            .get(PlayCoAPI.itemUrl(playlistId), true)
    }

    static insertPlaylistItem(playlistId: number, itemUrl: string, hash: string) {
        return (new FrostAPI())
            .post(PlayCoAPI.itemUrl(playlistId), { link: itemUrl }, true, { 'If-Match': hash })
    }

    static movePlaylistItem(playlistId: number, link: string, newIndex: number, hash: string) {
        return (new FrostAPI())
            .patch(PlayCoAPI.itemUrl(playlistId, newIndex), {link: link}, true, { 'If-Match': hash })
    }

    static deletePlaylistItem(playlistId: number, itemIndex: number, hash: string) {
        return (new FrostAPI())
            .delete(PlayCoAPI.itemUrl(playlistId, itemIndex), true, { 'If-Match': hash })

    }
}
