import React from "react";
import SearchBar from "./SearchBar";
import StatusRoom from "./StatusRoom";
import StatusFee from "./StatusFee";
import RoomLabel from "./RoomLabel";
import UserIcon from "./UserIcon";
import UserGreeting from "./UserGreeting";
import UserMenu from "./UserMenu";

const Header = () => {
  return (
    <div>
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "10px 20px",
        }}
      >
        <UserMenu />
      </div>

      <div
        className="control-content"
        style={{
          width: "80%",
          height: 83,
          right: 0,
          top: 0,
          position: "fixed",
          background: "white",
          borderBottom: "1px #D2D2D2 solid",
        }}
      >
        <SearchBar />
        <StatusRoom />
        <StatusFee />
        <RoomLabel />
        <UserIcon />
      </div>
    </div>
  );
};

export default Header;
