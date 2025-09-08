import { useState } from "react";
import background from "../../image/backgrounds/withdraw_frame.png";
import amountBackground from "../../image/backgrounds/withdraw_amount_background.png";
import "./ListAmountPopup.css";
import { ProgramModel } from "../../../data/models";
import ConfirmButton from "../../script/button/ConfirmButton";

interface Props {
  program: ProgramModel;
  onConfirmListAmount: (amount: number, program: ProgramModel) => void;
  onCancelList: () => void;
}

const ListAmountPopup = ({
  program,
  onConfirmListAmount,
  onCancelList,
}: Props) => {
  const [amountString, setAmountString] = useState("");

  const onClickConfirm = () => {
    const amount = Number(amountString);
    onConfirmListAmount(amount, program);
  };

  const onClickCancel = () => {
    onCancelList();
  };

  return (
    <div className="list-amount-popup-container">
      <div onClick={onClickCancel} className="list-amount-popup-mask" />
      <div className="list-amount-popup-main-container">
        <img src={background} className="list-amount-popup-main-background" />
        <p className="list-amount-popup-title-text">Price</p>
        <div className="list-amount-popup-amount-container">
          <img
            src={amountBackground}
            className="list-amount-popup-amount-background"
          />
          <input
            type="number"
            className="list-amount-popup-amount-input"
            value={amountString}
            onChange={(e) => setAmountString(e.target.value)}
            min="0"
          />
        </div>
        <div className="list-amount-popup-confirm-button">
          <ConfirmButton onClick={onClickConfirm} isDisabled={false} />
        </div>
      </div>
    </div>
  );
};

export default ListAmountPopup;
