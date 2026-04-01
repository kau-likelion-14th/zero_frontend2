import React from "react";
import "../../styles/MainPage.css";
import CustomCalendar from "./Calendar";



const MainPage=() => {
    return(
        <div className="mainpage-container">
            <CustomCalendar/>
        </div>
    );
};

export default MainPage;