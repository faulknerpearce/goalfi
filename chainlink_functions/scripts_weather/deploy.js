async function main() {

    const subscriptionId = process.env.SUBSCRIPTION_ID;

    const StravaFactory = await ethers.getContractFactory("WeatherConsumer");
    const StravaContract = await StravaFactory.deploy(subscriptionId);
    
    console.log('Deploying Contract.');
  
    await StravaContract.waitForDeployment();
  
    console.log('Contract deployed successfully.');
    console.log("Contract address:", await StravaContract.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });