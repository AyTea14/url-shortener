export const Base62 = (() => {
    let charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return {
        encode: (integer: number | bigint) => {
            integer = Number.isSafeInteger(integer) ? integer : BigInt(integer);
            if (integer === 0 || (typeof integer == "bigint" && integer === 0n)) return charset[0];

            let s: string[] = [];
            while (integer > 0) {
                let intOrBigInt = typeof integer == "bigint" ? 62n : 62;
                s = [charset[Number(integer) % Number(intOrBigInt)], ...s];
                integer = typeof integer == "bigint" ? integer / BigInt(intOrBigInt) : Math.floor(integer / Number(intOrBigInt));
            }

            return s.join("");
        },
        decode: (chars: string) =>
            chars
                .split("")
                .reverse()
                .reduce((prev, curr, i) => {
                    const decoded = prev + BigInt(charset.indexOf(curr)) * 62n ** BigInt(i);
                    if (typeof decoded === "bigint" || !Number.isSafeInteger(decoded)) {
                        return BigInt(decoded);
                    }
                    return decoded;
                }, 0n),
    };
})();
