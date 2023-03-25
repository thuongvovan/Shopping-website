require('dotenv').config();

const siteUtilities = {};

siteUtilities.createSiteURL = () => {
    const { PROTOCOL, DOMAIN, PORT, ENV } = process.env;
    let port = `:${PORT}`;
    if ((PROTOCOL === 'http' && PORT === 80) || (PROTOCOL === 'https' && PORT === 443)) {
        port = '';
    }
    if (ENV === 'production') {
        port = '';
    }
    return `${PROTOCOL}://${DOMAIN}${port}`;
};

module.exports = siteUtilities;
