import React from "react";

export default (props: { name: string }) => {
  return (
    <>
      <h1>This is a component from App1 with name: {props.name}</h1>
    </>
  )
}