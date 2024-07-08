async function main() {

  const transactionsFactory = await hre.ethers.getContractFactory("Goalfi");
  const transactionsContract = await transactionsFactory.deploy();

  await transactionsContract.deployed();
  
  console.log('Contract deployed successfully.');

  console.log("Contract address: ",transactionsContract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });