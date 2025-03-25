import { ConnectButton,useAccountModal } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import  bg from "../../resource/dune.png"
import ButtonGroup from '../components/ButtonGroup';
import ButtonGroupWithSlider from '../components/ButtonGroupWithSlider';
import { useState,useEffect } from 'react';

import DropdownButtonGroup from '../components/DropdownButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faArrowRight} from "@fortawesome/free-solid-svg-icons"

import {faGithub , faTelegram , faXTwitter} from "@fortawesome/free-brands-svg-icons"

import { useAccount, useSignMessage , useSendTransaction ,useWriteContract , useReadContract ,usePublicClient } from 'wagmi'

import { deposite ,
  getTokenAllowance,
  config,
  redeem,
  getTokenBlance,
  getTokenAmountsOut,
  getTokenDecimal,
} from '../core/contract';

const Home: NextPage = () => {
  const { address,isConnected } = useAccount()
  const [signature, setSignature] = useState<string | null>(null)
  const { signMessageAsync } = useSignMessage()
  const { sendTransactionAsync } = useSendTransaction()
  const publicClient = usePublicClient()
  const { 
    data: hash, 
    isPending, 
    writeContract ,
    writeContractAsync
  } = useWriteContract()
  //Action button
  const actionButtonGroup = [
    { label: 'Margin', value: 'margin' },
    { label: 'Stake', value: 'stake' },
    { label: 'MEME', value: 'meme' },
  ];
  const [actionSelected, setActionSelected] = useState('margin');

  //Leverage options
  const options = [
    { label: '3x', value: '3' },
    { label: '5x', value: '5' },
    { label: '7x', value: '7' },
    { label: '10x', value: '10' },
  ];
  const [selected, setSelected] = useState('1');
  const [sliderVal, setSliderVal] = useState(1);

  //Input controller
  const [value, setValue] = useState(1);
  const [final, setFinal] = useState(1);

  //Token Selector
  const fromTokenSelector = [
    { label: 'MON', value: 'wmon' },
    { label: 'USDT', value: 'usdt' },
    { label: 'USDC', value: 'usdc' },
  ];
  const [fromTokenSelected, setFromTokenSelected] = useState('wmon');
  const [fromTokenDecimal, setFromTokenDecimal] = useState(1);

  const toTokenSelector = [
    { label: 'BTC', value: 'wbtc' },
    { label: 'ETH', value: 'weth' },
    { label: 'MON', value: 'wmon' },
  ];
  const [toTokenSelected, setToTokenSelected] = useState('wbtc');
  const [toTokenDecimal, setToTokenDecimal] = useState(1);


  const baseAmount = 1;

  const [swapRate, setSwapRate] = useState(1);

  //Init function

  useEffect(() => {
    updateSwapRate();
  }
  , [fromTokenSelected,toTokenSelected]);

  const updateSwapRate = async () =>
  {
    console.log(
      "updateSwapRate",
      fromTokenSelected,
      toTokenSelected
    )
    if (fromTokenSelected in config.address.tokens && toTokenSelected in config.address.tokens)
    {
      const fromTk = config.address.tokens[fromTokenSelected as keyof typeof config.address.tokens];
      const toTk = config.address.tokens[toTokenSelected as keyof typeof config.address.tokens];
      let fromDecimal = await getTokenDecimal(
        fromTk,
        publicClient
      )
      setFromTokenDecimal(fromDecimal)
      let toDecimal = await getTokenDecimal(
        toTk,
        publicClient
      )
      setToTokenDecimal(toDecimal)
      let amount = (baseAmount * Math.pow(10,Number(fromDecimal))).toFixed(0);
      const pairs = await getTokenAmountsOut(
        config.address.tokens[fromTokenSelected as keyof typeof config.address.tokens],
        config.address.tokens[toTokenSelected as keyof typeof config.address.tokens],
        amount,
        publicClient
      )
      const rate = Number(
        pairs[1]
      )/(baseAmount * Math.pow(10,Number(toDecimal)))
      console.log(pairs,rate)
      setSwapRate(rate)
    }

  }


  return (
    <div className={styles.container}       style={{ 
      backgroundImage: `url(${bg.src})`,
      backgroundSize: "cover", 
      backgroundPosition: "center", 
      backgroundRepeat: "no-repeat"
    }}>
      <Head>
        <title>Leverme</title>
        <meta
          content="Leverme - EVM spot leverage trading "
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div
  style={{
    position: "fixed",
    top: "5%",
    right: "5%",
    padding: "10px",
    zIndex: 1000,
  }}
>
<ConnectButton />
</div>

      <main className={styles.main}>
       

        <h1 className={styles.title}>
        <span style={{color:"#d9ff00"}}>Leverme
        </span> Protocol
        </h1>


        <ButtonGroup
          options={actionButtonGroup}
          selectedValue={actionSelected}
          onChange={(value) => {
            setActionSelected(value)
            console.log("🔥Change Vule To ::",value)
          }}
        />
        
        <div className={styles.grid} style={{ width:"100%" , display : (actionSelected=="margin") ? "flex" : "none"}}>
          <a className={styles.card} style={{ width:"60%" , minHeight:"500px" , minWidth:"350px"}}>
          <iframe 
              style={{
                width: "100%",
                minHeight: "450px",
                border: "none", 
                borderRadius: "12px", 
                overflow: "hidden",
              }}
              className="rounded-lg"
              src="https://www.gmgn.cc/kline/eth/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"> 
            </iframe> 
          </a>

          <a className={styles.card}  style={{ width:"20%" , minHeight:"500px", minWidth:"350px"}}>
              <div className=" gap-2.5 py-2 " style={{
                display: 'flex', justifyContent: 'space-evenly'
              }}>
              <DropdownButtonGroup
                widths='30%'
                options={fromTokenSelector}
                selectedValue={fromTokenSelected}
                onChange={(value) => setFromTokenSelected(value)}
              />
              <span
              style={{
                color:"#fff",
              }}
              >
                <FontAwesomeIcon icon={faArrowRight} size='2xl'/>
              </span>
              <DropdownButtonGroup
                widths='50%'
                options={toTokenSelector}
                selectedValue={toTokenSelected}
                onChange={(value) => {
                  setToTokenSelected(value)
                }}
              />
            </div>

            <div className="flex gap-2.5 py-2 items-center justify-center" style={{marginTop:"20px"}}>
            <input
              type="text"
              value={value}
              onChange={(e)=>
              {
                console.log("change now :",e.target.value)
                setValue(
                  (Number(e.target.value)>0)?Number(e.target.value):0
                )
                setFinal(Number(value)*sliderVal)
              }
              }
              placeholder={"Input amount"}
              style={{
                borderRadius: '8px',
                background: 'transparent', 
                border: '1px solid #ccc', 
                padding: '8px 12px',
                outline: 'none',
                color: '#fff',
                fontSize:"1.3rem",
                width:"100%",
                textAlign: 'center',   
              }}
            />
            </div>

        <div className="flex gap-2.5 py-2 items-center justify-center" style={{marginTop:"20px"}}>
        <ButtonGroupWithSlider
        options={options}
        selectedValue={sliderVal.toString()}
        onChange={(val) => {
          setSelected(val)
          setFinal(Number(val)*value)
          setSliderVal(Number(val))
        }}
        sliderMin={0}
        sliderMax={10}
        sliderValue={sliderVal}
        onSliderChange={(val) => {
          setFinal(value*val)
          setSliderVal(val)
        }}
      />
       <div style={{ textAlign: 'center', marginTop: '1px' , color:"#d9ff00"}}>
        <span
        style={{
          fontSize:"2em"
        }}
        >{`${Number((final*swapRate).toFixed(toTokenDecimal))}`}</span>{` ${toTokenSelected} | ${sliderVal}x`}
       </div>
            </div>

            <div className="flex gap-2.5 py-2 items-center justify-center">
            <button color="warning" style={{
              width : "100%",
              height:"40px",
              borderRadius: '80px', 
              overflow: 'hidden',
              marginTop: '30px',
              backgroundColor:"#d9ff00",
              fontSize:"1.3rem"
              }}
              onClick={ async ()=>
              {
                if(!address)
                {
                  return false;
                }
                console.log("PRESS CONFIRM")

                //Check wallet connection 

                //Do txn generate

                // console.log(
                //   await signMessageAsync(
                //     {
                //       message:"Hello world"
                //     }
                //   )
                // )
                
                // await deposite(0,"10000000000000000",address,publicClient,writeContractAsync)
                // console.log(
                //   await getTokenAllowance(
                //     config.address.tokens.wbtc,
                //     address,
                //     config.address.vault,
                //     publicClient
                //   )
                // )

                // console.log(
                //   await getTokenBlance(
                //     config.address.lp.lpeth,
                //     address,
                //     publicClient
                //   )
                // ) 
                //20010000000000000000n
                // await redeem(0,"20010000000000000000",address,publicClient,writeContractAsync)


                console.log(

                  await getTokenAmountsOut(
                    config.address.tokens.usdt,
                    config.address.tokens.wbtc,
                    "10000000",
                    publicClient
                  )
                )
              }
              }
              >
                Confirm
              </button>
            </div>
        </a>
        </div>




        <div className={styles.grid} style={{ width:"100%" , display : (actionSelected=="stake") ? "flex" : "none"}}>
          <a className={styles.card} style={{ width:"80%" , minHeight:"500px" , minWidth:"350px"}}>
            <div style={{
              width:"100%",
              fontSize:"5rem",
              color:"#d9ff00"
            }}>
              Comming Soon
            </div>
          </a>
        </div>

        
        <div className={styles.grid} style={{ width:"100%" , display : (actionSelected=="meme") ? "flex" : "none"}}>
          <a className={styles.card} style={{ width:"80%" , minHeight:"500px" , minWidth:"350px"}}>
            <div style={{
              width:"100%",
              fontSize:"5rem",
              color:"#d9ff00"
            }}>
              Comming Soon
            </div>
          </a>
        </div>

        <div style={{
          width:"20%",
          display: 'flex', justifyContent: 'space-evenly',
          marginTop:"10px"
        }}>
            <a href='https://github.com/leverme'> <FontAwesomeIcon icon={faGithub} size='xl' color='#d9ff00' /> </a>
            <a href='https://t.me/+QBzgwe9P-go0Mjk1'> <FontAwesomeIcon icon={faTelegram} size='xl' color='#d9ff00'/> </a>
            <a href='#'> <FontAwesomeIcon icon={faXTwitter} size='xl' color='#d9ff00'/> </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
