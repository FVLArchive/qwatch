export interface IImage {
    image_uri: string;
};

export interface ISelectItemInfo {
    key: string;
    synonyms: string[];
};



// Carousel
export interface ICarouselItem {
    info: ISelectItemInfo;
    title: string;
    description?: string;
    image?: IImage;
};

export interface ICarousel {
    items: ICarouselItem[];
};



// SimpleResponses
export interface ISimpleResponse {
    ssml?: string;
    text_to_speech?: string;
    displayText?: string;
};

export interface ISimpleResponses {
    simpleResponses: ISimpleResponse[];
};



// List Select
export interface IListSelectItem {
    info: ISelectItemInfo;
    title: string;
    description?: string;
    image?: IImage;
};

export interface IListSelect {
    title?: string;
    items: IListSelectItem[];
};



// Suggestions
export interface ISuggestion {
    title: string;
};

export interface ISuggestions {
    suggestions: ISuggestion[];
};



// Generic List Item
export interface IDisplayable extends IDisplayableSimple {
    info: {
        key: string;
        synonyms: string[];
    }
}

export interface IDisplayableSimple {
    title?: string;
    description: string;
    image_uri?: string;
}

export interface IMessage {
    platform?: string;
    simpleResponses?: ISimpleResponses;
    listSelect?: IListSelect;
    carouselSelect?: ICarousel;
    suggestions?: ISuggestions
};

export enum Platform {
    'PLATFORM_UNSPECIFIED',
    'FACEBOOK',
    'SLACK',
    'TELEGRAM',
    'KIK',
    'SKYPE',
    'LINE',
    'VIBER',
    'ACTIONS_ON_GOOGLE',
};

