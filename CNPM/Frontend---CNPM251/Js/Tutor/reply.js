document.addEventListener("DOMContentLoaded", () => {
  const feedbackForm = document.getElementById("feedbackForm");

  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const sectionId = localStorage.getItem("selectedSectionId");
    const userId = localStorage.getItem("studentId");
    const description = document.getElementById("description").value;

    if (!token || !sectionId || !userId) {
      alert("Thiếu thông tin đăng nhập hoặc học phần.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/feedback/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          section_id: sectionId,
          user_id: userId,
          description: description
        })
      });

      const result = await response.json();

      if (result.success) {
        alert("Phản hồi đã được gửi thành công!");
        window.history.back();
      } else {
        alert("Gửi phản hồi thất bại: " + result.message);
      }
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
      alert("Đã xảy ra lỗi khi gửi phản hồi.");
    }
  });
});