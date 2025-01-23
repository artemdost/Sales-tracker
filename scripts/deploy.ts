import hre, { ethers } from "hardhat";

async function main() {
  console.log("Deploying...");
  const [deployer, owner] = await ethers.getSigners();

  const MusicShop = await ethers.getContractFactory("MusicShop");
  const shop = await MusicShop.deploy(owner.address);
  await shop.waitForDeployment();

  const byt = await ethers.encodeBytes32String("53");

  await shop.connect(owner).addAlbum(byt, "aboba", 500000, 5);
  console.log(byt, "aboba", 500000, 5);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
