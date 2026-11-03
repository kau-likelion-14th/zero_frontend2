import "../styles/Header.css";
import "../styles/Footer.css";
import logo from "../assets/img/logo.png";
import LogoutIcon from "../assets/icon/logout.png";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../Api";
import config from "../Config";
import {useRef, useState} from "react";


function Header() {
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);
    const loggingOutRef = useRef(false);

    let userName = "";

    try{
        userName = 
            JSON.parse(
                localStorage.getItem("user") ||"null"
        )?.username || "";
    } catch (error){
        
    }

    const handlogout = async () =>{
        if(loggingOutRef.current) return;
        loggingOutRef.current = true;
        setLoggingOut(true);

        try{
            const {data} = await api.post(
                config.AUTH.LOGOUT,
                {}
            );

            if (data?.isSuccess === false){
                throw new Error("로그아웃 실패");
            }

            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:changed"));

            navigate("/login", {replace: true});
        } catch (error) {
            console.error("로그아웃 오류: ", error);
            alert("로그아웃에 실패했습니다.");
        } finally {
            loggingOutRef.current = false;
            setLoggingOut(false);
        }
    };
    
    return (
        <header className="header">
            {/*로고*/}
            <div className="header-left">
                <img src={logo} alt="LTE 로고" className="header-logo"/>
                <span className="header-title">Lion To-do Everyday</span>
            </div>

            {/*메뉴*/}
            <nav className="header-nav">
                <NavLink to="/" className={({isActive}) => isActive ? "nav-item active": "nav-item"}>
                    홈
                </NavLink>

                <NavLink to="/friends" className={({isActive}) => isActive ? "nav-item active": "nav-item"}>
                    친구
                </NavLink>

                <NavLink to="/mypage" className={({isActive}) => isActive ? "nav-item active": "nav-item"}>
                    마이페이지
                </NavLink>

            </nav>

            {/*사용자 정보*/}
            <div className="header-right">
                <span className="user-name">{userName ? `${userName}님` : ""}
                </span>
                <img src={LogoutIcon} alt="로그아웃" className="logout-icon" onClick={handlogout}
                role="button" tabIndex={0} aria-disabled={loggingOut}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handlogout();
                    }
                }}/>

            </div>

        </header>
    );
}

export default Header;
