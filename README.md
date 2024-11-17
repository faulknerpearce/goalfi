# Goalfi 🏁
## A web3 application designed to motivate goal completion. 

![Alt text](client/images/goalfi.png)

## Introduction
Goalfi is designed to motivate users to accomplish quantifiable goals by combining financial commitment with personal accountability. Users are held accountable for their progress by pledging funds to join predefined goals. Upon goal completion within the stipulated timeframe, users may claim rewards and their initial pledge. If they fail, the pledge is forfeited and redistributed to users who completed the goal. This approach adds a competitive edge, fosters collective responsibility, and gamifies the process of personal achievements.


## Overview
Built in Solidity and integrated with Chainlink Functions, Goalfi ensures secure and reliable data feeds. The smart contract manages goal creation, staking, progress tracking, and reward distribution, offering a robust and transparent experience.

#### Wallet and API Connection
The application integrates with blockchain wallets and links to external APIs to facilitate user authentication and transactions. Operating on the Avalanche Fuji testnet, the system delivers decentralized, secure operations powered by a reliable smart contract backend.


## Features
### Goal Selection and Staking
- Users participate in predefined goals that specify activity type, distance, and duration. 
- Before the goal's start date, users join by staking their desired amount of cryptocurrency. 
- Once staked, the funds are locked until the goal expires. 

### Tracking and Goal Verification 
- The application fetches user progress from an external API and passes the data to the smart contract using Chainlink Functions for secure verification. 
- The smart contract evaluates progress against the goal criteria, marking failures for unmet goal requirements. 
- The smart contract records critical data such as activity, distance covered, and when the activity was recorded. 

### Goal Completion and Reward Distribution
- After the goal expires, the smart contract evaluates user progress based on recorded data. 
- Users who meet the goal criteria claim their pledge along with a share of forefeited pledges, minus platform fees. 
- The rewards are distributed directly to users' wallets.

