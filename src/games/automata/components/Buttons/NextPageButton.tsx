import React from "react";
import ImageButton from "./ImageButton";
import downButtonImage from "../../images/Buttons/Down/down.png";
import downButtonHoverImage from "../../images/Buttons/Down/down_hover.png";
import downButtonClickImage from "../../images/Buttons/Down/down_click.png";
import "./NextPageButton.css";

interface Props {
  isDisabled: boolean;
  onClick: () => void;
}

const NextPageButton = ({ isDisabled, onClick }: Props) => {
  return (
    <div className="next-page-button-scale">
      <ImageButton
        isDisabled={isDisabled}
        defaultImagePath={downButtonImage}
        hoverImagePath={downButtonHoverImage}
        clickedImagePath={downButtonClickImage}
        disabledImagePath={downButtonClickImage}
        onClick={onClick}
      />
    </div>
  );
};

export default NextPageButton;