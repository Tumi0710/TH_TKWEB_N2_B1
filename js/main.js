/**
 * AUTOMIZE - Main JavaScript File
 * Tính năng: Giỏ hàng, Auth, Search (Nâng cao), Menu
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        console.log("System Ready.");

        // 1. Chạy các hệ thống chính
        initCartSystem(); 
        initAuthSystem();
        initSearchSystem(); // <--- MỚI: Hệ thống tìm kiếm nâng cao
        
        // 2. Chạy các UI functions
        initMobileMenu();
        initProductTabs();
        initCountdown();
        initWishlist();
        initScrollEffects();
        initNewsletterForm();
        
        // Kiểm tra nếu có tham số tìm kiếm trên URL (khi chuyển từ Home sang Shop)
        checkUrlSearchParam();
    });

    /* ==================================================================
       1. HỆ THỐNG TÌM KIẾM (SEARCH SYSTEM) - MỚI
       ================================================================== */
    function initSearchSystem() {
        // Bắt sự kiện click nút kính lúp
        $(document).on('click', '.search-bar button', function(e) {
            e.preventDefault();
            performSearch();
        });

        // Bắt sự kiện nhấn Enter trong ô input
        $(document).on('keypress', '.search-bar input', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                performSearch();
            }
        });
    }

    // Hàm thực hiện tìm kiếm
    function performSearch() {
        var keyword = $('.search-bar input').val().trim().toLowerCase();

        if (keyword.length === 0) {
            showNotification('Vui lòng nhập từ khóa!', 'error');
            return;
        }

        // Kiểm tra xem đang ở trang nào
        // Nếu ĐANG ở trang shop.html (hoặc có lưới sản phẩm .products-grid)
        if ($('.products-grid').length > 0) {
            filterProductsByKeyword(keyword);
        } 
        // Nếu KHÔNG phải trang shop (ví dụ đang ở Home), chuyển hướng sang shop
        else {
            // Chuyển hướng và kèm theo từ khóa trên URL
            window.location.href = 'shop.html?search=' + encodeURIComponent(keyword);
        }
    }

    // Hàm lọc sản phẩm trên trang Shop
    function filterProductsByKeyword(keyword) {
        var $products = $('.product-card');
        var count = 0;

        $products.each(function() {
            var title = $(this).find('.product-title').text().toLowerCase();
            
            // Nếu tên sản phẩm chứa từ khóa
            if (title.includes(keyword)) {
                $(this).fadeIn(300);
                count++;
            } else {
                $(this).fadeOut(300);
            }
        });

        // Cuộn xuống phần kết quả
        $('html, body').animate({
            scrollTop: $('.shop-section').offset().top - 100
        }, 500);

        // Hiển thị thông báo kết quả
        if (count > 0) {
            showNotification(`Tìm thấy ${count} sản phẩm cho "${keyword}"`);
            $('.result-count').html(`Found <strong>${count}</strong> results for "<strong>${keyword}</strong>"`);
        } else {
            showNotification(`Không tìm thấy sản phẩm nào!`, 'error');
            $('.result-count').html(`No results found for "<strong>${keyword}</strong>"`);
        }
    }

    // Hàm kiểm tra URL khi mới vào trang (Dành cho việc chuyển từ Home -> Shop)
    function checkUrlSearchParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchKeyword = urlParams.get('search');

        if (searchKeyword && $('.products-grid').length > 0) {
            // Điền lại từ khóa vào ô tìm kiếm
            $('.search-bar input').val(searchKeyword);
            
            // Đợi 1 chút cho trang load xong rồi lọc
            setTimeout(function() {
                filterProductsByKeyword(searchKeyword.toLowerCase());
            }, 500);
        }
    }

    /* ==================================================================
       2. HỆ THỐNG GIỎ HÀNG (AN TOÀN)
       ================================================================== */
    function initCartSystem() {
        const $cartSidebar = $('.cart-sidebar');
        const $cartOverlay = $('.cart-overlay');
        const $cartItemsContainer = $('.cart-items-container');
        const $subtotalEl = $('#cart-subtotal');
        const $cartTotalCountEl = $('#cart-total-count');
        const $badgeEl = $('.header-icons .icon-btn').eq(2).find('.badge');

        let cart = [];
        try {
            const storedCart = localStorage.getItem('automize_cart');
            if (storedCart) cart = JSON.parse(storedCart);
        } catch (e) {
            localStorage.removeItem('automize_cart');
            cart = [];
        }
        
        updateCartUI();

        $(document).on('click', '#header-cart-btn', function(e) {
            e.preventDefault();
            $cartSidebar.addClass('open');
            $cartOverlay.fadeIn(300);
        });

        $(document).on('click', '.close-cart, .cart-overlay', function() {
            $cartSidebar.removeClass('open');
            $cartOverlay.fadeOut(300);
        });

        $(document).on('click', '.add-to-cart, .btn-cart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $btn = $(this);
            var $card = $btn.closest('.product-card, .flash-card');

            if ($card.length === 0) return;

            var title = $card.find('.product-title, .flash-title').text().trim();
            var priceText = $card.find('.price-current, .flash-price').clone().children().remove().end().text();
            var price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if(isNaN(price)) price = 0;
            var image = $card.find('img').attr('src');

            var originalText = $btn.text();
            $btn.text('Adding...');
            $btn.prop('disabled', true);

            var existingItem = cart.find(item => item.title === title);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ title, price, image, quantity: 1 });
            }

            saveCart();
            updateCartUI();
            
            $cartSidebar.addClass('open');
            $cartOverlay.fadeIn(300);
            showNotification('Đã thêm vào giỏ hàng!');

            setTimeout(function() {
                $btn.text(originalText);
                $btn.prop('disabled', false);
            }, 500);
        });

        function saveCart() {
            localStorage.setItem('automize_cart', JSON.stringify(cart));
        }

        function updateCartUI() {
            $cartItemsContainer.empty();
            let totalAmount = 0;
            let totalCount = 0;

            if (cart.length === 0) {
                $cartItemsContainer.html(`
                    <div class="cart-empty-state" style="text-align:center; padding:50px 0; color:#888;">
                        <i class="fa fa-shopping-cart" style="font-size:30px; margin-bottom:10px; display:block;"></i>
                        Giỏ hàng trống
                    </div>
                `);
            } else {
                cart.forEach((item, index) => {
                    totalAmount += item.price * item.quantity;
                    totalCount += item.quantity;

                    var itemHTML = `
                        <div class="cart-item">
                            <div class="cart-item-img"><img src="${item.image}"></div>
                            <div class="cart-item-details">
                                <div class="cart-item-title">${item.title}</div>
                                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                                <div class="cart-item-actions">
                                    <div class="qty-control">
                                        <button class="qty-btn minus" data-index="${index}">-</button>
                                        <span class="qty-val">${item.quantity}</span>
                                        <button class="qty-btn plus" data-index="${index}">+</button>
                                    </div>
                                    <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    `;
                    $cartItemsContainer.append(itemHTML);
                });
            }

            $subtotalEl.text('$' + totalAmount.toFixed(2));
            $cartTotalCountEl.text(`(${totalCount})`);
            if($badgeEl.length) $badgeEl.text(totalCount);
        }

        $(document).on('click', '.remove-item', function() {
            cart.splice($(this).data('index'), 1); saveCart(); updateCartUI();
        });

        $(document).on('click', '.plus', function() {
            cart[$(this).data('index')].quantity++; saveCart(); updateCartUI();
        });

        $(document).on('click', '.minus', function() {
            var index = $(this).data('index');
            if (cart[index].quantity > 1) { cart[index].quantity--; saveCart(); updateCartUI(); } 
            else { if(confirm('Xóa sản phẩm này?')) { cart.splice(index, 1); saveCart(); updateCartUI(); } }
        });
    }

    /* ==================================================================
       3. HỆ THỐNG AUTH (ĐĂNG NHẬP)
       ================================================================== */
    function initAuthSystem() {
        const $modal = $('#auth-modal');
        let user = null;
        try { user = JSON.parse(localStorage.getItem('automize_user')); } catch(e) {}

        if (!user) {
            $modal.addClass('forced').show().css('display', 'flex');
            $('body').addClass('auth-locked');
        } else {
            $('#user-display-name').text(user.name);
            $('#user-status').text('Logout').css('color', '#ff4444');
        }

        $(document).on('click', '#account-btn', function() {
            if (localStorage.getItem('automize_user')) {
                if(confirm('Đăng xuất?')) {
                    localStorage.removeItem('automize_user');
                    location.reload(); 
                }
            } else {
                $modal.removeClass('forced').fadeIn(300).css('display', 'flex');
            }
        });

        $(document).on('click', '.modal-close', function() {
            if (!$modal.hasClass('forced')) $modal.fadeOut(300);
        });

        $(document).on('click', '.auth-tab', function() {
            $('.auth-tab').removeClass('active');
            $(this).addClass('active');
            $('.auth-form').removeClass('active');
            $('#' + $(this).data('target')).addClass('active');
        });

        $('#register-form').on('submit', function(e) {
            e.preventDefault();
            alert("Đăng ký thành công! Mời đăng nhập.");
            $('.auth-tab[data-target="login-form"]').click();
        });

        $('#login-form').on('submit', function(e) {
            e.preventDefault();
            const mockUser = { name: $('#login-email').val().split('@')[0], email: $('#login-email').val() };
            localStorage.setItem('automize_user', JSON.stringify(mockUser));
            $modal.removeClass('forced').fadeOut(300);
            $('body').removeClass('auth-locked');
            $('#user-display-name').text(mockUser.name);
            $('#user-status').text('Logout').css('color', '#ff4444');
            showNotification('Đăng nhập thành công!');
        });
    }

    /* ==================================================================
       4. VISUAL EFFECTS
       ================================================================== */
    function initMobileMenu() {
        $(document).on('click', '.dropdown', function(e) {
            if ($(window).width() <= 768) {
                e.preventDefault();
                $(this).find('.dropdown-content').slideToggle(300);
            }
        });
    }
    
    function initProductTabs() {
        $(document).on('click', '.product-tabs button', function() {
            $('.product-tabs button').removeClass('active');
            $(this).addClass('active');
            $('.product-grid').hide().fadeIn(300);
        });
    }

    function initCountdown() {
        if($('.countdown').length === 0) return;
        setInterval(function() {
            $('.countdown').each(function() {
                var s = parseInt($(this).find('.countdown-item').eq(3).text()) || 0;
                if(s>0) s--; else s=59;
                $(this).find('.countdown-item').eq(3).find('.countdown-number').text(String(s).padStart(2,'0'));
            });
        }, 1000);
    }

    function initWishlist() {
        $(document).on('click', '.wishlist-btn', function(e) {
            e.preventDefault();
            $(this).toggleClass('active');
            if($(this).hasClass('active')) {
                $(this).css('color', 'red').text('❤');
                showNotification('Added to wishlist!');
            } else {
                $(this).css('color', '#999').text('♡');
            }
        });
    }

    function initScrollEffects() {
        $(window).on('scroll', function() {
            if ($(this).scrollTop() > 50) $('header').addClass('scrolled');
            else $('header').removeClass('scrolled');
        });
    }

    function initNewsletterForm() {
        $(document).on('click', '.newsletter button', function(e) {
            e.preventDefault();
            if ($('.newsletter input').val().includes('@')) {
                showNotification('Thank you for subscribing!');
                $('.newsletter input').val('');
            } else showNotification('Invalid email address', 'error');
        });
    }

    function showNotification(msg, type='success') {
        $('.notification').remove();
        var color = type === 'success' ? '#66cc33' : '#ff4444';
        $('body').append('<div class="notification" style="position:fixed; top:100px; right:20px; background:'+color+'; color:#fff; padding:15px; border-radius:5px; z-index:999999; box-shadow:0 5px 15px rgba(0,0,0,0.3); animation: slideInRight 0.3s ease;">'+msg+'</div>');
        setTimeout(function(){ $('.notification').fadeOut(500, function(){ $(this).remove(); }); }, 2000);
    }

    var style = document.createElement('style');
    style.innerHTML = `@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);

})(jQuery);