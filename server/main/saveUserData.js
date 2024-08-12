const fs = require('fs');
const path = require('path');

// Function to save or update user data in a JSON file
const saveUserData = (walletAddress, userId, tokenData) => {
  try {
    // Define the path to the 'users' directory
    const usersDir = path.resolve(__dirname, 'users');

    // Ensure the 'users' directory exists
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true });
    }

    // Define the path to the users.json file within the 'users' directory
    const filePath = path.join(usersDir, 'users.json');

    let usersData = {};

    // Read existing data from the file if it exists
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      usersData = JSON.parse(fileData);
    }

    // Update or add the user's data
    usersData[walletAddress] = {
      'ID': userId,
      'Access Token': tokenData.access_token,
      'Refresh Token': tokenData.refresh_token,
      'Expires At': Date.now() + (tokenData.expires_in * 1000), // Save the expiry time in milliseconds
    };

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2));
    console.log(`User data for ${walletAddress} with ID ${userId} saved successfully.`);
  } catch (error) {
    console.error(`Error saving user data for ${walletAddress}:`, error.message);
  }
};

module.exports = saveUserData;
