import "../styles/Footer.css";
import logo from "../assets/img/logo.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        

        <div className="footer-left">
          <div className="footer-title-wrapper">
            <img src={logo} alt="로고" className="footer-logo" />
            <div className="footer-title">Lion To-do Everyday</div>
          </div>
          <div className="footer-content">
            LTE는 한국항공대학교 멋쟁이사자처럼에서 개발한 투두 관리 기반의 웹 서비스입니다.
          </div>
        </div>

        <div className="footer-right">
          
          <div className="footer-info-group">
            <div className="footer-row">
              <span className="footer-label">상호명</span>
              <span className="footer-value">한국항공대학교 멋쟁이사자처럼</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">대표자</span>
              <span className="footer-value">전유안</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">주소</span>
              <span className="footer-value">경기도 고양시 항공대학로76 항공우주센터 3층 창업카페</span>
            </div>
          </div>

          <div className="footer-info-group">
            <div className="footer-row">
              <span className="footer-label">사업자등록번호</span>
              <span className="footer-value">333-22-55555</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">개인정보보호책임자</span>
              <span className="footer-value">전유안</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">이메일</span>
              <span className="footer-value">jey060920@naver.com</span>
            </div>
            <div className="footer-row">
              <span className="footer-label">전화번호</span>
              <span className="footer-value">010-9266-2765</span>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

export default Footer;