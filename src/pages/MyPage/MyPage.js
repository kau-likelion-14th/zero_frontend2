import Profile from "./Profile";
import Status from "./Status";
import "../../styles/MyPage.css";

function MyPage() {
    return (
        <div className="mypage-container">
            <Profile />
            <Status />
        </div>
    );
}

export default MyPage;