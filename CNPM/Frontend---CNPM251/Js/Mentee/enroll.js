document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("scheduleTableBody");
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:3000/api/schedules", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const schedules = await res.json();

    if (!res.ok) {
      alert("Lỗi: " + (schedules.message || "Không thể tải danh sách lịch học."));
      return;
    }

    renderSchedule(schedules);
  } catch (err) {
    console.error("Lỗi khi tải danh sách lịch học:", err);
    alert("Đã xảy ra lỗi khi tải danh sách lịch học.");
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function renderSchedule(data) {
    tableBody.innerHTML = "";

    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.course_code} - ${item.title}</td>
        <td>${item.tutor_name}</td>
        <td>${formatDate(item.study_date)}</td>
        <td>${item.start_time} - ${item.end_time}</td>
        <td>${item.slots}</td>
        <td>${item.semester}</td>
        <td><button class="enroll-btn" data-id="${item.schedule_id}">Đăng ký</button></td>
      `;
      tableBody.appendChild(row);
    });

    // Gắn sự kiện cho nút "Đăng ký"
    const enrollButtons = document.querySelectorAll(".enroll-btn");
    enrollButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const scheduleId = btn.getAttribute("data-id");

        try {
          const res = await fetch("http://localhost:3000/api/enroll", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ schedule_id: scheduleId })
          });

          const result = await res.json();

          if (res.ok) {
            alert("Đăng ký thành công!");
          } else {
            alert("Lỗi: " + (result.message || "Không thể đăng ký."));
          }
        } catch (err) {
          console.error("Lỗi khi đăng ký:", err);
          alert("Đã xảy ra lỗi khi đăng ký.");
        }
      });
    });
  }
});