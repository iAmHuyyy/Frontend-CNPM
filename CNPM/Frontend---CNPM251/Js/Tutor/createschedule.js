document.addEventListener("DOMContentLoaded", () => {
  const addScheduleBtn = document.getElementById("addScheduleBtn");

  // Hàm chuyển giờ sang phút để so sánh
  function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  addScheduleBtn.addEventListener("click", async () => {
    const study_date = document.getElementById("studyDate").value;
    const start_time = document.getElementById("startTime").value;
    const end_time = document.getElementById("endTime").value;
    const slots = parseInt(document.getElementById("slots").value);
    const section_id = parseInt(localStorage.getItem("selectedSectionId"));
    const token = localStorage.getItem("token");

    // Kiểm tra dữ liệu đầu vào
    if (!study_date || !start_time || !end_time || isNaN(slots) || isNaN(section_id) || !token) {
      alert("Vui lòng điền đầy đủ thông tin và đảm bảo bạn đã đăng nhập.");
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
      const res = await fetch("http://localhost:3000/api/createschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          section_id,
          study_date,
          start_time,
          end_time,
          slots
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert("Lịch học đã được tạo thành công!");
        window.location.href = "section.html";
      } else {
        console.error("Lỗi từ server:", result);
        alert("Lỗi: " + (result.message || "Không thể tạo lịch học."));
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu tạo lịch học:", err);
      alert("Đã xảy ra lỗi khi tạo lịch học.");
    }
  });
});