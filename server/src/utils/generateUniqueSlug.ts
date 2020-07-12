import slugify from 'slugify';


/**
 * Creates slug from given string.
 */
export function generateSlugBase(from: string) {
    return slugify(from, { lower: true, strict: true });
}

/**
 * Based on slug base and array of already taken similar slugs generates new unique slug.
 */
export function generateUniqueSlug(slugBase: string, takenSlugs: string[]): string {
    const sortedTakenSlugs = takenSlugs.sort();
    if (sortedTakenSlugs.includes(slugBase)) {
        for (let i = 1; i < sortedTakenSlugs.length; i++) {
            if (!sortedTakenSlugs[ i ].endsWith(`-${i}`)) {
                return `${slugBase}-${i}`;
            }
        }
        return `${slugBase}-${sortedTakenSlugs.length}`;
    }
    return slugBase;
}
