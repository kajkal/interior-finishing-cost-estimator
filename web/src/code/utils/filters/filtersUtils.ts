export type SelectedOptions = Set<string> | 'ALL';

export function isOptionSelected(selectedOptions: SelectedOptions, optionName: string): boolean {
    return areAllOptionsSelected(selectedOptions) || selectedOptions.has(optionName);
}

export function isOptionExclusivelySelected(selectedOptions: SelectedOptions, optionName: string): boolean {
    return !areAllOptionsSelected(selectedOptions) && selectedOptions.has(optionName);
}

export function areAllOptionsSelected(selectedOptions: SelectedOptions): selectedOptions is 'ALL' {
    return selectedOptions === 'ALL';
}


export function stripDiacritics(string: string): string {
    return string.normalize !== undefined
        ? string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : string;
}
