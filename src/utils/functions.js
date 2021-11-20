module.exports = {
    randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getRandomInt(max) {
        try {
            return Math.floor(Math.random() * Math.floor(max));
        } catch (e) {}
    },
    getRandomString: (length = 10) => {
        const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    },
};
