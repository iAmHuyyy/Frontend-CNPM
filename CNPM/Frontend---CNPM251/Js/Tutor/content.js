document.addEventListener("DOMContentLoaded", async () => {
  const sectionId = localStorage.getItem("selectedSectionId");
  const token = localStorage.getItem("token");
  const contentList = document.getElementById("contentList");

  if (!sectionId || !token) {
    alert("Thiếu thông tin đăng nhập hoặc section.");
    window.location.href = "../login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/content?section_id=${sectionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const contents = await res.json();

    if (!Array.isArray(contents)) {
      throw new Error("Dữ liệu không hợp lệ");
    }

    if (contents.length === 0) {
      contentList.innerHTML = "<p>Chưa có nội dung nào được tạo.</p>";
      return;
    }

    contents.forEach(item => {
      const card = document.createElement("div");
      card.className = "content-card";

      const titleLabel = item.position === 1
        ? "Thông tin chung"
        : `Topic ${item.position - 1}`;

      card.innerHTML = `
        <h2>${titleLabel}: ${item.title}</h2>
        <p>${item.description}</p>
      `;

      contentList.appendChild(card);
    });
  } catch (err) {
    console.error("Lỗi khi tải nội dung:", err);
    contentList.innerHTML = "<p>Không thể tải dữ liệu nội dung.</p>";
  }

});