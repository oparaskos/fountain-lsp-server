export interface FountainCharacterConfig {
    'racial identity'?: string;
    gender?: string;
}

export interface FountainRC {
    locale?: string;
    characters?: Record<string, FountainCharacterConfig>;
}
