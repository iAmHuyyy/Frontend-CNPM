function initProfilePanel() {
  const profileIcon = document.querySelector(".profile-icon");
  if (!profileIcon) return;

  const fullname = localStorage.getItem("fullname") || "Người dùng";

  const profilePanel = document.createElement("div");
  profilePanel.classList.add("profile-panel");
  profilePanel.innerHTML = `
    <div class="panel-header">
        <strong>${fullname}</strong><br>
        <span>Vai trò - Mentee</span>
    </div>
    <ul class="panel-menu">
        <li><a href="http://localhost:5500/Frontend---CNPM251/html/Mentee/progress.html" id="progress">Tiến độ học tập</a></li>
        <li><a href="http://localhost:5500/Frontend---CNPM251/html/Mentee/enroll.html" id="register">Đăng ký chương trình</a></li>
        <li><a href="http://localhost:5500/Frontend---CNPM251/html/Mentee/his_enroll.html" id="history">Lịch sử đăng ký học tập</a></li>
        <li><a href="http://localhost:5500/Frontend---CNPM251/html/Mentee/notification.html" id="notifications">Thông báo</a></li>
        <li><a href="#" id="messages">Tin nhắn</a></li>
        <li><a href="http://localhost:5500/Frontend---CNPM251/html/Mentee/profile.html" id="profile">Thông tin cá nhân</a></li>
        <li><a href="#" id="settings">Cài đặt tài khoản</a></li>
        <li><a href="#" id="logout">Đăng xuất</a></li>
    </ul>
  `;

  document.body.appendChild(profilePanel);
  profilePanel.style.display = "none";

  profileIcon.addEventListener("click", () => {
    profilePanel.style.display =
      profilePanel.style.display === "none" ? "block" : "none";
  });

// Chức năng của nút Đăng xuất
const logoutBtn = profilePanel.querySelector("#logout");
logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:3000/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (data.success) {
      console.log(" Đã đăng xuất ở backend");
    } else {
      console.warn(" Backend báo không có user đăng nhập");
    }
  } catch (err) {
    console.error(" Lỗi khi gọi API logout:", err);
  }
  localStorage.clear();
  window.location.href = "http://localhost:5500/Frontend---CNPM251/html/login.html";
});
  
}

// chức năng nút Home
function initHome() {
  const homeLink = document.querySelector('.home');
  if (!homeLink) {
    console.warn("Không tìm thấy nút Home trong header");
    return;
  }

  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "http://localhost:5500/Frontend---CNPM251/html/Mentee/home.html";
  });
}