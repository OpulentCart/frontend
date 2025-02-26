import React from "react";
import CountUp from "react-countup";

const AnimatedNumber = ({ from, to, duration, className }) => {
  return <CountUp start={from} end={to} duration={duration} separator="," className={className} />;
};

export default AnimatedNumber;
