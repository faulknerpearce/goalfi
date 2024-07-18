# Goalfi 🏁
An accountability platform to reach your goals and take responsibility for your progress.

![Alt text](client/images/goalfi.png)

## Introduction
Goalfi is a decentralized web application that leverages blockchain technology to streamline the way individuals track and accomplish their goals. 
By staking tokens as a commitment to their activity, users are held accountable for their progress. If a goal is not met, the tokens are forfeited and redistributed among users who have successfully accomplished their goals. 
This unique approach adds a competitive edge and fosters collective responsibility and gamifies the process of personal achievements.

## Overview
Goalfi is designed to motivate and reward users for accomplishing quantifiable goals. Users can join predefined goals, stake a certain amount of cryptocurrency, and claim rewards upon goal completion within the stipulated timeframe.
Upgoaled is built in solidity and uses Chainlink Functions for secure and reliable data feeds. The smart contract handles the staking, tracking, and reward distribution, ensuring a robust and transparent application.

## Features and Functionalities
### User Onboarding:
- Seamless wallet connection: Users can connect their wallets like MetaMask to the platform with ease.
- Goal browsing: A variety of tailored goals are available to be selected by the users.

### Goal Selection and Staking:
- Users can join a goal by pledging an amount of Cryptocurrency to a goal pool within the smart contract.
- The staked amount is securely locked in the smart contract until the goal's expiration date.

### Tracking and Goal Verification:
- Activity tracking: Quantifiable activities are tracked via an API.
- Progress: Progress of a users goal from an API is passed to in the smart contract using chainlink functions for secure data verification.
- Progress visualization: Users can visualize their progress towards the goal on the platform's user-friendly interface.

### Goal Completion and Reward Distribution:
- Upon successful completion of the goal within the specified timeframe, users can claim their rewards.
- Rewards are automatically distributed to eligible users upon successful claim.
- Unclaimed rewards are redistributed among users who completed the goal.
- Users forfeiting their staked amount if the goal is not completed within the timeframe.

### Front End and User Interface:
- The platform provides an intuitive interface for browsing goals, tracking progress, and claiming rewards.
- The responsive design ensures compatibility across various screen sizes and devices.