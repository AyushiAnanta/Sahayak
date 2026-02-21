import React from "react";
import { motion } from "motion/react";

const AnimatedImage = ({ src, delay }) => (
  <motion.img
    src={src}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
    transition={{ duration: 0.8, delay }}
    drag
    dragSnapToOrigin
    className="h-20 object-contain"
  />
);

const AuthIllustrations = () => {
  return (
    <div className="flex flex-col gap-8 mt-10">

      <div className="flex justify-center gap-16">
        <AnimatedImage src="/images/8.png" delay={0} />
        <AnimatedImage src="/images/5.png" delay={0.2} />
      </div>

      <div className="flex justify-center gap-12">
        <AnimatedImage src="/images/7.png" delay={0.4} />
        <AnimatedImage src="/images/1.png" delay={0.6} />
        <AnimatedImage src="/images/6.png" delay={0.8} />
      </div>

      <div className="flex justify-center">
        <AnimatedImage src="/images/3.png" delay={1} />
      </div>

      <div className="flex justify-center gap-12">
        <AnimatedImage src="/images/2.png" delay={1.2} />
        <AnimatedImage src="/images/4.png" delay={1.4} />
      </div>

    </div>
  );
};

export default AuthIllustrations;