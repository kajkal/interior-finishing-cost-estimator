import { SlateDocument, SlateDocumentDescendant } from '@udecode/slate-plugins';


function verifyIfChildIsNotEmpty({ text, children }: SlateDocumentDescendant) {
    if (text || (Array.isArray(children) && children.length > 1)) {
        return true;
    }
    return Array.isArray(children) && children.some(verifyIfChildIsNotEmpty);
}

export function verifyIfDocumentIsNotEmpty(document: SlateDocument): boolean {
    return document.some(verifyIfChildIsNotEmpty);
}
