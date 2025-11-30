document.addEventListener("DOMContentLoaded", async () => {
  const sectionList = document.getElementById("sectionList");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Bạn chưa đăng nhập.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/getsection", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const sections = await res.json();

    if (!Array.isArray(sections)) {
      throw new Error("Dữ liệu không hợp lệ");
    }

    if (sections.length === 0) {
      sectionList.innerHTML = "<p>Chưa có section nào được tạo.</p>";
      return;
    }

    sections.forEach(section => {
      const card = document.createElement("div");
      card.className = "section-card";

      card.innerHTML = `
        <h2>${section.section_code} - ${section.semester}</h2>
        <p><strong>Môn học:</strong> ${section.course_code} - ${section.title}</p>
        <p><strong>Ngôn ngữ:</strong> ${section.language}</p>
        <p><strong>Tín chỉ:</strong> ${section.credits}</p>
        <p><strong>Ngày tạo:</strong> ${new Date(section.created_at).toLocaleDateString()}</p>
        <button class="schedule-btn" data-id="${section.section_id}">Tạo lịch học</button>
        <button class="content-btn" data-id="${section.section_id}">Chi tiết</button>
      `;

      // Xử lý click nút tạo lịch học
      card.querySelector(".schedule-btn").addEventListener("click", () => {
        localStorage.setItem("selectedSectionId", section.section_id);
        window.location.href = "createschedule.html";
      });

      //Xử lý click nút tạo nội dung
      card.querySelector(".content-btn").addEventListener("click", () => {
        localStorage.setItem("selectedSectionId", section.section_id);
        window.location.href = "content.html";
      });

      sectionList.appendChild(card);
    });
  } catch (err) {
    console.error("Lỗi khi tải section:", err);
    sectionList.innerHTML = "<p>Không thể tải dữ liệu section.</p>";
  }
});