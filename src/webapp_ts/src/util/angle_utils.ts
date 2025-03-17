const ANGLE_CLOSE_ENOUGH = 0.5;

export function anglesCloseEnough(anglesA: number[], anglesB: number[]): boolean {
    for (let i = 0; i < anglesA.length; i++) {
        if (Math.abs(anglesA[i] - anglesB[i]) > ANGLE_CLOSE_ENOUGH) {
            return false;
        }
    }
    return true;
}
