type ConfigLayout = {
    width: number;
    height: number;
    audiogram: any;
    text: any;
    coverImage: any;
}
type ConfigLayouts = {
    laptop: ConfigLayout;
    phone: ConfigLayout;
    square: ConfigLayout;
}

export enum DisplayType {
    LAPTOP = 'laptop',
    PHONE = 'phone',
    SQUARE = 'square',
};

export type Config = {
    layouts: ConfigLayouts;
    fps: number;
}