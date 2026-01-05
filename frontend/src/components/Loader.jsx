import React from "react";
import { Slab } from "react-loading-indicators";

const Loader = ({
  color = "#32cd32",
  size = "large",
  text = "Loading...",
  textColor = "#213449",
}) => {
  return (
    <div style={styles.container}>
      <Slab color={color} size={size} text={text} textColor={textColor} />
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Loader;
