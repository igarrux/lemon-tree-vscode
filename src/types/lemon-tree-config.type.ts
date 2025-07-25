import { LemonTreeTranslationConfig } from './lemon-tree-translation-config.type.js';

export interface LemonTreeConfig {
    languages: string[];
    sourceLanguage: string;
    cliLanguage?: string;
    default: {
        filePattern: string;
        protectionPattern: string;
        typeDefinition?: {
            file: string;
            exportName: string;
        };
    };
    translations?: LemonTreeTranslationConfig[];
    api: { provider: string; key: string; plugin?: string };
    preScript?: string[];
    postScript?: string[];
    translationFunctionExamples?: string[] | string;
}
