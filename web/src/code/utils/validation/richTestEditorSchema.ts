import { SlateDocument, SlateDocumentDescendant } from '@udecode/slate-plugins';


function isSlateChildNotEmpty({ text, children }: SlateDocumentDescendant) {
    if (text || (Array.isArray(children) && children.length > 1)) {
        return true;
    }
    return Array.isArray(children) && children.some(isSlateChildNotEmpty);
}

export function isSlateDocumentNotEmpty(document: SlateDocument): document is SlateDocument {
    return document.some(isSlateChildNotEmpty);
}

export function isSlateDocumentEmpty(document: SlateDocument): boolean {
    return !isSlateDocumentNotEmpty(document);
}
