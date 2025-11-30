document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const notificationList = document.getElementById("notificationList");

  if (!token) {
    alert("Bạn chưa đăng nhập.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const notifications = await res.json();

    if (!Array.isArray(notifications)) {
      throw new Error("Dữ liệu không hợp lệ");
    }

    if (notifications.length === 0) {
      notificationList.innerHTML = "<p>Chưa có thông báo nào.</p>";
      return;
    }

    notifications.forEach(item => {
      const card = document.createElement("div");
      card.className = "notification-card";

      card.innerHTML = `
        <h2>Thông báo #${item.notification_id}</h2>
        <p><strong>Nội dung:</strong> ${item.description}</p>
        <button class="delete-btn">Xóa</button>
      `;

      // Gắn sự kiện xóa
      const deleteBtn = card.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return;

        try {
          const delRes = await fetch(`http://localhost:3000/api/notifications/${item.notification_id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const data = await delRes.json();

          if (delRes.ok) {
            card.remove();
          } else {
            alert("Lỗi khi xóa: " + (data.message || "Không xác định"));
          }
        } catch (err) {
          console.error("Lỗi khi xóa thông báo:", err);
          alert("Không thể xóa thông báo. Vui lòng thử lại sau.");
        }
      });

      notificationList.appendChild(card);
    });
  } catch (err) {
    console.error("Lỗi khi tải thông báo:", err);
    notificationList.innerHTML = "<p>Không thể tải dữ liệu thông báo.</p>";
  }
});