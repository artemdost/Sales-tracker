import { loadFixture, ethers, expect } from "./setup";
import { AlbumTracker, Album__factory } from "../typechain-types";
import { BaseContract, ContractTransactionReceipt } from "ethers";

describe("AlbumTracker", function () {
  async function deploy() {
    const [owner, buyer] = await ethers.getSigners();

    const AlbumTracker = await ethers.getContractFactory("AlbumTracker");

    const tracker = await AlbumTracker.deploy();

    await tracker.waitForDeployment();

    return { tracker, owner, buyer };
  }

  it("deploy albums", async function () {
    const { tracker, buyer } = await loadFixture(deploy);

    const albumTitle = "Enchatment of the Ring";
    const albumPrice = ethers.parseEther("0.00005");

    await createAlbum(tracker, albumTitle, albumPrice);

    const expectedAlbumAddr = await precomputeAddress(tracker);

    const album = Album__factory.connect(expectedAlbumAddr, buyer);

    expect(await album.price()).to.eq(albumPrice);
    expect(await album.title()).to.eq(albumTitle);
    expect(await album.purchased()).to.be.false;
    expect(await album.index()).to.eq(0);
  });

  it("creates albums", async function () {
    const { tracker } = await loadFixture(deploy);

    const albumTitle = "Enchatment of the Ring";
    const albumPrice = ethers.parseEther("0.00005");

    const receiptTx = await createAlbum(tracker, albumTitle, albumPrice);

    const album = await tracker.albums(0);

    expect(await album.price).to.eq(albumPrice);
    expect(await album.title).to.eq(albumTitle);
    expect(await album.state).to.eq(0);

    expect(await tracker.currentIndex()).to.eq(1);
    const expectedAlbumAddr = await precomputeAddress(tracker);
    expect(receiptTx?.logs[0].args[0]).to.eq(expectedAlbumAddr);
    await expect(receiptTx)
      .to.emit(tracker, "AlbumStateChanged")
      .withArgs(expectedAlbumAddr, 0, 0);
  });

  it("allows to buy albums", async function () {
    const { tracker, buyer } = await loadFixture(deploy);

    const albumTitle = "Enchatment of the Ring";
    const albumPrice = ethers.parseEther("0.00005");

    await createAlbum(tracker, albumTitle, albumPrice);

    const expectedAlbumAddr = await precomputeAddress(tracker);

    const album = Album__factory.connect(expectedAlbumAddr, buyer);

    const buyTxData = {
      to: expectedAlbumAddr,
      value: albumPrice,
    };

    const buyTx = await buyer.sendTransaction(buyTxData);
    await buyTx.wait();

    expect(await album.purchased()).to.be.true;
    expect((await tracker.albums(0)).state).to.eq(1);

    await expect(buyTx).to.changeEtherBalances(
      [buyer, tracker],
      [-albumPrice, albumPrice]
    );

    await expect(buyer.sendTransaction(buyTxData)).to.be.revertedWith(
      "This album is already purchased!"
    );
  });

  async function precomputeAddress(
    sc: BaseContract,
    nonce = 1
  ): Promise<string> {
    return ethers.getCreateAddress({
      from: await sc.getAddress(),
      nonce,
    });
  }

  async function createAlbum(
    tracker: AlbumTracker,
    title: string,
    price: bigint
  ): Promise<ContractTransactionReceipt | null> {
    const createAlbumTx = await tracker.createAlbum(price, title);

    return await createAlbumTx.wait();
  }
});
