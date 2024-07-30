const fs = require('fs');
const path = require('path');

const saveUserData = (walletAddress, tokenData) => {
  const usersDir = path.resolve(__dirname, 'users');
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir);
  }

  const filePath = path.join(usersDir, `${walletAddress}.json`);
  const data = {
    wallet_address: walletAddress,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = saveUserData;