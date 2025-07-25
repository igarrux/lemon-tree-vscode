import { GetConfig } from "../../_helpers/get-config/get-config";
import { LemonTreeConfig } from "../../types/lemon-tree-config.type";

/**
 * Extracts translation details from a given text line based on provided patterns.
 * It identifies the translation function calls and extracts the key, start and end positions,
 * and the quote type used.
 * @param patterns An array of patterns to match against the text line.
 * @param textLine The line of text to search for translation function calls.
 * Each pattern should represent a translation function call format.
 * For example, patterns could be `['t', 'i18n.t']` to match calls like `t('key')` or `i18n.t('key')`.
 * @returns A function that returns the translation details for the next match.
 */
export const buildGetTranslationDetails = async () => {
	const config = (await GetConfig.config(true)) as LemonTreeConfig;
	const translationExamples = config?.translationFunctionExamples;
	if (!translationExamples) return () => null;

	const patterns: string[] = Array.isArray(translationExamples)
		? translationExamples
		: [translationExamples];

	/**
	 * Extracts the function name from the pattern.
	 * It removes the first part of the pattern that matches the function call,
	 * @param pattern  The pattern to extract the function name from.
	 * @returns  The extracted function name.
	 */
	const extractFnName = (pattern: string) => {
		return pattern.replace(/[(=]['"`]?\$text['"`]?.*/, "").trim();
	};

	// Escapes special characters in the function names to use in regex
	const escapedNames = patterns
		?.map(extractFnName)
		.map((fn) => fn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

	// Sorts the function names by length in descending order to avoid matching shorter names first
	const joinedFns = escapedNames
		.sort((a, b) => b.length - a.length)
		.join("|");

	// Generates a regex to match the function calls and capture the key in group 3
	const regex = new RegExp(
		`(?:^|[^\\w.$])((?:${joinedFns}))\\s*[(=]\\s*(['"\`])((?:\\\\\\2|.)*?)\\2`,
		"g"
	);

	// Returns a function that, when called, will execute the regex on the provided text line
	// and return the details of the translation key if found
	// while loop is used to find all matches in the text line
	return (textLine: string) => {
		if (!textLine) return null;
		const match = regex.exec(textLine);
		if (!match || match.length < 4) return null;
		const quote = match[2];
		const fn = match[1];
		const key = match[3];
		const fnStart = match.index + match[0].indexOf(fn) ;
		const fnEnd = fnStart + fn.length;
		const start = match.index + match[0].indexOf(quote + key + quote);
		const end = start + key?.length;
		return { start, end, quote, key, fnStart, fnEnd };
	};
};
