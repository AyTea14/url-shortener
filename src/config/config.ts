export const config = {
    port: Number(process.env.PORT),
    shortLength: Number(process.env.SHORT_LENGTH) || 10,
    apiKey: process.env.API_KEY,
    admin: {
        username: process.env.ADMIN_USERNAME,
        pass: process.env.ADMIN_PASS,
    },
};
