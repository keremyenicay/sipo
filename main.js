// main.js - GitHub (keremyenicay/sipo)
// Bu dosya Sellerflash sipariş detay sayfası ve Amazon ürün/sepet sayfası işlemlerini gerçekleştirir.
(function () {
    'use strict';

    // --- Sellerflash: Sipariş detay sayfası (/sellerOrder/...) ---
    if (window.location.host.includes("panel.sellerflash.com") &&
        window.location.pathname.includes("/sellerOrder/")) {

        // Mevcut "Satın Al" kartını hedefleyerek, onun altına Affiliate butonunu ekliyoruz.
        function insertCustomButton() {
            const container = document.querySelector('.card.p-mb-3');
            if (!container) return false; // henüz yüklenmemiş olabilir
            if (document.getElementById('custom-buy-button')) return true; // buton zaten eklenmiş

            const customButton = document.createElement('button');
            customButton.id = 'custom-buy-button';
            customButton.textContent = "Affiliate Satın Al";
            customButton.style.cssText = "width: 100%; font-size: 15px; margin-top: 10px; background-color: #ff9900; color: white; border: none; padding: 10px; cursor: pointer;";
            container.parentNode.insertBefore(customButton, container.nextSibling);

            customButton.addEventListener('click', function (e) {
                e.preventDefault();
                // Sipariş detay sayfasında Amazon ürün bağlantısını örneğin şöyle alıyoruz:
                // <a href="https://www.amazon.com/dp/B09CYGW46K?th=1&amp;psc=1" ...>B09CYGW46K</a>
                const asinLink = document.querySelector('a[href*="amazon.com/dp/"]');
                if (!asinLink) {
                    alert("ASIN bilgisi bulunamadı!");
                    return;
                }
                const asin = asinLink.textContent.trim();

                // Eğer sipariş sayfasında ek adet bilgisi varsa (örneğin <span class="p-badge-info">) oku
                const quantitySpan = document.querySelector('span.p-badge-info');
                const quantity = quantitySpan ? (parseInt(quantitySpan.textContent.trim()) || 1) : 1;
                console.log("ASIN: " + asin + " - Adet: " + quantity);

                // Affiliate URL oluşturuluyor (linkCode, tag, linkId sabit)
                const affiliateURL = "https://www.amazon.com/dp/" + asin +
                    "?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl";
                console.log("Affiliate URL'ye yönlendiriliyor:", affiliateURL);
                window.location.href = affiliateURL;
            });
            return true;
        }

        // DOM dinamik yüklendiği için MutationObserver ile takip ediyoruz.
        const observer = new MutationObserver((mutations, obs) => {
            if (insertCustomButton()) {
                obs.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // --- Amazon.com Ürün & Sepet Sayfası ---
    else if (window.location.host.includes("www.amazon.com")) {
        window.addEventListener('load', function () {

            // Eğer sayfa "smart-wagon" URL’si ise (yani sepete ekleme sonrası bu sayfaya gelinmişse),
            // hızlı bir şekilde adres seçimi sayfasına yönlendirme yapıyoruz.
            if (window.location.href.indexOf("cart/smart-wagon") > -1) {
                console.log("Smart Wagon sayfasına gelindi, adres seçimine yönlendiriliyor...");
                setTimeout(function () {
                    window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
                }, 1000); // 1 saniye gecikme
                return; // diğer kodların çalışmasına gerek yok
            }
            
            // Aksi durumda, eğer sayfa ürün detay sayfası ise add-to-cart butonunu otomatik tıklayalım.
            const addToCartBtn = document.getElementById('add-to-cart-button');
            if (addToCartBtn) {
                console.log("Amazon: Ürün sayfasından Add to Cart butonuna tıklanıyor.");
                setTimeout(function () {
                    addToCartBtn.click();
                }, 2000);
            }
        });
    }
})();
