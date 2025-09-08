import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./WelcomePage.css";
import background_back from "../../image/backgrounds/background_back.png";
import background_front from "../../image/backgrounds/background_front.png";
import sponsor_frame from "../../image/backgrounds/sponsor_frame.png";
import logo from "../../image/backgrounds/sponsor logo.png";
import WelcomeConnectWalletButton from "../button/WelcomeConnectWalletButton";
import WelcomePlayButton from "../button/WelcomePlayButton";
// import TemplateAdjustableImageTextButton from "../template/TemplateAdjustableImageTextButton";

interface Props {
  isLogin: boolean;
  onLogin: () => void;
  onStartGame: () => void;
}

const WelcomePage = ({ isLogin, onLogin, onStartGame }: Props) => {
  const dispatch = useAppDispatch();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState<number>(0);

  const adjustSize = () => {
    if (textRef.current) {
      const parentWidth = textRef.current.offsetWidth;
      setFontSize(parentWidth / 25);
    }
  };

  useEffect(() => {
    adjustSize();

    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, []);

  const onClickConnectWallet = () => {
    onLogin();
  };

  const onClickPlay = () => {
    onStartGame();
  };

  return (
    <div className="welcome-page-container">
      <img src={background_back} className="welcome-page-background-back" />
      <img src={sponsor_frame} className="welcome-page-sponsor-frame" />
      <img src={background_front} className="welcome-page-background-front" />
      <img src={logo} className="welcome-page-logo-image" />
      {isLogin ? (
        <div className="welcome-page-play-button">
          <WelcomePlayButton onClick={onClickPlay} isDisabled={false} />
        </div>
      ) : (
        <div className="welcome-page-connect-wallet-button">
          <WelcomeConnectWalletButton
            onClick={onClickConnectWallet}
            isDisabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
