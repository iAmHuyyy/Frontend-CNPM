/* --- LOGIC RIÊNG CHO TRANG PROFILE --- */

// 1. Xử lý nút Chỉnh sửa
// Tìm nút Edit bằng class (vì trong HTML mình đặt class .btn-edit-profile)
const editBtn = document.querySelector('.btn-edit-profile');
if (editBtn) {
    editBtn.addEventListener('click', function() {
        console.log("🔧 Đang mở chế độ chỉnh sửa hồ sơ...");
        // Logic: Có thể chuyển trang hoặc biến các text thành input
        // window.location.href = 'edit-profile.html';
        alert("Tính năng chỉnh sửa đang được phát triển (API PUT /api/users/me/profile)");
    });
}

// 2. Load dữ liệu người dùng (Giả lập gọi API)
// Hàm này sẽ chạy ngay khi trang Profile tải xong
function loadUserProfile() {
    // Kiểm tra xem có đang ở trang Profile không (dựa vào URL hoặc class body)
    // Hoặc đơn giản là kiểm tra xem có element chứa thông tin không
    const profilePage = document.querySelector('.profile-container');
    if (!profilePage) return; // Nếu không phải trang profile thì dừng

    console.log("📥 Đang tải thông tin người dùng từ API /api/users/me ...");

    /* [MÔ PHỎNG FETCH API]
       Dựa trên API List STT 4: GET /api/users/me
    */
    // fetch('/api/users/me')
    //    .then(res => res.json())
    //    .then(data => {
    //        document.querySelector('#userNameDisplay').innerText = data.fullName;
    //        document.querySelector('#userIDDisplay').innerText = data.id;
    //        // ... điền tiếp các trường khác
    //    });
}

// Gọi hàm load khi trang tải
document.addEventListener('DOMContentLoaded', loadUserProfile);