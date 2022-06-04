export class PlaylistListener {
    public static readonly res_type = 'playco_playlist_listener';

    name: string;
    img_url?: string;

    constructor(playlistListenerObj: Partial<PlaylistListener>) {
        Object.assign(this, playlistListenerObj);
    }
}

export class PlaylistItem {
    public static readonly res_type = 'playco_playlist_item';

    uuid: number;
    index: string;
    name: string;
    data: Record<string, unknown>;

    added_by_uuid: number;
    added_by_nick: string;

    link: string;
    link_type: string;
    link_id: string;

    // will be used in client only
    current_listener: PlaylistListener[] = [];

    constructor(playlistItemObj: Partial<PlaylistItem>) {
        Object.assign(this, { playlistItemObj, current_listener: [] });
    }
}

export class Playlist {
    public static readonly res_type = 'playco_playlist';

    uuid: number;
    index: number;
    name: string;
    description?: string;

    created_by_uuid: number;
    created_by_nick: string;

    blocked_at?: string | null = null;
    why_blocked?: string | null = null;

    public_accessable: boolean;
    public_modifiable: boolean;
    public_item_appendable: boolean;
    public_item_orderable: boolean;
    public_item_deletable: boolean;
    allow_duplicate: boolean;

    items: PlaylistItem[];
    item_count: number;

    // will be used in client only
    participant_count?: number;
    current_listener: PlaylistListener[] = [];
    hash: string = ''

    constructor(playlistObj: Partial<Playlist>) {
        this.uuid = playlistObj.uuid;
        this.index = playlistObj.index;
        this.name = playlistObj.name;

        if (!Object.prototype.hasOwnProperty.call(playlistObj, 'blocked_at')) {
            this.created_by_uuid = playlistObj.created_by_uuid;
            this.created_by_nick = playlistObj.created_by_nick;

            this.public_accessable = playlistObj.public_accessable;
            this.public_modifiable = playlistObj.public_modifiable;
            this.public_item_appendable = playlistObj.public_item_appendable;
            this.public_item_orderable = playlistObj.public_item_orderable;
            this.public_item_deletable = playlistObj.public_item_deletable;
            this.allow_duplicate = playlistObj.allow_duplicate;

            this.hash = playlistObj.hash ?? '';
            this.items = playlistObj.items ?? [];
            this.item_count = playlistObj.item_count ?? this.items.length;

            this.participant_count = playlistObj.participant_count;
        } else {
            this.created_by_uuid = 0;
            this.created_by_nick = '';

            this.public_accessable = false;
            this.public_modifiable = false;
            this.public_item_appendable = false;
            this.public_item_orderable = false;
            this.public_item_deletable = false;
            this.allow_duplicate = false;

            this.hash = playlistObj.hash ?? '';
            this.items = [];
            this.item_count = 0;

            this.blocked_at = playlistObj.blocked_at;
            this.why_blocked = playlistObj.why_blocked;

            this.participant_count = 0;
        }
    }

    get listener(): PlaylistListener[] {
        const result: PlaylistListener[] = [];
        const tmpResultUUIDArray: number[] = [];
        if (this.items) {
            this.items.map((playlistItemValue) => {
                playlistItemValue.current_listener.forEach((playlistItemListenerValue) => {
                    if (tmpResultUUIDArray.includes(playlistItemListenerValue.uuid))
                        return;

                    result.push(playlistItemListenerValue);
                    tmpResultUUIDArray.push(playlistItemListenerValue.uuid);
                });
            });
        }

        return result;
    }

    get asConfig(): PlaylistConfig {
        return new PlaylistConfig({
            name: this.name,
            description: this.description,

            public_accessable: this.public_accessable,
            public_item_appendable: this.public_item_appendable,
            public_item_deletable: this.public_item_deletable,
            public_item_orderable: this.public_item_orderable,
            allow_duplicate: this.allow_duplicate,
        });
    }
}

export class PlaylistConfig {
    name: string;
    description?: string;

    public_accessable?: boolean;
    public_item_appendable?: boolean;
    public_item_orderable?: boolean;
    public_item_deletable?: boolean;
    allow_duplicate?: boolean;

    constructor(playlistConfigObj: Partial<PlaylistConfig>) {
        Object.assign(this, playlistConfigObj);
    }
}
