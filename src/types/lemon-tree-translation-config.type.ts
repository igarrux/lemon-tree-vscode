export interface LemonTreeTranslationConfig {
    lang: string;
    filePattern?: string;
    protectionPattern?: `${string}key${string}`;
    typeDefinition?: {
        file: string;
        exportName: string;
    };
}