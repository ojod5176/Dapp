# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
# ShoppingCart Smart Contract

## Overview

The ShoppingCart smart contract is designed to simulate a shopping experience on the Ethereum blockchain. Users can browse items, add them to their cart, review items, and make purchases. The contract also supports administrative actions such as adding, updating, and removing items. All transactions are recorded on the blockchain, ensuring transparency and immutability.


- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Deployment](#deployment)
- [Usage](#usage)
- [Frontend](#frontend)
- [Smart Contract](#smart-contract)
- [License](#license)

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Truffle](https://www.trufflesuite.com/)
- [MetaMask](https://metamask.io/)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/ShoppingCart.git
   cd simplebank

# ShoppingCart Smart Contract

## Overview

The ShoppingCart smart contract is designed to simulate a shopping experience on the Ethereum blockchain. Users can browse items, add them to their cart, review items, and make purchases. The contract also supports administrative actions such as adding, updating, and removing items. All transactions are recorded on the blockchain, ensuring transparency and immutability.

## Features

- Browse and add items to the cart.
- Purchase items with Ether.
- Submit reviews and ratings for items.
- Administrative control over item listings.

## Prerequisites

- Node.js and npm installed.
- Ganache or another local Ethereum blockchain for deployment and testing.
- MetaMask or another Ethereum wallet extension for interacting with the contract.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the required dependencies:


## Deployment

1. Start Ganache or your preferred local Ethereum blockchain.
2. Compile the smart contract:


3. Migrate the smart contract to your local blockchain:


Replace `ganache` with the name of your network configuration if different.

## Interaction

### Adding Items

- Only the contract administrator can add items. Call the `addItem` function with the item details.

### Updating Items

- Only the contract administrator can update items. Call the `updateItem` function with the item ID and updated details.

### Removing Items

- Only the contract administrator can remove items. Call the `removeItem` function with the item ID.

### Adding Items to Cart

- Users can add items to their cart by calling the `addItemToCart` function with the item ID and desired quantity.

### Removing Items from Cart

- Users can remove items from their cart by calling the `removeItemFromCart` function with the item ID.

### Purchasing Items

- Users can purchase items in their cart by calling the `purchaseItems` function. Ensure the sent Ether covers the total price of the items.

### Submitting Reviews

- Users can submit reviews for items by calling the `submitReview` function with the item ID, rating, and comment.

### Getting Cart Contents

- Users can view the contents of their cart by calling the `getCart` function.

### Getting Item Reviews

- Users can view reviews for an item by calling the `getReviews` function with the item ID.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

MIT License


