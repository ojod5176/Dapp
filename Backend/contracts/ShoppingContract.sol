// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShoppingCart {
    struct Item {
        uint id;
        string name;
        uint price;
        uint quantity;
    }

    struct Review {
        uint itemId;
        address reviewer;
        string comment;
        uint8 rating; // 1 to 5
    }

    mapping(uint => Item) public items;
    mapping(address => Item[]) private carts;
    mapping(address => Review[]) private reviews;
    address public admin;
    uint public nextItemId;  // <-- Make nextItemId public

    event ItemAdded(uint itemId, string itemName, uint itemPrice, uint itemQuantity);
    event ItemUpdated(uint itemId, string itemName, uint itemPrice, uint itemQuantity);
    event ItemRemoved(uint itemId);
    event ItemAddedToCart(address indexed user, uint itemId, string itemName, uint itemPrice, uint itemQuantity);
    event ItemRemovedFromCart(address indexed user, uint itemId);
    event ItemPurchased(address indexed user, uint itemId, uint quantity, uint totalPrice);
    event ReviewSubmitted(uint itemId, address reviewer, uint8 rating, string comment);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // function items(uint256 id) public view returns (Item memory);


    function addItem(string memory name, uint price, uint quantity) public onlyAdmin {
        items[nextItemId] = Item(nextItemId, name, price, quantity);
        emit ItemAdded(nextItemId, name, price, quantity);
        nextItemId++;
    }

    function updateItem(uint itemId, string memory name, uint price, uint quantity) public onlyAdmin {
        Item storage item = items[itemId];
        item.name = name;
        item.price = price;
        item.quantity = quantity;
        emit ItemUpdated(itemId, name, price, quantity);
    }

    function removeItem(uint itemId) public onlyAdmin {
        delete items[itemId];
        emit ItemRemoved(itemId);
    }

    function addItemToCart(uint itemId, uint quantity) public {
        Item storage item = items[itemId];
        require(item.quantity >= quantity, "Not enough quantity in stock");
        carts[msg.sender].push(Item(item.id, item.name, item.price, quantity));
        item.quantity -= quantity;
        emit ItemAddedToCart(msg.sender, itemId, item.name, item.price, quantity);
    }

    function removeItemFromCart(uint itemId) public {
        Item[] storage cart = carts[msg.sender];
        for (uint i = 0; i < cart.length; i++) {
            if (cart[i].id == itemId) {
                cart[i] = cart[cart.length - 1];
                carts[msg.sender].pop();
                emit ItemRemovedFromCart(msg.sender, itemId);
                return;
            }
        }
    }

    function purchaseItems() public payable {
        Item[] storage cart = carts[msg.sender];
        uint totalPrice = 0;
        for (uint i = 0; i < cart.length; i++) {
            totalPrice += cart[i].price * cart[i].quantity;
            emit ItemPurchased(msg.sender, cart[i].id, cart[i].quantity, cart[i].price * cart[i].quantity);
        }
        require(msg.value >= totalPrice, "Not enough Ether sent");
        payable(admin).transfer(msg.value);
        delete carts[msg.sender];
    }

    function getCart() public view returns (Item[] memory) {
        return carts[msg.sender];
    }

    function submitReview(uint itemId, uint8 rating, string memory comment) public {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        reviews[msg.sender].push(Review(itemId, msg.sender, comment, rating));
        emit ReviewSubmitted(itemId, msg.sender, rating, comment);
    }

    function getReviews(uint itemId) public view returns (Review[] memory) {
        Review[] memory itemReviews = new Review[](reviews[msg.sender].length);
        uint counter = 0;
        for (uint i = 0; i < reviews[msg.sender].length; i++) {
            if (reviews[msg.sender][i].itemId == itemId) {
                itemReviews[counter] = reviews[msg.sender][i];
                counter++;
            }
        }
        return itemReviews;
    }
}
