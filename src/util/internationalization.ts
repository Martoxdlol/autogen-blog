import languages from '../../languages.json'
import type { AstroGlobal } from 'astro'

interface Lang {
    code: string
    slug: string
    name: string
}

interface Langs {
    default: string
    list: Array<Lang>
    fromCode: (code: string) => Lang
}

const langs: Langs = {
    ...languages,
    fromCode: (code) => {
        const l = languages.list.find(lang => lang.code == code)
        if (!l) throw new TypeError("Language code not found")
        return l
    }
}

export { langs as languages }
export function getCurrentLang(Astro: AstroGlobal) {
    return langs.fromCode(
        Astro.params.lang?.toLocaleLowerCase() || languages.default
    );
}