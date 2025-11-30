document.addEventListener("DOMContentLoaded", async function () {
  const accessToken = localStorage.getItem("token");

  if (!accessToken) {
    alert("Bạn chưa đăng nhập.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin hồ sơ");
    }

    const profileData = await response.json();

    // Các field chung
    const commonFields = [
      "user_id", "fullname", "dob", "gender", "cccd",
      "phone", "edu_email", "email"
    ];

    commonFields.forEach(field => {
      const element = document.getElementById(field);
      if (element && profileData[field] !== undefined) {
        element.textContent = profileData[field];
      }
    });

    // Phân nhánh theo role
    if (profileData.role === "mentee") {
      const menteeFields = ["faculty", "major", "program"];
      menteeFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && profileData[field] !== undefined) {
          element.textContent = profileData[field];
        }
      });
    } else if (profileData.role === "tutor") {
      const tutorFields = ["faculty", "department", "position", "academicLevel"];
      tutorFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && profileData[field] !== undefined) {
          element.textContent = profileData[field];
        }
      });
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu hồ sơ:", error);
    alert("Đã xảy ra lỗi khi tải thông tin cá nhân.");
  }
});