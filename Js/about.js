/* =========================================
   FILE: js/about.js
   MÔ TẢ: Xử lý logic cho trang Về Chúng Tôi
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Trang About đã tải xong!");

    // --- 1. Xử lý Thanh Tìm Kiếm (Header) ---
    // (Copy logic từ home.js để đảm bảo header hoạt động mọi nơi)
    const searchInput = document.querySelector('.custom-search-input'); // Hoặc id #searchInput tùy HTML bạn đặt
    const searchIcon = document.querySelector('.custom-search-icon');

    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            [cite_start]// Chuyển hướng theo API List STT 9 [cite: 10]
            console.log(`🔍 Search: ${query}`);
            window.location.href = `../pages/search-results.html?subject=${encodeURIComponent(query)}`;
        } else {
            alert("Vui lòng nhập từ khóa tìm kiếm!");
        }
    }

    // Gắn sự kiện click cho icon
    if (searchIcon) {
        searchIcon.addEventListener('click', handleSearch);
    }

    // Gắn sự kiện Enter cho input
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    // --- 2. Các hiệu ứng khác (Nếu có) ---
    // Ví dụ: Animation cho ảnh hoặc text khi cuộn trang
});