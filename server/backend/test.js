const { ethers } = require("ethers");
const dotenv = require("dotenv");
const { getContractInstance } = require("./getContractInstance"); 

// Load environment variables
dotenv.config();

async function testWebSocketConnection() {
    console.log('=== Testing Avalanche Fuji WebSocket Connection with ethers.js ===\n');
    
    let provider;
    let contract;

    try {
        // Test 1: Create WebSocket provider
        console.log('Test 1: Creating WebSocket provider...');
        provider = new ethers.WebSocketProvider(process.env.FUJI_WS);
        console.log('✅ WebSocket provider created');

        // Test 2: Check network connection
        console.log('\nTest 2: Checking network connection...');
        const network = await provider.getNetwork();
        console.log('✅ Connected to network:', {
            name: network.name,
            chainId: Number(network.chainId)
        });

        // Test 3: Get contract instance
        console.log('\nTest 3: Getting contract instance...');
        contract = getContractInstance();
        console.log('✅ Contract instance created');

        // Test 4: Listen for new blocks
        console.log('\nTest 4: Listening for new blocks (waiting for 1 block)...');
        await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout waiting for new block'));
            }, 30000); // 30 second timeout

            provider.on('block', async (blockNumber) => {
                console.log('✅ New block received:', blockNumber);
                
                // Get block details
                const block = await provider.getBlock(blockNumber);
                console.log('Block timestamp:', new Date(Number(block.timestamp) * 1000).toLocaleString());
                console.log('Block hash:', block.hash);

                clearTimeout(timeoutId);
                resolve();
            });
        });

        // Test 5: Try to read from contract
        console.log('\nTest 5: Reading from contract...');
        // Replace with an actual view function from your contract
        try {
            // Example: assuming your contract has a 'name' function
            const contractData = await contract.name();
            console.log('✅ Successfully read from contract:', contractData);
        } catch (error) {
            console.log('❌ Failed to read from contract:', error.message);
        }

        // Test 6: Listen for contract events
        console.log('\nTest 6: Testing contract event listening...');
        try {
            // Listen for all events for 10 seconds
            await new Promise((resolve) => {
                const timer = setTimeout(resolve, 10000);
                
                contract.on('*', (event) => {
                    console.log('✅ Contract event received:', event);
                    clearTimeout(timer);
                    resolve();
                });
                
                console.log('Listening for events for 10 seconds...');
            });
        } catch (error) {
            console.log('❌ Error listening for events:', error.message);
        }

        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        // Cleanup
        if (provider) {
            console.log('\nClosing WebSocket connection...');
            await provider.destroy();
            console.log('WebSocket connection closed');
        }
        process.exit();
    }
}

// Run the test
testWebSocketConnection().catch(console.error);