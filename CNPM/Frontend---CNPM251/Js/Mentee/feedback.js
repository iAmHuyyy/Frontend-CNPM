document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  const token = localStorage.getItem("token");
  const rawSectionId = localStorage.getItem("selectedSectionId");

  if (!token || !rawSectionId) {
    alert("Thiếu thông tin đăng nhập hoặc section.");
    window.location.href = "login.html";
    return;
  }

  const section_id = parseInt(rawSectionId);
  if (isNaN(section_id)) {
    alert("Section ID không hợp lệ.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const description = document.getElementById("description").value.trim();
    if (!description) {
      alert("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ section_id, description })
      });

      const data = await res.json();

      if (res.ok) {
        alert(" Gửi phản hồi thành công!");
        window.location.href = "content.html";
      } else {
        alert(" Lỗi: " + (data.message || "Không xác định"));
      }
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
      alert("Không thể gửi phản hồi. Vui lòng thử lại sau.");
    }
  });
});