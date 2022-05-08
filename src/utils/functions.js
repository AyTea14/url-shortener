let processId = randomRange(0, 0xff + 1);
let machineId = randomRange(0, 0xff + 1);
let increment = 0;

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
    createId: () => {
        let time = parseInt(~~(Date.now() / 1000))
            .toString(16)
            .padEnd(8, "0");
        let process_id = parseInt(processId).toString(16).padStart(2, "0");
        let machine_id = parseInt(machineId).toString(16).padStart(2, "0");
        increment++;
        if (increment > 0xf) {
            increment = 0;
            processId = randomRange(0, 0xff + 1);
            machineId = randomRange(0, 0xff + 1);
        }
        return parseInt(time + machine_id + process_id + increment.toString(16), 16).toString(36);
    },
    decodeId: (id) => {
        id = parseInt(id, 36).toString(16);
        let time = parseInt(`0x${id.substring(0, 8)}`);
        let process_id = parseInt(`0x${id.substring(8, 10)}`);
        let machine_id = parseInt(`0x${id.substring(10, 12)}`);
        let increments = parseInt(`0x${id.substring(12, 13)}`);
        return { time, processId: process_id, machineId: machine_id, increment: increments };
    },
};

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
