document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("enrollTableBody");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Vui lòng đăng nhập để xem danh sách lớp đã đăng ký.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/enrollments", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const enrollments = await res.json();

    if (!res.ok) {
      alert("Lỗi: " + (enrollments.message || "Không thể tải danh sách lớp."));
      return;
    }

    renderEnrollments(enrollments);
  } catch (err) {
    console.error("Lỗi khi tải danh sách lớp:", err);
    alert("Đã xảy ra lỗi khi tải danh sách lớp.");
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function renderEnrollments(data) {
    tableBody.innerHTML = "";

    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.course_code} - ${item.title}</td>
        <td>${item.tutor_name}</td>
        <td>${item.semester}</td>
        <td>${formatDate(item.enrolled_at)}</td>
        <td>${item.status}</td>
        <td><button class="cancel-btn" data-id="${item.schedule_id}">Hủy</button></td>
      `;
      tableBody.appendChild(row);
    });

    const cancelButtons = document.querySelectorAll(".cancel-btn");
    cancelButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const scheduleId = btn.getAttribute("data-id");
        if (!confirm("Bạn có chắc chắn muốn hủy đăng ký lịch này?")) return;

        try {
          const res = await fetch("http://localhost:3000/api/enrollment/cancel", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ schedule_id: scheduleId })
          });

          const result = await res.json();

          if (res.ok) {
            alert("Hủy đăng ký thành công!");
            location.reload();
          } else {
            alert("Lỗi: " + (result.message || "Không thể hủy đăng ký."));
          }
        } catch (err) {
          console.error("Lỗi khi hủy đăng ký:", err);
          alert("Đã xảy ra lỗi khi hủy đăng ký.");
        }
      });
    });
  }
});