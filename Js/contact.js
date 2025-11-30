/* =========================================
   FILE: js/contact.js
   MÔ TẢ: Xử lý logic gửi form liên hệ
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {
    console.log("📞 Trang Contact đã tải xong!");

    // --- 1. Xử lý Thanh Tìm Kiếm (Header) ---
    // Vẫn cần đoạn này để header không bị "chết"
    const searchInput = document.querySelector('.form-control[placeholder=""]'); // Tìm input search (hoặc gán ID cho chính xác)
    // Lưu ý: Trong HTML contact bạn chưa đặt ID cho search input, 
    // tốt nhất nên thêm id="searchInput" vào file contact.html giống home.html
    
    // Nếu bạn đã thêm id="searchInput" thì dùng dòng dưới:
    // const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                alert("Chức năng tìm kiếm đang hoạt động: " + this.value);
            }
        });
    }

    // --- 2. Xử lý Form Liên Hệ ---
    const btnSend = document.querySelector('.btn-send');
    
    if (btnSend) {
        btnSend.addEventListener('click', function() {
            // Lấy dữ liệu từ form
            // (Lưu ý: Bạn nên thêm id cho các input trong contact.html để select chính xác hơn)
            const inputs = document.querySelectorAll('form input, form textarea');
            const name = inputs[0].value.trim();
            const email = inputs[1].value.trim();
            const message = inputs[2].value.trim();

            // Validate đơn giản
            if (!name || !email || !message) {
                alert("Vui lòng điền đầy đủ thông tin!");
                return;
            }

            if (!validateEmail(email)) {
                alert("Email không hợp lệ!");
                return;
            }

            // Gửi dữ liệu (Giả lập)
            console.log("📤 Đang gửi liên hệ:", { name, email, message });
            
            // Vì API List chưa có endpoint Contact, ta alert mô phỏng
            alert("Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm.");
            
            // Reset form
            inputs.forEach(input => input.value = '');
        });
    }
});

// Hàm kiểm tra email cơ bản
function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}