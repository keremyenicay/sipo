// main.js - GitHub (keremyenicay/sipo)
// Bu dosya, Sellerflash sipariş detay sayfası ve Amazon akışındaki işlemleri hızlandırarak gerçekleştirir.
(function () {
    'use strict';

    // --- Sellerflash: Sipariş detay sayfası (/sellerOrder/...) ---
    if (window.location.host.includes("panel.sellerflash.com") &&
        window.location.pathname.includes("/sellerOrder/")) {

        function insertCustomButton() {
            const container = document.querySelector('.card.p-mb-3');
            if (!container) return false;
            if (document.getElementById('custom-buy-button')) return true;

            const customButton = document.createElement('button');
            customButton.id = 'custom-buy-button';
            customButton.textContent = "Affiliate Satın Al";
            customButton.style.cssText =
                "width: 100%; font-size: 15px; margin-top: 10px; background-color: #ff9900; color: white; border: none; padding: 10px; cursor: pointer;";
            container.parentNode.insertBefore(customButton, container.nextSibling);

            customButton.addEventListener('click', function (e) {
                e.preventDefault();
                const asinLink = document.querySelector('a[href*="amazon.com/dp/"]');
                if (!asinLink) {
                    alert("ASIN bilgisi bulunamadı!");
                    return;
                }
                const asin = asinLink.textContent.trim();
                const quantitySpan = document.querySelector('span.p-badge-info');
                const quantity = quantitySpan ? (parseInt(quantitySpan.textContent.trim()) || 1) : 1;
                console.log("ASIN: " + asin + " - Adet: " + quantity);
                const affiliateURL = "https://www.amazon.com/dp/" + asin +
                    "?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl";
                console.log("Affiliate URL'ye yönlendiriliyor:", affiliateURL);
                window.location.href = affiliateURL;
            });
            return true;
        }

        // DOM içeriği yüklendiğinde MutationObserver ile bekle
        const observer = new MutationObserver((mutations, obs) => {
            if (insertCustomButton()) {
                obs.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    
    // --- Amazon.com Ürün ve Sepet Akışı ---
    else if (window.location.host.includes("www.amazon.com")) {
        window.addEventListener('load', function () {

            // CASE A: Smart Wagon Sayfası
            if (window.location.href.indexOf("cart/smart-wagon") > -1) {
                console.log("Smart Wagon sayfası tespit edildi.");

                // İlk kez geldiyse sayfayı yenile ve bayrak ayarla
                if (!sessionStorage.getItem("smartWagonReloaded")) {
                    sessionStorage.setItem("smartWagonReloaded", "true");
                    console.log("Smart Wagon: Sayfa yenileniyor...");
                    window.location.reload();
                } else {
                    // Yenileme sonrası Proceed to checkout butonunu tespit edip tıklama
                    console.log("Yenileme sonrası Proceed to checkout butonu aranıyor...");
                    let intervalId = setInterval(() => {
                        const proceedBtn = document.querySelector('input[name="proceedToRetailCheckout"]');
                        if (proceedBtn) {
                            console.log("Proceed to checkout butonu bulundu, tıklanıyor...");
                            proceedBtn.click();
                            clearInterval(intervalId);
                        }
                    }, 300);
                }
                return; // Diğer işlemler yapılmasın
            }
            
            // CASE B: Chewbacca (Checkout) Sayfası
            if (window.location.href.indexOf("/checkout/p/") > -1 &&
                window.location.href.indexOf("pipelineType=Chewbacca") > -1) {
                console.log("Chewbacca checkout sayfası tespit edildi, cheetah'a yönlendiriliyor...");
                // Kısa bir gecikme sonrası cheetah (adres seçimi) sayfasına yönlendiriyoruz
                setTimeout(function () {
                    window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
                }, 100);
                return;
            }
            
            // CASE C: Ürün Detay Sayfası (Add-to-Cart İşlemi)
            const addToCartBtn = document.getElementById('add-to-cart-button');
            if (addToCartBtn) {
                console.log("Amazon: Ürün sayfasından Add to Cart butonuna hızlıca tıklanıyor.");
                setTimeout(function () {
                    addToCartBtn.click();
                }, 200);
            }
        });
    }
})();
