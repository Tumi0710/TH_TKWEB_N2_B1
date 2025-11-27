/**
 * AUTOMIZE - Main JavaScript File
 * Automotive E-commerce Website
 */

(function($) {
    'use strict';

    // Document Ready
    $(document).ready(function() {
        
        // Initialize all functions
        initMobileMenu();
        initProductTabs();
        initCountdown();
        initWishlist();
        initScrollEffects();
        initNewsletterForm();
        initSearchBar();
        initCartFunctionality();
        
    });

    /**
     * Mobile Menu Toggle
     */
    function initMobileMenu() {
        // Dropdown toggle for mobile
        $('.dropdown').on('click', function(e) {
            if ($(window).width() <= 768) {
                e.preventDefault();
                $(this).find('.dropdown-content').slideToggle(300);
                $(this).toggleClass('active');
            }
        });

        // Close dropdown when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.dropdown').length) {
                $('.dropdown-content').slideUp(300);
                $('.dropdown').removeClass('active');
            }
        });
    }

    /**
     * Product Tabs Switching
     */
    function initProductTabs() {
        $('.product-tabs button').on('click', function() {
            // Remove active class from all buttons
            $('.product-tabs button').removeClass('active');
            
            // Add active class to clicked button
            $(this).addClass('active');
            
            // Get tab data
            var tabName = $(this).data('tab');
            
            // Here you can add AJAX call to load different products
            // or filter existing products based on tab
            console.log('Tab switched to: ' + tabName);
            
            // Add fade effect to product grid
            $('.product-grid').fadeOut(200, function() {
                $(this).fadeIn(200);
            });
        });
    }

    /**
     * Countdown Timer
     */
    function initCountdown() {
        // Update countdown every second
        setInterval(function() {
            $('.countdown').each(function() {
                var $countdown = $(this);
                
                // Get countdown items
                var $days = $countdown.find('.countdown-item').eq(0).find('.countdown-number');
                var $hours = $countdown.find('.countdown-item').eq(1).find('.countdown-number');
                var $mins = $countdown.find('.countdown-item').eq(2).find('.countdown-number');
                var $secs = $countdown.find('.countdown-item').eq(3).find('.countdown-number');
                
                // Get current values
                var days = parseInt($days.text());
                var hours = parseInt($hours.text());
                var mins = parseInt($mins.text());
                var secs = parseInt($secs.text());
                
                // Countdown logic
                if (secs > 0) {
                    secs--;
                } else if (mins > 0) {
                    mins--;
                    secs = 59;
                } else if (hours > 0) {
                    hours--;
                    mins = 59;
                    secs = 59;
                } else if (days > 0) {
                    days--;
                    hours = 23;
                    mins = 59;
                    secs = 59;
                }
                
                // Update display with leading zeros
                $days.text(String(days).padStart(2, '0'));
                $hours.text(String(hours).padStart(2, '0'));
                $mins.text(String(mins).padStart(2, '0'));
                $secs.text(String(secs).padStart(2, '0'));
            });
        }, 1000);
    }

    /**
     * Wishlist Toggle
     */
    function initWishlist() {
        $('.wishlist-btn').on('click', function(e) {
            e.preventDefault();
            
            var $btn = $(this);
            
            // Toggle heart icon
            if ($btn.css('color') === 'rgb(255, 0, 0)' || $btn.css('color') === 'red') {
                $btn.css('color', '#999');
                $btn.text('♡');
                
                // Update badge
                updateWishlistBadge(-1);
            } else {
                $btn.css('color', 'red');
                $btn.text('❤');
                
                // Update badge
                updateWishlistBadge(1);
                
                // Show notification
                showNotification('Added to wishlist!');
            }
        });
    }

    /**
     * Update Wishlist Badge
     */
    function updateWishlistBadge(change) {
        var $badge = $('.header-icons .icon-btn').eq(1).find('.badge');
        var currentCount = parseInt($badge.text()) || 0;
        var newCount = Math.max(0, currentCount + change);
        $badge.text(newCount);
    }

    /**
     * Scroll Effects
     */
    function initScrollEffects() {
        // Header background on scroll
        $(window).on('scroll', function() {
            var scrollTop = $(this).scrollTop();
            
            if (scrollTop > 100) {
                $('header').addClass('scrolled');
            } else {
                $('header').removeClass('scrolled');
            }
        });

        // Smooth scroll for anchor links
        $('a[href^="#"]').on('click', function(e) {
            var target = $(this.hash);
            
            if (target.length) {
                e.preventDefault();
                
                $('html, body').animate({
                    scrollTop: target.offset().top - 120
                }, 800);
            }
        });

        // Animate elements on scroll
        $(window).on('scroll', function() {
            $('.feature-card, .category-card, .product-card, .brand-card').each(function() {
                var elementTop = $(this).offset().top;
                var windowBottom = $(window).scrollTop() + $(window).height();
                
                if (elementTop < windowBottom - 50) {
                    $(this).addClass('animated');
                }
            });
        });
    }

    /**
     * Newsletter Form
     */
    function initNewsletterForm() {
        $('.newsletter button').on('click', function(e) {
            e.preventDefault();
            
            var $input = $('.newsletter input');
            var email = $input.val().trim();
            
            // Basic email validation
            if (validateEmail(email)) {
                // Here you would normally send to your backend
                showNotification('Thank you for subscribing!');
                $input.val('');
            } else {
                showNotification('Please enter a valid email address', 'error');
            }
        });
    }

    /**
     * Search Bar Functionality
     */
    function initSearchBar() {
        $('.search-bar button').on('click', function(e) {
            e.preventDefault();
            
            var query = $('.search-bar input').val().trim();
            
            if (query.length > 0) {
                console.log('Searching for: ' + query);
                // Here you would implement your search functionality
                showNotification('Searching for: ' + query);
            } else {
                showNotification('Please enter a search term', 'error');
            }
        });

        // Search on Enter key
        $('.search-bar input').on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                $('.search-bar button').click();
            }
        });
    }

    /**
     * Cart Functionality
     */
    function initCartFunctionality() {
        $('.add-to-cart').on('click', function(e) {
            e.preventDefault();
            
            var $btn = $(this);
            var $card = $btn.closest('.product-card, .flash-card');
            var productTitle = $card.find('.product-title, .flash-title').text();
            
            // Add animation
            $btn.text('Adding...').prop('disabled', true);
            
            setTimeout(function() {
                // Update cart badge
                var $badge = $('.header-icons .icon-btn').eq(2).find('.badge');
                var currentCount = parseInt($badge.text()) || 0;
                $badge.text(currentCount + 1);
                
                // Reset button
                $btn.text('Add to Cart').prop('disabled', false);
                
                // Show notification
                showNotification('Product added to cart!');
                
                console.log('Added to cart: ' + productTitle);
            }, 500);
        });
    }

    /**
     * Email Validation
     */
    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Show Notification
     */
    function showNotification(message, type = 'success') {
        // Remove existing notifications
        $('.notification').remove();
        
        // Create notification element
        var bgColor = type === 'success' ? '#00ff00' : '#ff0000';
        var textColor = '#000';
        
        var $notification = $('<div class="notification"></div>')
            .text(message)
            .css({
                'position': 'fixed',
                'top': '100px',
                'right': '20px',
                'background': bgColor,
                'color': textColor,
                'padding': '15px 25px',
                'border-radius': '8px',
                'font-weight': '600',
                'z-index': '9999',
                'animation': 'slideInRight 0.3s ease',
                'box-shadow': '0 4px 12px rgba(0,0,0,0.3)'
            });
        
        // Add to body
        $('body').append($notification);
        
        // Auto remove after 3 seconds
        setTimeout(function() {
            $notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }

    /**
     * Category Card Click
     */
    $('.category-card').on('click', function() {
        var category = $(this).find('h4').text();
        console.log('Category clicked: ' + category);
        showNotification('Loading ' + category + '...');
    });

    /**
     * Brand Card Click
     */
    $('.brand-card').on('click', function() {
        var brand = $(this).text();
        console.log('Brand clicked: ' + brand);
        showNotification('Loading ' + brand + ' products...');
    });

    /**
     * Promo Button Click
     */
    $('.promo-btn').on('click', function() {
        var promoTitle = $(this).closest('.promo-card').find('h3').text();
        console.log('Promo clicked: ' + promoTitle);
        showNotification('Loading ' + promoTitle + '...');
    });

    /**
     * Window Resize Handler
     */
    $(window).on('resize', function() {
        // Close mobile menu on resize to desktop
        if ($(window).width() > 768) {
            $('.dropdown-content').hide();
            $('.dropdown').removeClass('active');
        }
    });

    /**
     * Lazy Loading Images (Optional)
     */
    function lazyLoadImages() {
        var lazyImages = document.querySelectorAll('img[data-src]');
        
        var imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // Call lazy loading if supported
    if ('IntersectionObserver' in window) {
        lazyLoadImages();
    }

    /**
     * Add CSS Animation Keyframes
     */
    var style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .animated {
            animation: fadeInUp 0.6s ease;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

})(jQuery);