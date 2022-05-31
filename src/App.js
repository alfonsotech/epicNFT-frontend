import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import abi from './utils/EpicNFT.json';

// Constants

const TWITTER_HANDLE = 'calcamonia';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const contractAddress = '0x49373310551907A18d611ae64838f72F6e4d6931';
const contractABI = abi.abi;



const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  
  

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        console.log("Found an authorized account:", account);
        setupEventListener()
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
  
      if(!ethereum) {
        alert("You will need to get Metamask to use this website.");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log('Connected to', accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener() 
    } catch(error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(contractAddress, contractABI, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`)
        });

        console.log("Event listener successfully set up!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

const mintFromContract = async () => {

  try {
    const { ethereum } = window;
    
    if(ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("Need to pay gas now....");
      let nftTxn = await connectedContract.makeEpicNFT();
      console.log('Minting.... please wait.');
      await nftTxn.wait();
      console.log(`Mining complete, see transaction here: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      console.log('Here is that hash:', nftTxn.hash);
    } else {
      console.log("Ethereum object doesn't exist!");
    }

  } catch(error) {
    console.log(error);
  }
}

  // Render Methods
  const renderButton = () => (
    !currentAccount ? (
      <button className="cta-button connect-wallet-button" onClick={connectWallet}>
        Connect Wallet
      </button>
      ) : (
      <button onClick={mintFromContract} className="cta-button connect-wallet-button">
        Mint NFT
      </button>
      )
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {renderButton()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
