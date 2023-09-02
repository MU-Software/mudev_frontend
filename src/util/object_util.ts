export const filterRecord: (obj: Record<string, unknown>) => Record<string, unknown> = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(e=>!e[1]));
}
