async function main() {
  
  const subscriptionId = process.env.SUBSCRIPTION_ID;
  const WeatherFactory = await ethers.getContractFactory("WeatherConsumer");
  const weatherContract = await WeatherFactory.deploy(subscriptionId);
  
  console.log('Deploying Contract.');

  await weatherContract.waitForDeployment();

  console.log('Contract deployed successfully.');
  console.log("Contract address:", await weatherContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });