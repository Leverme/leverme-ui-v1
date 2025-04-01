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

import { 
  deposite ,
  getTokenAllowance,
  config,
  redeem,
  getTokenBlance,
  getTokenAmountsOut,
  getTokenDecimal,
  open,
  close,
  getUserPositions,
  getTokenTotalSupply,

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

  const [contractBaseInfo, setContractBaseInfo] = useState(
    {
      pool:
      {
        mon:"0",
        lpmon:"0",
        usdt:"0",
        usdc:"0",
      },
      me:
      {
        mon:"0",
        usdt:"0",
        usdc:"0",
      }
    }
  );

  const [kline, setKline] = useState("https://www.gmgn.cc/kline/eth/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599");

  const [onGoingPosition, setOnGoingPosition] = useState(
    [
      {
        id:0,
        router:"",
        token:"mock",
        tokenDecimal:6,
        baseToken:"wmon",
        baseTokenDecimal:18,
        mortgageAmount:100000000000000000,
        investAmount:300000000000000000,
        tokenAmount:82,
        leverageRate:0,
        openTime:1742973699,
      }
    ]
  );


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
  const [sliderVal, setSliderVal] = useState(3);

  //Input controller
  const [tmpValue, setTmpValue] = useState("0.01");
  const [value, setValue] = useState(1);
  const [final, setFinal] = useState(1);

  //Token Selector
  const fromTokenSelector = [
    { label: 'MON', value: 'wmon' },
    // { label: 'USDT', value: 'usdt' },
    // { label: 'USDC', value: 'usdc' },
  ];
  const [fromTokenSelected, setFromTokenSelected] = useState('wmon');
  const [fromTokenDecimal, setFromTokenDecimal] = useState(1);

  const toTokenSelector = [
    { label: 'BTC', value: 'wbtc' },
    { label: 'ETH', value: 'weth' },
    // { label: 'MON', value: 'wmon' },
  ];
  const [toTokenSelected, setToTokenSelected] = useState('weth');
  const [toTokenDecimal, setToTokenDecimal] = useState(1);


  const baseAmount = 1;

  const [swapRate, setSwapRate] = useState(1);

  //Init function

  const [lock, setLock] = useState(false);

  useEffect(() => {
    updateSwapRate();
    if(!lock && address)
    {
      //Page init comment 
      setLock(true)
      updateBaseStakeInfo();
      const interval = setInterval(updateBaseStakeInfo, 60000); // Then every 60 seconds
      return () => clearInterval(interval);
    }
    
  }
  , [fromTokenSelected,toTokenSelected,address]);

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

      // let fromDecimal = await getTokenDecimal(
      //   fromTk,
      //   publicClient
      // )
      // setFromTokenDecimal(fromDecimal)
      // let toDecimal = await getTokenDecimal(
      //   toTk,
      //   publicClient
      // )
      let fromDecimal = config.address.tokensInfo[fromTokenSelected as keyof typeof config.address.tokensInfo].decimal;
      setFromTokenDecimal(fromDecimal)
      let toDecimal = config.address.tokensInfo[toTokenSelected as keyof typeof config.address.tokensInfo].decimal;
      setToTokenDecimal(toDecimal)

      setKline(config.address.tokensInfo[toTokenSelected as keyof typeof config.address.tokensInfo].kline)
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
      console.log(pairs,rate ,fromDecimal,toDecimal)
      setSwapRate(rate)
    }

  }

  const updateBaseStakeInfo = async () =>
  {
    if(!publicClient)
    {
      console.log("🔥 publicClinet Not Found")
      return 0 ;
    }

    const info = {
      pool:
      {
        mon: (
              Number(await publicClient.getBalance(
                {
                  address:config.address.vault as any
                }
              ))/Math.pow(10,config.address.tokensInfo.wmon.decimal)
        ).toFixed(3),
        lpmon: (
          Number(await getTokenTotalSupply(
            config.address.lp.lpeth,
            publicClient
            )
          )/Math.pow(10,config.address.lpInfo.wmon.decimal)
        ).toFixed(3),
        usdt:'0',
      //   (
      //     Number(await getTokenBlance(
      //       config.address.tokens.usdt,
      //       config.address.vault,
      //       publicClient
      //       )
      //     )/Math.pow(10,config.address.tokensInfo.usdt.decimal)
      // ).toFixed(3),
        usdc:'0'
      //   (
      //     Number(await getTokenBlance(
      //       config.address.tokens.usdc,
      //       config.address.vault,
      //       publicClient
      //       )
      //     )/Math.pow(10,config.address.tokensInfo.usdc.decimal)
      // ).toFixed(3),
      },
      me:
      {
        mon:(
          Number(await getTokenBlance(
            config.address.lp.lpeth,
            address?address:config.address.lp.lpeth,
            publicClient
          )
        )/Math.pow(10,config.address.lpInfo.wmon.decimal)
      ).toFixed(3),
        usdt:(
          Number(await getTokenBlance(
            config.address.lp.lpusdt,
            address?address:config.address.lp.lpusdt,
            publicClient
          )
        )/Math.pow(10,config.address.lpInfo.usdt.decimal)
      ).toFixed(3),
        usdc:(
          Number(await getTokenBlance(
            config.address.lp.lpusdc,
            address?address:config.address.lp.lpusdc,
            publicClient
          )
        )/Math.pow(10,config.address.lpInfo.usdc.decimal)
      ).toFixed(3),
      }
    }
    console.log(info,address)
    setContractBaseInfo(
      info
    )

    if(address)
    {
      setOnGoingPosition(
        await getUserPositions(address,publicClient)
      )
    }
  }

  const deposit = async()=>
  {
      if(!address)
      {
        return false;
      }
      const finalValue = (
        value*Math.pow(10,fromTokenDecimal)
      ).toFixed(0)
      console.log("finalValue",finalValue)
      const tx = await deposite(
        config.address.tokensInfo[fromTokenSelected as keyof typeof config.address.tokensInfo].id,
        finalValue,
        address,
        publicClient,
        writeContractAsync
      )
      console.log(tx)

      //Reload data :: 
      setTimeout(() => {
        updateBaseStakeInfo()
      }, 10000);
  }

  const withdraw = async()=>
  {
    if(!address)
      {
        return false;
      }
      const finalValue = (
        value*Math.pow(10,config.address.lpInfo.wmon.decimal)
      ).toFixed(0)
      const tx = await redeem(
        config.address.lpInfo[fromTokenSelected as keyof typeof config.address.lpInfo].id,
        finalValue,
        address,
        publicClient,
        writeContractAsync
      )
      console.log(tx)

      //Reload data :: 
      setTimeout(() => {
        updateBaseStakeInfo()
      }, 10000);
  }

  const openPosition = async()=>
  {
    if(!address || !publicClient)
      {
        return false;
      }
      const mortgage = (
        value*Math.pow(10,fromTokenDecimal)
      ).toFixed(0)
      console.log("mortgage",mortgage)
      const tx = await open(
        config.address.tokensInfo[fromTokenSelected as keyof typeof config.address.tokensInfo].id,
        toTokenSelected,
        mortgage,
        (Number(mortgage)*sliderVal).toString(),
        address,
        publicClient,
        writeContractAsync
      )
      console.log(tx)

      //Reload data :: 
      setTimeout(() => {
        updateBaseStakeInfo()
      }, 10000);
  }


  const closePosition = async( index : number)=>
    {
      if(!address || !publicClient)
        {
          return false;
        }
        const position = onGoingPosition[index]
        const tx = await close(
          position.id,
          position.router,
          writeContractAsync
        )
        console.log(tx)
        //Reload data :: 
        setTimeout(() => {
          updateBaseStakeInfo()
        }, 10000);
    }

  const debug = async ()=>
  {
    if(!address || !publicClient)
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

      // publicClient.getBalance(
      //   {
      //     address:address
      //   }
      // )
      // console.log(

      //   await getTokenAmountsOut(
      //     config.address.tokens.usdt,
      //     config.address.tokens.wbtc,
      //     "10000000",
      //     publicClient
      //   )
      // )

      console.log(
        await getUserPositions(address , publicClient)
      )
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
              src={kline}> 
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
              value={tmpValue}
              onChange={(e)=>
              {
                console.log("change now :",e.target.value)
                setTmpValue(
                  e.target.value
                )

                if(Number(e.target.value))
                  {
                      setValue(Number(e.target.value))
                      setFinal(Number(value)*sliderVal)
                  }
                // setValue(
                //   (Number(e.target.value)>0)?Number(e.target.value):0
                // )
                // setFinal(Number(value)*sliderVal)
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
              onClick={ openPosition }
              >
                Confirm
              </button>
            </div>
{/* 
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
              onClick={ debug }
              >
                Debug
              </button>
            </div> */}
        </a>
        </div>

        <div className={styles.grid} style={{ width:"70%" , display : (actionSelected=="margin" && (onGoingPosition.length>0) && onGoingPosition[0].token != "mock") ? "flex" : "none"}}>

        <a className={styles.table} style={{ width:"95%" , minHeight:"50px" , minWidth:"350px"}}>

        <div className=" gap-2.5 py-2 " style={{
                  display: 'flex', justifyContent: 'space-evenly' 
              }}>
                <div className={styles.positionTitle} >
                   {
                    "Position"
                   }
                </div>

                <div className={styles.positionTitle} >
                   {
                    "Margin | Size"
                   }
                </div>


                <div className={styles.positionTitle} >
                   {
                    "Token Size"
                   }
                </div>


                <div className={styles.positionTitle} >
                   {
                    "Position Time"
                   }
                </div>

                <div className={styles.positionTitle} >
                   {
                    "Action"
                   }
                </div>

              </div>

        </a>
          {
            onGoingPosition.map((item,index) => (
              <a className={styles.table} style={{ width:"95%" , minHeight:"50px" , minWidth:"350px"}}>

              <div className=" gap-2.5 py-2 " style={{
                  display: 'flex', justifyContent: 'space-evenly' 
              }}>
                <div>
                <span className={styles.positionTitle} >
                {item.baseToken+" "} 
                </span>

                <span
                  style={{
                    color:"#fff",
                  }}
                  >
                  <FontAwesomeIcon icon={faArrowRight} size='xl'/>
                </span>

                <span className={styles.positionTitle} >
                {" "+item.token}
                </span>
                </div>

                <div className={styles.positionTitle} >
                   {
                    `${
                      Number(
                        (
                          item.mortgageAmount
                          /
                          Math.pow(10,item.baseTokenDecimal

                          )
                        ).toFixed(
                          item.baseTokenDecimal
                        )
                      )
                    }`
                   }
                    {
                      " / "
                    }
                    {
                    `${
                      Number(
                        (
                          item.investAmount
                          /
                          Math.pow(10,item.baseTokenDecimal

                          )
                        ).toFixed(
                          item.baseTokenDecimal
                        )
                      )
                    }`
                   }
                </div>

                <div>
                  <div className={styles.positionTitle} >
                  {
                    `${
                      Number(
                        (
                          item.tokenAmount
                          /
                          Math.pow(10,item.tokenDecimal

                          )
                        ).toFixed(
                          item.tokenDecimal
                        )
                      )
                    }  |  ${item.leverageRate}x`
                   }
                  </div>
                   
                </div>

                <div className={styles.positionText} >
                   {
                    (new Date(item.openTime*1000)).toLocaleString()
                   }
                </div>

                <div className="flex gap-2.5 py-2 items-center justify-center">
                  <button color="warning" style={{
                    minWidth : "50rpx",
                    minHeight:"40px",
                    borderRadius: '80px', 
                    overflow: 'hidden',
                    backgroundColor:"#d9ff00",
                    fontSize:"1.3rem"
                    }}
                    onClick={ ()=>
                    {
                      closePosition(index)
                    }
                     }
                    >
                      Close
                    </button>
                </div>
              </div>
            </a>
            )
          )
          }

        </div>



        <div className={styles.grid} style={{ width:"100%" , display : (actionSelected=="stake") ? "flex" : "none"}}>
          <a className={styles.card} style={{ width:"80%" , minHeight:"500px" , minWidth:"350px"}}>
            {/* <div style={{
              width:"100%",
              fontSize:"5rem",
              color:"#d9ff00"
            }}>
              Comming Soon
            </div> */}
            <div className=" gap-2.5 py-2 " style={{
                  display: 'flex', justifyContent: 'space-evenly' , marginTop:"20px"
            }}>
              <span
              className={styles.stakeTitle}
              > 
                Pool MON 
              </span>
              <span
              className={styles.stakeTitle}
              > 
                Borrow Out 
              </span>  
              {/* <span
              className={styles.stakeTitle}
              > 
                Pool USDT
              </span> 
              <span
              className={styles.stakeTitle}
              > 
                Pool USDC
              </span>  */}
            </div>


            <div className=" gap-2.5 py-2 " style={{
                  display: 'flex', justifyContent: 'space-evenly', marginTop:"20px"
            }}>
              <span className={styles.stakeValue}> 
                {
                  contractBaseInfo.pool.mon
                }
              </span>

              <span className={styles.stakeValue}> 
                {
                  (Number(contractBaseInfo.pool.lpmon) - Number(contractBaseInfo.pool.mon)).toFixed(3)
                }
              </span>  
              {/* <span className={styles.stakeValue}> 
                {
                  contractBaseInfo.pool.usdt
                }
              </span> 
              <span className={styles.stakeValue}> 
                {
                  contractBaseInfo.pool.usdc
                }
              </span>  */}
            </div>

            <div style={{width:"100%" , backgroundColor:"#d9ff00" , height:"5px" , marginTop:"20px"}}></div>
            <div className=" gap-2.5 py-2 " style={{
                  display: 'flex', justifyContent: 'space-evenly', marginTop:"20px"
            }}>
              <span
              className={styles.stakeTitle}
              > 
                My LPMON
              </span>  
              {/* <span
              className={styles.stakeTitle}
              > 
                LPUSDT
              </span> 
              <span
              className={styles.stakeTitle}
              > 
                LPUSDC
              </span>  */}
            </div>
            
            <div className=" gap-2.5 py-2 " style={{
                  display: 'flex', justifyContent: 'space-evenly', marginTop:"20px"
            }}>
              <span className={styles.stakeValue}> 
                {
                  contractBaseInfo.me.mon
                }
              </span>  
              {/* <span className={styles.stakeValue}> 
                {
                  contractBaseInfo.me.usdt
                }
              </span> 
              <span className={styles.stakeValue}> 
                {
                  contractBaseInfo.me.usdc
                }
              </span>  */}
            </div>
            <div style={{width:"100%" , backgroundColor:"#d9ff00" , height:"5px" , marginTop:"20px"}}></div>
            <div className=" gap-2.5 py-2 " style={{
                  display: 'flex', justifyContent: 'space-evenly', marginTop:"40px"
            }}>
              <DropdownButtonGroup
                widths='20%'
                options={fromTokenSelector}
                selectedValue={fromTokenSelected}
                onChange={(value) => setFromTokenSelected(value)}
              />

          <input
              type="text"
              value={tmpValue}
              onChange={(e)=>
              {
                console.log("i change now :",e.target.value)
                setTmpValue(
                  e.target.value
                )
                if(Number(e.target.value))
                {
                    setValue(Number(e.target.value))

                    setFinal(Number(value)*sliderVal)
                }
                // setValue(
                //   (Number(e.target.value)>0)?Number(e.target.value):0
                // )
                
              }
              }
              placeholder={"Input amount"}
              style={{
                maxHeight:"40px",
                borderRadius: '8px',
                background: 'transparent', 
                border: '1px solid #ccc', 
                padding: '8px 12px',
                outline: 'none',
                color: '#fff',
                fontSize:"1.3rem",
                width:"20%",
                textAlign: 'center',   
              }}
            />
            <button color="warning" style={{
              width : "30%",
              height:"40px",
              borderRadius: '80px', 
              overflow: 'hidden',
              backgroundColor:"#d9ff00",
              fontSize:"1.3rem"
              }}
              onClick={ deposit }
              >
                Deposite
            </button>

            <button color="warning" style={{
              width : "30%",
              height:"40px",
              borderRadius: '80px', 
              overflow: 'hidden',
              backgroundColor:"#d9ff00",
              fontSize:"1.3rem"
              }}
              onClick={ withdraw }
              >
                Withdraw
              </button>
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
          minWidth:"300px",
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
