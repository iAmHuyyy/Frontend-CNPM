/* =========================================
   CONSTANTS & CONFIG
   ========================================= */
// Đường dẫn gốc của API
const API_BASE_URL = '/api';

/* =========================================
   UI INTERACTION LOGIC (Xử lý giao diện)
   ========================================= */

// 1. Xử lý sự kiện Tìm kiếm (Search)
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';

    if (query) {
        console.log(`🔍 Đang tìm kiếm với từ khóa: ${query}`);
        
        // [CẬP NHẬT LOGIC API]
        // Dựa trên API List STT 9: GET /api/tutors?subject=... 
        // Chuyển hướng người dùng sang trang kết quả tìm kiếm kèm query params
        window.location.href = `/search-results.html?subject=${encodeURIComponent(query)}`;
    } else {
        alert("Vui lòng nhập môn học hoặc tên gia sư để tìm kiếm!");
    }
}

// Hỗ trợ nhấn Enter để search
document.addEventListener('DOMContentLoaded', function() {
    const inputElement = document.getElementById('searchInput');
    if(inputElement) {
        inputElement.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
            }
        });
    }
});

// 2. Xử lý chọn Role trong bảng Sign Up (Mentee/Tutor)
let selectedRole = 'Mentee'; // Mặc định

function selectRole(button, roleName) {
    // Xóa active cũ
    document.querySelectorAll('.btn-role').forEach(btn => btn.classList.remove('active'));
    // Thêm active mới
    button.classList.add('active');
    
    // Cập nhật biến state
    selectedRole = roleName;
    console.log(`👤 Đã chọn vai trò: ${selectedRole}`);
}

/* =========================================
   API INTERACTION LOGIC (Xử lý dữ liệu)
   ========================================= */

// 3. Xử lý Đăng nhập (LOGIN)
function handleLogin() {
    console.log("🚀 Đang chuyển hướng đến trang Đăng nhập SSO...");
    
    // [CẬP NHẬT LOGIC API]
    // Dựa trên API List STT 1: GET /api/auth/sso/login 
    // Chuyển hướng trình duyệt sang trang đăng nhập tập trung của trường
    window.location.href = `${API_BASE_URL}/auth/sso/login`;
}

// 4. Xử lý Đăng ký (SIGN UP)
// Lưu ý: Vì dùng SSO, ta không tạo user/pass mới tại đây mà thường là redirect qua SSO
// hoặc gửi thông tin Role bổ sung.
function handleSignupSubmit() {
    // Lấy thông tin từ form (để minh họa)
    const usernameInput = document.querySelector('#offcanvasSignup input[placeholder="usernameID"]');
    const passwordInput = document.querySelector('#offcanvasSignup input[placeholder="password"]');
    
    const userData = {
        username: usernameInput ? usernameInput.value : '',
        role: selectedRole
        // Password thường không gửi ở đây nếu dùng SSO của trường
    };

    if(!userData.username) {
        alert("Vui lòng nhập Username!");
        return;
    }

    console.log("📝 Gửi yêu cầu đăng ký:", userData);

    // LOGIC THỰC TẾ VỚI SSO:
    // Bước 1: Lưu tạm Role mà người dùng chọn vào LocalStorage
    localStorage.setItem('temp_user_role', selectedRole);
    
    // Bước 2: Chuyển hướng sang SSO để xác thực tài khoản trường trước
    // Dựa trên API List STT 1: GET /api/auth/sso/login 
    alert(`Hệ thống sẽ chuyển bạn đến trang SSO để xác thực tài khoản sinh viên.\nVai trò đăng ký: ${selectedRole}`);
    window.location.href = `${API_BASE_URL}/auth/sso/login`;

    /* Ghi chú: Sau khi SSO trả về (Callback - STT 2), bạn sẽ gọi API 
       PUT /api/users/me/profile (STT 5) để cập nhật Role này cho user.
    */
}

// Gắn sự kiện cho nút "Sign up" to bự trong form
document.addEventListener('DOMContentLoaded', function() {
    const signupBtn = document.querySelector('#offcanvasSignup .btn-login-submit');
    if(signupBtn) {
        signupBtn.addEventListener('click', handleSignupSubmit);
        // Đổi text nút thành "Sign up with SSO" cho đúng logic nếu cần
        // signupBtn.innerText = "Continue with SSO";
    }
    
    // Gắn sự kiện cho nút "Log in" trong form Login
    const loginBtn = document.querySelector('#offcanvasLogin .btn-login-submit');
    if(loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
});

// 5. Xử lý nút Explore (Khám phá chương trình)
function scrollToPrograms() {
    console.log("📂 Đang tải danh sách chương trình...");
    
    // [CẬP NHẬT LOGIC API]
    // Dựa trên API List STT 6: GET /api/programs 
    window.location.href = `/programs.html`; // Hoặc gọi API fetch('/api/programs')
}