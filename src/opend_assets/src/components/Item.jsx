import React, { useEffect, useState } from "react";
import { nft } from "../../../declarations/nft";
import {Actor ,HttpAgent} from "@dfinity/agent";
import {Principal} from "@dfinity/principal";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenidlFactory } from "../../../declarations/token";
import { opend } from "../../../declarations/opend";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item({id, role}) {

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [logo, setLogo] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [priceLabel, setPriceLabel] = useState();
  const [loaderHidden, setLoader] = useState(true);
  const [blur, setBlur] = useState();
  const [shouldDisplay, setShouldDisplay] = useState(true);
  const [listed, setListed] = useState();

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localHost});
  agent.fetchRootKey();
  //TODO remove above line

  let NFTActor;

  async function LoadNFT(){
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getImageBytes();
    const imageContent = new Uint8Array(imageData);
    const imageURL = URL.createObjectURL(
      new Blob([imageContent.buffer],
         {type: "image/png"}
    ));

    setName(name);
    setOwner(owner.toText());
    setLogo(imageURL);

    const nftIsListed = await opend.isListed(id);

    if(role == "collection"){
      if(nftIsListed){
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"});
      } else {
          setButton(<Button handleClick={handleSell} text="sell"/>);
      }
    }else if (role == "discover"){
      const originalOwner = await opend.getOriginalOwner(id);
      if(originalOwner.toText() != CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handlebuy} text="buy"/>);
      }

      const price = await opend.getListedNFTPrice(id);

      setPriceLabel(<PriceLabel sellingPrice={price.toString()}/>);
    }



  }
  let price;
  function handleSell(){
    setPriceInput(
    <input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => {price = e.target.value}}
    />
    );
    setButton(<Button handleClick={confirmSell} text="confirm"/>);
  }

  async function confirmSell(){
    setBlur({filter: "blur(4px)"});
    setLoader(false);
    const listing = await opend.listItem(id, Number(price));
    console.log("Listing -> " + listing);
    if (listing == "Success"){
      const opendId = await opend.getOpenDCanisterID();
      const transferResult =  await NFTActor.transferOwnership(opendId);
      console.log("Transfer -> " + transferResult);
      if(transferResult == "Success"){
        setButton();
        setPriceInput();
        setOwner("OpenD");
        setListed("Listed");
        setLoader(true);
      }
    }   
  }

  async function handlebuy(){
    setLoader(false);
    const tokenActor = await Actor.createActor(tokenidlFactory, {
      agent,
      canisterId: Principal.fromText("wflfh-4yaaa-aaaaa-aaata-cai")
    });

    const sellerId = await opend.getOriginalOwner(id);
    const itemPrice = await opend.getListedNFTPrice(id);

    const result = await tokenActor.transfer(sellerId, itemPrice);

    if(result == "Success"){
      const transferResult = await opend.completePurchase(id, sellerId, CURRENT_USER_ID);
      console.log("Purchase -> "+transferResult);
      setLoader(true);
      setShouldDisplay(false);
    }
  }

  useEffect(()=>{
    LoadNFT();
  }, []);

  return (
    <div style={{display: shouldDisplay ? "inline": "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={logo}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {listed}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
