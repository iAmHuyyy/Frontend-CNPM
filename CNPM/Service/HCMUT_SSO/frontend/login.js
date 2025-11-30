document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Gửi request đăng nhập đến HCMUT_SSO (port 4000)
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Đăng nhập thất bại");
        return;
      }

      // Kiểm tra tham số redirect trong URL
      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect");

      if (redirectTarget === "appchinh") {
        // Nếu đến từ app chính → gửi token + user về app chính qua API callback
        await fetch("http://localhost:3000/api/sso/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: data.token,
            user: data.user
          })
        });

        // Redirect người dùng về app chính
        window.location.href = "http://localhost:5500/Frontend---CNPM251/html/login.html";
      } else {
        // Nếu người dùng login trực tiếp vào SSO
        alert("Đăng nhập thành công vào HCMUT_SSO!");
        // Có thể redirect sang trang dashboard của SSO
        window.location.href = "/dashboard.html";
      }
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);
      alert("Không thể kết nối đến server HCMUT_SSO");
    }
  });
});