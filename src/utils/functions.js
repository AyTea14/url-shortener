let processId = randomRange(0, 0x3f);
let machineId = randomRange(0, 0x3f);
let increment = 0;

const Base64 = (() => {
    let digitsStr = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789${getRandomString(2)}`;
    let digits = digitsStr.split("");
    let digitsMap = {};
    for (let i = 0; i < digits.length; i++) {
        digitsMap[digits[i]] = i;
    }
    return {
        /**
         * @param {number} int32
         * @returns {string}
         */
        fromInt: (int32) => {
            let result = "";
            while (true) {
                result = digits[int32 & 0x3f] + result;
                int32 >>>= 6;
                if (int32 === 0) break;
            }
            return result;
        },
        /**
         * @param {string} digitsStr
         * @returns {number}
         */
        toInt: (digitsStr) => {
            let result = 0;
            let digits = digitsStr.split("");
            for (let i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        },
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
        const base64 = Base64.fromInt(number);
        return base64;
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
