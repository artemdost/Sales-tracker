// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC165.sol";

contract MusicShop is ERC165 {
    enum OrderStatus {
        Paid,
        Delivered
    }

    struct Album {
        uint index;
        bytes32 uid;
        string title;
        uint price;
        uint quantity;
    }

    struct Order {
        uint orderId;
        bytes32 albumUid;
        address customer;
        uint orderedAt;
        OrderStatus status;
    }

    Album[] public albums;
    Order[] public orders;

    uint public currentIndex;
    uint public currentOrderId;

    address public owner;

    event AlbumBought(
        bytes32 indexed uid,
        address indexed customer,
        uint indexed timestamp
    );
    event OrderDelivered(bytes32 indexed albumUid, address indexed customer);

    modifier onlyOnwer() {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function addAlbum(
        bytes32 uid,
        string calldata title,
        uint price,
        uint quantity
    ) external onlyOnwer {
        albums.push(
            Album({
                index: currentIndex,
                uid: uid,
                title: title,
                price: price,
                quantity: quantity
            })
        );
        currentIndex++;
    }

    function buy(uint _index) external payable {
        Album storage albumToBuy = albums[_index];

        require(msg.value == albumToBuy.price, "invalid price");
        require(albumToBuy.quantity > 0, "out of stock");

        albumToBuy.quantity--;

        orders.push(
            Order({
                orderId: currentOrderId,
                albumUid: albumToBuy.uid,
                customer: msg.sender,
                orderedAt: block.timestamp,
                status: OrderStatus.Paid
            })
        );

        currentOrderId++;

        emit AlbumBought(albumToBuy.uid, msg.sender, block.timestamp);
    }

    function delivered(uint _index) external onlyOnwer {
        Order storage currentOrder = orders[_index];

        require(currentOrder.status != OrderStatus.Delivered, "invalid status");

        currentOrder.status = OrderStatus.Delivered;

        emit OrderDelivered(currentOrder.albumUid, currentOrder.customer);
    }

    function allAlbums() public view returns (Album[] memory) {
        uint totalAlbums = albums.length;
        Album[] memory albumsList = new Album[](totalAlbums);

        for (uint i = 0; i < totalAlbums; ++i) {
            albumsList[i] = albums[i];
        }

        return albumsList;
    }

    receive() external payable {
        revert("Please use the buy function to purchase albums!");
    }

    fallback() external {}
}
