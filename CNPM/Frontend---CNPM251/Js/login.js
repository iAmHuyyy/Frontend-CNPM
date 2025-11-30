document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".login-btn");

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Redirect sang HCMUT_SSO với tham số redirect=appchinh
    const ssoUrl = "http://localhost:5500/Service/HCMUT_SSO/frontend/login.html?redirect=appchinh";
    window.location.href = ssoUrl;
  });

  // Khi quay lại từ SSO, kiểm tra trạng thái đăng nhập ở backend app chính
  async function checkSSOStatus() {
    try {
      const res = await fetch("http://localhost:3000/api/sso/status", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (data.success) {
        console.log("User đã đăng nhập:", data);

        // Gọi API tới HCMUT_DATACORE để lấy thông tin chi tiết với token SSO
        const datacoreRes = await fetch("http://localhost:5000/api/info", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.ssoToken}`
          }
        });

        const datacoreInfo = await datacoreRes.json();
        console.log("Thông tin từ DATACORE:", datacoreInfo);

        // Gọi API update.js ở backend app chính để cập nhật thông tin vào database
        await fetch("http://localhost:3000/api/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.internalToken}`
          },
          body: JSON.stringify(datacoreInfo)
        });

        // Lưu role, fullname và token vào localStorage
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.id);

        // fullname lấy từ DATACORE
        if (datacoreInfo.fullName) {
          localStorage.setItem("fullname", datacoreInfo.fullName);
        }

        // Lưu cả token SSO và token nội bộ
        localStorage.setItem("ssoToken", data.ssoToken);
        localStorage.setItem("token", data.internalToken);

        // Kiểm tra role và điều hướng
        if (data.role === "mentee") {
          window.location.href = "../html/Mentee/home.html";
        } else if (data.role === "tutor") {
          window.location.href = "../html/Tutor/home.html";
        }

      } else {
        console.log("Chưa có user đăng nhập qua SSO");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API /api/sso/status:", err);
    }
  }

  // Gọi checkSSOStatus ngay khi load trang
  checkSSOStatus();
});