document.addEventListener("DOMContentLoaded", () => {
  const chaneBtn = document.getElementById("chaneScheduleBtn");
  const deleteBtn = document.getElementById("deleteScheduleBtn");

  const token = localStorage.getItem("token");
  const schedule_id = localStorage.getItem("selectedScheduleId");

  if (!token || !schedule_id) {
    alert("Không tìm thấy thông tin lịch hoặc bạn chưa đăng nhập.");
    return;
  }

  // Hàm chuyển giờ sang phút để so sánh
  function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Xử lý nút Thay đổi lịch
  chaneBtn.addEventListener("click", async () => {
    const study_date = document.getElementById("studyDate").value;
    const start_time = document.getElementById("startTime").value;
    const end_time = document.getElementById("endTime").value;
    const slots = parseInt(document.getElementById("slots").value);

    if (!study_date || !start_time || !end_time || isNaN(slots)) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (slots <= 0) {
      alert("Số lượng slots phải là số nguyên dương.");
      return;
    }

    if (timeToMinutes(start_time) >= timeToMinutes(end_time)) {
      alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/schedule/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule_id,
          study_date,
          start_time,
          end_time,
          slots
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert("Lịch học đã được thay đổi thành công!");
        window.location.href = "his_schedule.html";
      } else {
        alert("Lỗi: " + (result.message || "Không thể thay đổi lịch học."));
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi lịch học:", err);
      alert("Đã xảy ra lỗi khi thay đổi lịch học.");
    }
  });

  // Xử lý nút Xóa lịch
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch này?")) return;

    try {
      const res = await fetch("http://localhost:3000/api/schedule/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ schedule_id })
      });

      const result = await res.json();

      if (res.ok) {
        alert("Lịch học đã được xóa thành công!");
        window.location.href = "his_schedule.html";
      } else {
        alert("Lỗi: " + (result.message || "Không thể xóa lịch học."));
      }
    } catch (err) {
      console.error("Lỗi khi xóa lịch học:", err);
      alert("Đã xảy ra lỗi khi xóa lịch học.");
    }
  });
});