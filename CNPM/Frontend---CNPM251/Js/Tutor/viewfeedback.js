document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const sectionId = localStorage.getItem("selectedSectionId");
  const feedbackList = document.getElementById("feedbackList");

  if (!token || !sectionId) {
    alert("Bạn chưa đăng nhập hoặc chưa chọn section.");
    window.location.href = "login.html";
    return;
  }

  try {
    // gửi section_id qua query string
    const res = await fetch(`http://localhost:3000/api/feedback/tutor?section_id=${sectionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const feedbacks = await res.json();

    if (!Array.isArray(feedbacks)) {
      throw new Error("Dữ liệu không hợp lệ");
    }

    if (feedbacks.length === 0) {
      feedbackList.innerHTML = "<p>Chưa có feedback nào.</p>";
      return;
    }

    feedbacks.forEach(item => {
      const card = document.createElement("div");
      card.className = "feedback-card";

      card.innerHTML = `
        <h2>${item.fullname} (MSSV: ${item.student_id})</h2>
        <p><strong>Thời gian:</strong> ${new Date(item.created_at).toLocaleString()}</p>
        <p><strong>Nội dung:</strong> ${item.description}</p>
        <div class="card-actions">
          <button class="reply-btn">Phản hồi</button>
          <button class="delete-btn">Xóa</button>
        </div>
      `;

      // Gắn sự kiện cho nút Phản hồi
      const replyBtn = card.querySelector(".reply-btn");
      replyBtn.addEventListener("click", () => {
        localStorage.setItem("studentId", item.student_id);
        window.location.href = "reply.html";
      });

      // Gắn sự kiện cho nút Xóa
      const deleteBtn = card.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Bạn có chắc muốn xóa feedback này?")) return;

        try {
          const delRes = await fetch(`http://localhost:3000/api/feedback/${item.feedback_id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const data = await delRes.json();

          if (delRes.ok) {
            alert("Đã xóa feedback thành công!");
            card.remove();
          } else {
            alert("Lỗi khi xóa: " + (data.message || "Không xác định"));
          }
        } catch (err) {
          console.error("Lỗi khi xóa feedback:", err);
          alert("Không thể xóa feedback. Vui lòng thử lại sau.");
        }
      });

      feedbackList.appendChild(card);
    });
  } catch (err) {
    console.error("Lỗi khi tải feedback:", err);
    feedbackList.innerHTML = "<p>Không thể tải dữ liệu feedback.</p>";
  }
});