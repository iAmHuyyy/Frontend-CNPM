document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createContentForm");
  const sectionId = localStorage.getItem("selectedSectionId");
  const token = localStorage.getItem("token");

  if (!sectionId || !token) {
    alert("Thiếu thông tin đăng nhập hoặc section.");
    window.location.href = "login.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const position = document.getElementById("position").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    try {
      const res = await fetch("http://localhost:3000/api/content/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          section_id: parseInt(sectionId),
          position: parseInt(position),
          title,
          description
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Tạo nội dung thành công!");
        window.location.href = "content.html";
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi khi gửi nội dung:", err);
      alert("Không thể tạo nội dung.");
    }
  });
});