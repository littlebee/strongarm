// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classnames(...args: any[]): string {
    let classes = "";
    for (const arg of args) {
        if (!arg) {
            continue;
        }
        if (typeof arg === "object") {
            if (arg.predicate) {
                classes += ` ${arg.value.toString()}`;
            }
        } else {
            classes += ` ${arg.toString()}`;
        }
    }
    return classes;
}
