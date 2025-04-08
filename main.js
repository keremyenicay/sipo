// main.js - GitHub (keremyenicay/sipo)
// Bu dosya hem Sellerflash sipariş sayfası hem de Amazon ürün sayfası işlemlerini gerçekleştirir.

(function () {
    'use strict';

    // Sellerflash sipariş sayfası
    if (window.location.host.includes("panel.sellerflash.com")) {

        // Sellerflash sayfasında, ilgili alanın eklenmesini MutationObserver ile takip ediyoruz
        function insertCustomButton() {
            const container = document.querySelector('.card.p-mb-3');
            if (!container) return false; // henüz container oluşturulmamış
            if (document.getElementById('custom-buy-button')) return true; // buton zaten eklenmiş

            // Yeni buton oluşturuluyor
            const customButton = document.createElement('button');
            customButton.id = 'custom-buy-button';
            customButton.textContent = "Affiliate Satın Al";
            customButton.style.cssText = "width: 100%; font-size: 15px; margin-top: 10px; background-color: #ff9900; color: white; border: none; padding: 10px; cursor: pointer;";
            
            // Butonu mevcut "Satın Al" kartının altına ekliyoruz.
            container.parentNode.insertBefore(customButton, container.nextSibling);

            // Tıklama olayı tanımlanıyor:
            customButton.addEventListener('click', function (e) {
                e.preventDefault();
                
                // Amazon bağlantısı içeren <a> etiketinden ASIN kodunu alıyoruz
                const asinLink = document.querySelector('a[href*="amazon.com/dp/"]');
                if (!asinLink) {
                    alert("ASIN bilgisi bulunamadı!");
                    return;
                }
                const asin = asinLink.textContent.trim();
                
                // Adet bilgisini içeren <span> öğesinden bilgiyi alıyoruz
                const quantitySpan = document.querySelector('span.p-badge-info');
                const quantity = quantitySpan ? (parseInt(quantitySpan.textContent.trim()) || 1) : 1;
                console.log("ASIN: " + asin + " - Adet: " + quantity);
                
                // Affiliate URL oluşturuluyor (örnekte linkcode ve tag sabit)
                const affiliateURL = "https://www.amazon.com/dp/" + asin +
                    "?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl";
                
                console.log("Affiliate URL'ye yönlendiriliyor:", affiliateURL);
                window.location.href = affiliateURL;
            });
            return true;
        }

        // MutationObserver ile sayfadaki dinamik elementleri takip edip, buton eklenecek alan oluşunca müdahale ediyoruz.
        const observer = new MutationObserver((mutations, obs) => {
            if (insertCustomButton()) {
                obs.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    // Amazon.com ürün sayfası
    else if (window.location.host.includes("www.amazon.com")) {
        window.addEventListener('load', function () {
            const addToCartBtn = document.getElementById('add-to-cart-button');
            if (addToCartBtn) {
                console.log("Amazon: Add to Cart butonuna tıklanıyor.");
                // 2 saniye gecikme sonrasında sepete ekleme işlemi
                setTimeout(() => {
                    addToCartBtn.click();
                    // 5 saniye sonra adres seçimi sayfasına yönlendirme
                    setTimeout(() => {
                        window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
                    }, 5000);
                }, 2000);
            }
        });
    }
})();
