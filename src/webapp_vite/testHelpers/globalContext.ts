export function getHubPort() {
    const hubPort: number = (globalThis as any).hubPort; // eslint-disable-line @typescript-eslint/no-explicit-any
    return hubPort;
}
