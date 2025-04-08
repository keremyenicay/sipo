// ==UserScript==
// @name         Amazon Affiliate Sipariş Eklentisi
// @namespace    http://keremyenicay.github.io/sipo
// @version      1.0
// @description  Sellerflash sipariş sayfasından Amazon affiliate linkiyle sipariş verme işlemini gerçekleştirir.
// @author       
// @match        https://panel.sellerflash.com/sellerOrder/*
// @match        https://www.amazon.com/dp/*
// @updateURL    https://raw.githubusercontent.com/keremyenicay/sipo/main/main.js
// @downloadURL  https://raw.githubusercontent.com/keremyenicay/sipo/main/main.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Sellerflash sipariş sayfasında çalışacak bölüm
    if (window.location.host.includes("panel.sellerflash.com")) {
        window.addEventListener('load', function () {
            // Mevcut "Satın Al" butonunun bulunduğu kapsayıcıyı seçiyoruz.
            var existingContainer = document.querySelector('.card.p-mb-3');
            if (existingContainer) {
                // Yeni buton oluşturuluyor.
                var customButton = document.createElement('button');
                customButton.id = 'custom-buy-button';
                customButton.textContent = "Affiliate Satın Al";
                // Tasarım ayarları (örneğin buton genişliği, renk, margin vs.)
                customButton.style.cssText = "width: 100%; font-size: 15px; margin-top: 10px; background-color: #ff9900; color: white; border: none; padding: 10px; cursor: pointer;";
                // Mevcut "Satın Al" butonunun hemen altına yerleştiriyoruz.
                existingContainer.parentNode.insertBefore(customButton, existingContainer.nextSibling);

                // Butona tıklama olayı ekleniyor.
                customButton.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Sayfadaki Amazon ürün bağlantısından ASIN kodunu alıyoruz.
                    var asinLink = document.querySelector('a[href*="amazon.com/dp/"]');
                    if (!asinLink) {
                        alert("ASIN bilgisi bulunamadı!");
                        return;
                    }
                    var asin = asinLink.textContent.trim();
                    
                    // Ürün adedi bilgisini içeren span'dan adedi alıyoruz.
                    var quantitySpan = document.querySelector('span.p-badge-info');
                    var quantity = 1;
                    if (quantitySpan) {
                        quantity = parseInt(quantitySpan.textContent.trim()) || 1;
                    }
                    console.log("ASIN: " + asin + " - Adet: " + quantity);

                    // Affiliate URL’sini, ASIN ve sabit affiliate parametreleriyle oluşturuyoruz.
                    var affiliateURL = "https://www.amazon.com/dp/" + asin +
                        "?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl";

                    console.log("Affiliate URL'ye yönlendiriliyor:", affiliateURL);
                    // Affiliate URL'sine yönlendirme yapıyoruz.
                    window.location.href = affiliateURL;
                });
            }
        });
    }
    // Amazon.com ürün sayfasında çalışacak bölüm
    else if (window.location.host.includes("www.amazon.com")) {
        window.addEventListener('load', function () {
            // Ürün detay sayfası kontrolü: Add to Cart butonunun varlığına bakıyoruz.
            var addToCartBtn = document.getElementById('add-to-cart-button');
            if (addToCartBtn) {
                console.log("Amazon: Add to Cart butonuna tıklanıyor.");
                // Küçük bir gecikme (sayfanın tam yüklenmesi için)
                setTimeout(function () {
                    addToCartBtn.click();
                    // Sepete ekleme işlemi tamamlanmışsa, belirli bir süre sonra adres seçimi sayfasına yönlendiriyoruz.
                    setTimeout(function () {
                        window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
                    }, 5000); // 5 saniye gecikme; bu değeri gerekirse artırabilirsiniz.
                }, 2000); // 2 saniye sonra butona tıklama denemesi.
            }
        });
    }
})();
