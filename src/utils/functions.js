let processId = randomRange(0, 0x3f);
let machineId = randomRange(0, 0x3f);
let increment = 0;

const Base62 = (() => {
    let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
    return {
        encode: (integer) => {
            integer = Number.isSafeInteger(integer) ? integer : BigInt(integer);
            if (integer === 0 || (typeof integer == "bigint" && integer === 0n)) return charset[0];

            let s = [];
            while (integer > 0) {
                let bigIntOrNot = typeof integer == "bigint" ? 62n : 62;
                s = [charset[integer % bigIntOrNot], ...s];
                integer = typeof integer == "bigint" ? integer / bigIntOrNot : Math.floor(integer / bigIntOrNot);
            }

            return s.join("");
        },
        decode: (chars) =>
            chars
                .split("")
                .reverse()
                .reduce((prev, curr, i) => prev + charset.indexOf(curr) * 62 ** i, 0),
    };
})();

module.exports = {
    randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    },
    getRandomString: (length = 10) => {
        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    },
    isURL: (url) => {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    },
    createId: (int32 = Date.now()) => {
        const base64 = Base64.fromInt(int32);
        let p_id = Base64.fromInt(processId);
        let m_id = Base64.fromInt(machineId);
        if (increment == 0x3f) {
            processId = randomRange(0, 0x3f);
            machineId = randomRange(0, 0x3f);
            increment = 0;
        }
        increment++;
        return base64 + m_id + p_id + Base64.fromInt(increment);
    },
    /**
     * @param {number} number
     */
    generateId: (number) => {
        const base62 = Base62.encode(number);
        return base62;
    },
};

function getRandomString(length = 10) {
    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
