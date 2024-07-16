import React from "react";
import "./AccountInfo.css";
import account_info from "../images/backgrounds/account_info.png";

const AccountInfo = () => {
  return (
    <div className="account-info-container">
      <img src={account_info} className={"account-info-background"}></img>
      <p className={"account-info-account-text"}>{`Account : ACCOUNT`}</p>
      <p className={"account-info-key-text"}>{`Key : KEY`}</p>
      <p className={"account-info-player-id-text"}>{`Player Id : ID`}</p>
    </div>
  );
};

export default AccountInfo;