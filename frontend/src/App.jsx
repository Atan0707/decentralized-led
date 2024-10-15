import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import './App.css'
import contractABI from '../contract/ABI.json'
import axios from 'axios';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [state, setState] = useState(null);
  const contractAbi = contractABI.abi;
  const contractAddress = "0xceF52CE0b79Cb3AF65E9F48E28b7ab78Bb8fdC3b"

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();  // Await the getSigner method
        const address = await signer.getAddress();  // Now this should work
        setWalletAddress(address);

        // Instantiate the contract
        // const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        // setContract(contractInstance);

        // Fetch state from contract
        // const contractState = await contractInstance.state();
        // setState(contractState);
        
      } catch (error) {
        console.error("Error connecting to wallet or contract:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };

    // Function to change wallet manually
    const changeWallet = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
          await connectWallet(); // Reconnect after changing wallets
        } catch (error) {
          console.error("Error changing wallet:", error);
        }
      }
    };

     // Listen to MetaMask account change events
    useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
          // setContract(null);
        }
      });

      return () => {
        window.ethereum.removeListener('accountsChanged', () => {});
      };
    }
  }, []);

  // To fetch the state of led
  useEffect(() => {
    const fetchState = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        const contractState = await contract.getState();
        setState(contractState);
      }
      catch (error) {
        console.error("Error fetching state:", error);
      }
    }
    const intervalId = setInterval(fetchState, 500);

    fetchState();

    return () => clearInterval(intervalId);
  }, [contractAbi]);

  const turnOn = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      await contract.turnOn();
      const contractState = await contract.getState();
      setState(contractState);
    } catch (error) {
      console.error("Error turning on:", error);
    }
  }

  const turnOff = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      await contract.turnOff();
      const contractState = await contract.getState();
      setState(contractState);
    } catch (error) {
      console.error("Error turning off:", error);
    }
  }

  // Function to send the contract state to an external API
  const sendStateToAPI = async (contractState) => {
    try {
        const response = await axios.post('http://localhost:3000/state', {
            state: contractState
        });
        console.log('Data sent to API, response:', response.data);
    } catch (error) {
        console.error('Error sending data to API:', error);
    }
};

// useEffect to send the state to the API once it's fetched
useEffect(() => {
  if (state !== null) {
      sendStateToAPI(state);
  }
}, [state]);

  return (
    <>
      <div className="App">
        <h1>Connect Wallet</h1>
        {walletAddress ? (
          <>
            <p>Connected Wallet Address: {walletAddress}</p>
            <button onClick={turnOn}>Turn On</button>
            <button onClick={turnOff}>Turn Off</button>
            <button onClick={changeWallet}>Change Wallet</button>
          </>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>
      <div>
            <h1>Smart Contract State</h1>
            <p>{state !== null ? `Current State: ${state}` : 'Fetching state...'}</p>
        </div>
    </>
  )
}

export default App