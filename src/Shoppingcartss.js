import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ShoppingCartABI from './shoppingABI.json';

const contractAddress = '0xc7F51a44dD0d5B46C269ED883D44FA969e677C03'; // Replace with your contract address

const ShoppingCartApp = () => {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [admin, setAdmin] = useState('');
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState({});
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const shoppingCartContract = new web3Instance.eth.Contract(ShoppingCartABI, contractAddress);
          setContract(shoppingCartContract);
          await fetchItems(shoppingCartContract);
          await fetchCart(shoppingCartContract, accounts[0]);
          const adminAddress = await shoppingCartContract.methods.admin().call();
          setAdmin(adminAddress);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
          setError('Failed to connect to MetaMask.');
        }
      } else {
        console.error('Ethereum browser extension not detected');
        setError('Ethereum browser extension not detected.');
      }
    };

    init();
  }, []);

  const fetchItems = async (contract) => {
    try {
      const itemCount = await contract.methods.nextItemId().call();
      const itemsArray = [];
      for (let i = 0; i < itemCount; i++) {
        try {
          // Ensure you are passing the correct parameter for the items method
          const item = await contract.methods.items(i).call();
          if (item.id !== '0') { // Check if the item exists
            itemsArray.push(item);
          }
        } catch (innerError) {
          console.error(`Error fetching item with ID ${i}:`, innerError);
        }
      }
      setItems(itemsArray);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items.');
    }
  };
  
  

  const fetchCart = async (contract, account) => {
    try {
      const cartItems = await contract.methods.getCart().call({ from: account });
      setCart(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to fetch cart.');
    }
  };

  const fetchReviews = async (itemId) => {
    try {
      const itemReviews = await contract.methods.getReviews(itemId).call();
      setReviews((prevReviews) => ({ ...prevReviews, [itemId]: itemReviews }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews.');
    }
  };

  const addItem = async () => {
    if (contract && account && itemName && itemPrice && itemQuantity) {
      try {
        await contract.methods.addItem(itemName, itemPrice, itemQuantity).send({ from: account });
        await fetchItems(contract);
      } catch (error) {
        handleRateLimitError(error, addItem);
      }
    } else {
      setError('Please provide all item details.');
    }
  };

  const updateItem = async (itemId) => {
    if (contract && account && itemName && itemPrice && itemQuantity) {
      try {
        await contract.methods.updateItem(itemId, itemName, itemPrice, itemQuantity).send({ from: account });
        await fetchItems(contract);
      } catch (error) {
        handleRateLimitError(error, () => updateItem(itemId));
      }
    } else {
      setError('Please provide all item details.');
    }
  };

  const removeItem = async (itemId) => {
    if (contract && account) {
      try {
        await contract.methods.removeItem(itemId).send({ from: account });
        await fetchItems(contract);
      } catch (error) {
        handleRateLimitError(error, () => removeItem(itemId));
      }
    }
  };

  const addItemToCart = async (itemId, quantity) => {
    if (contract && account) {
      try {
        await contract.methods.addItemToCart(itemId, quantity).send({ from: account });
        await fetchCart(contract, account);
      } catch (error) {
        handleRateLimitError(error, () => addItemToCart(itemId, quantity));
      }
    }
  };

  const removeItemFromCart = async (itemId) => {
    if (contract && account) {
      try {
        await contract.methods.removeItemFromCart(itemId).send({ from: account });
        await fetchCart(contract, account);
      } catch (error) {
        handleRateLimitError(error, () => removeItemFromCart(itemId));
      }
    }
  };

  const purchaseItems = async () => {
    if (contract && account) {
      try {
        const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        await contract.methods.purchaseItems().send({ from: account, value: totalPrice });
        await fetchCart(contract, account);
      } catch (error) {
        handleRateLimitError(error, purchaseItems);
      }
    }
  };

  const submitReview = async (itemId) => {
    if (contract && account && reviewComment && reviewRating) {
      try {
        await contract.methods.submitReview(itemId, reviewRating, reviewComment).send({ from: account });
        await fetchReviews(itemId);
      } catch (error) {
        handleRateLimitError(error, () => submitReview(itemId));
      }
    } else {
      setError('Please provide all review details.');
    }
  };

  const handleRateLimitError = (error, retryFunction) => {
    if (error.message.includes('Request is being rate limited')) {
      console.warn('Rate limited, retrying in 1 second...');
      setError('Rate limited, retrying in 1 second...');
      setTimeout(retryFunction, 1000);
    } else {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Shopping Cart DApp</h1>
      <p>Account: {account}</p>
      {error && <p>Error: {error}</p>}

      {account === admin && (
        <div>
          <h2>Add/Update Item</h2>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name"
          />
          <input
            type="number"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="Item Price"
          />
          <input
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
            placeholder="Item Quantity"
          />
          <button onClick={addItem}>Add Item</button>
        </div>
      )}

      <div>
        <h2>Items</h2>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.price} wei (Available: {item.quantity})
              {account === admin && (
                <>
                  <button onClick={() => updateItem(item.id)}>Update</button>
                  <button onClick={() => removeItem(item.id)}>Remove</button>
                </>
              )}
              <button onClick={() => addItemToCart(item.id, 1)}>Add to Cart</button>
              <button onClick={() => fetchReviews(item.id)}>View Reviews</button>
              {reviews[item.id] && reviews[item.id].map((review, index) => (
                <div key={`${item.id}-${review.reviewer}-${index}`}>
                  <p>{review.comment} - {review.rating}/5 by {review.reviewer}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Cart</h2>
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} - {item.price} wei (Quantity: {item.quantity})
              <button onClick={() => removeItemFromCart(item.id)}>Remove from Cart</button>
            </li>
          ))}
        </ul>
        <button onClick={purchaseItems}>Purchase Items</button>
      </div>

      <div>
        <h2>Submit Review</h2>
        <input
          type="text"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Comment"
        />
        <input
          type="number"
          value={reviewRating}
          onChange={(e) => setReviewRating(Number(e.target.value))}
          min="1"
          max="5"
          placeholder="Rating (1-5)"
        />
        <button onClick={() => submitReview(items[0]?.id)}>Submit Review for First Item</button>
      </div>
    </div>
  );
};

export default ShoppingCartApp;
