import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  let displayWaves = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xd94811E9931eC443f9C93BC421c236c08B57CFD7";
  const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum){
        console.log("Please ensure that you  have Metamask istalled.");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected to account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try{

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waveTxn = await wavePortalContract.wave("Final message befor input is live on site", { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

      } else {
        console.log("Ethereum Object not found.")
      }
    } catch(error) {
      console.log(error)
    }
  }

  const waveQuery = async () => {
    try{

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Total wave count for address: ",count.toNumber());
        getAllWaves();
      } else {
        console.log("Ethereum Object not found.")
      }
    } catch(error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
      displayWaves=True;
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
  };

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
  

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Blockchain is the future
        </div>

        <div className="bio">
        Hello,I am Juan-luke and I am working on becoming a full-stack web3.0 engineer, that's pretty cool right? Connect your Ethereum wallet and interact with my first contract to wave at me!
        </div>

        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Click here to connect MetaMask
          </button>
        )}

        {currentAccount && (
          //<input ></input>
          <div className="button group">
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        <button className="waveButton" onClick={waveQuery}>
          Display all waves
        </button>
        </div>
        )}

        {displayWaves && (
          allWaves.map((wave, index) => {
          return (
            <button key={index} className="waveInfoDiv">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </button>)
        }))}

        </div>
        

      <div className="footer">This project was built by Juan-luke Klopper and is completely open-source.</div>
      </div>
  );
}

export default App
