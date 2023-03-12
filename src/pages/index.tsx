import Head from 'next/head'
import { BaseSyntheticEvent, useState } from 'react'
import * as Web3 from '@solana/web3.js'

export default function Home() {
  const [address, setAddress] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [transaction, setTransaction] = useState('');

  const handleTextInput = (e: BaseSyntheticEvent) => {
    console.log(e.target.value);
    setAddress(e.target.value);
  }

  async function airdropSol() {
    try {
      const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
      const signer = new Web3.PublicKey(address);
      const balance = await connection.getBalance(signer);
      console.log('Current balance is', balance / Web3.LAMPORTS_PER_SOL, 'SOL');
    
      // 1 SOL should be enough for almost anything you wanna do
      // You can only get up to 2 SOL per request 
      console.log('Airdropping 1 SOL');
      const airdropSignature = await connection.requestAirdrop(
        signer,
        Web3.LAMPORTS_PER_SOL
      );

      const latestBlockhash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: airdropSignature,
      });

      const newBalance = await connection.getBalance(signer);
      setUserBalance(newBalance / Web3.LAMPORTS_PER_SOL);
      setTransaction(airdropSignature);
      console.log('New balance is', newBalance / Web3.LAMPORTS_PER_SOL, 'SOL');
      console.log(
        `Transaction https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`
      );
    } catch(error) {
      alert(error);
      setAddress('');
      setUserBalance(0);
      setTransaction('')
    }
  }

  return (
    <>
      <Head>
        <title>Solana Faucet</title>
        <meta name="description" content="Airdrop Solana to your devnet account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='grid place-content-center min-h-screen'>
        <div className='max-w-xl flex flex-col items-center gap-4'>
          <h1 className='text-4xl text-center mb-3'>Send Yourself some devnet SOL</h1>
          <input onChange={handleTextInput} type="text" placeholder="Enter Solana account address" className="input input-bordered input-primary w-full max-w-lg" />
          <button onClick={airdropSol} className='btn btn-primary btn-wide'>Send Sol</button>
          <div>
            <p>User Balance: {userBalance}</p>
            <p>Signature: {transaction}</p>
          </div>
        </div>
      </main>
    </>
  )
}
