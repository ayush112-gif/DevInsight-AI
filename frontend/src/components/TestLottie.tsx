import Lottie from "lottie-react";
import aiBrain from "../animations/ai-brain.json";

function TestLottie() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div style={{ width: 400 }}>
        <Lottie
          animationData={aiBrain}
          loop={true}
        />
      </div>
    </div>
  );
}

export default TestLottie;