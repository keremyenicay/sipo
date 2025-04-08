(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const isSipo = params.get("sipo") === "true";
    const currentURL = window.location.href;

    // A. ÜRÜN SAYFASI (/dp/): Ürünün detay sayfasında adet ayarlanıp "Add to Cart" tıklanıyor.
    if (isSipo && currentURL.includes("/dp/")) {
        console.log("🔹 Ürün sayfası algılandı.");
        const quantity = params.get("quantity") || "1";
        let setQuantity = setInterval(() => {
            const quantitySelect = document.getElementById("quantity");
            if (quantitySelect) {
                if (quantitySelect.querySelector(`option[value="${quantity}"]`)) {
                    quantitySelect.value = quantity;
                    quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log("✅ Ürün adedi ayarlandı:", quantity);
                }
                clearInterval(setQuantity);
                setTimeout(() => {
                    const addBtn = document.getElementById("add-to-cart-button");
                    if (addBtn) {
                        console.log("🛒 Add to Cart tıklanıyor...");
                        addBtn.click();
                    }
                }, 500);
            }
        }, 300);
        return;
    }

    // B. SMART WAGON SAYFASI (/cart/smart-wagon):
    // URL hangi parametrelerle gelirse gelsin, sayfa gelince önce sayfayı yenile, ardından "Go to Cart" butonuna tıklanıyor.
    if (currentURL.includes("/cart/smart-wagon")) {
        console.log("🔹 Smart Wagon sayfası algılandı.");
        // Sayfayı sadece 1 kere yenilemek için hash kontrolü yapıyoruz.
        if (!window.location.hash.includes("#refreshed")) {
            console.log("🔁 Sayfa yenileniyor...");
            window.location.hash = "#refreshed";
            window.location.reload();
            return;
        } else {
            console.log("🔁 Sayfa yenileme tamamlandı. Go to Cart butonuna tıklanıyor...");
            let tryGoToCart = setInterval(() => {
                const goToCartLink = document.querySelector("a[href='/cart?ref_=sw_gtc']");
                if (goToCartLink) {
                    clearInterval(tryGoToCart);
                    console.log("➡️ Go to Cart bulundu, tıklanıyor.");
                    goToCartLink.click();
                }
            }, 300);
        }
        return;
    }

    // C. SEPET SAYFASI (/cart):
    // Gelen sepet sayfasında, sepet içeriğinde bulunan adet input (quantityBox) üzerinden güncelleme yapılıp ardından Proceed to Checkout butonuna tıklanıyor.
    if (isSipo && currentURL.includes("/cart") && !currentURL.includes("smart-wagon")) {
        console.log("🔹 Sepet sayfası algılandı.");
        const desiredQuantity = params.get("quantity") || "1";
        let tryCartUpdate = setInterval(() => {
            const quantityInput = document.querySelector('input[name="quantityBox"]');
            if (quantityInput) {
                clearInterval(tryCartUpdate);
                if (quantityInput.value !== desiredQuantity) {
                    console.log("🔧 Sepetteki adet güncelleniyor. Yeni değer:", desiredQuantity);
                    quantityInput.value = desiredQuantity;
                    quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
                    const updateBtn = document.querySelector('.sc-quantity-update-button a');
                    if (updateBtn) {
                        updateBtn.click();
                        console.log("🛠 Update butonuna tıklandı.");
                    }
                }
                let tryProceed = setInterval(() => {
                    const proceedBtn = document.querySelector('input[name="proceedToRetailCheckout"]');
                    if (proceedBtn) {
                        clearInterval(tryProceed);
                        console.log("➡️ Proceed to Checkout butonuna tıklanıyor.");
                        proceedBtn.click();
                    }
                }, 300);
            }
        }, 300);
        return;
    }

    // D. CHEWBACCA → CHEETAH YÖNLENDİRMESİ
    if (isSipo && currentURL.includes("/checkout/p/") && currentURL.includes("pipelineType=Chewbacca")) {
        console.log("🚚 Chewbacca sayfası algılandı → Cheetah yönlendirmesi yapılıyor...");
        setTimeout(() => {
            window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
        }, 100);
        return;
    }

    // E. SELLERFLASH: Affiliate Satın Al Butonu
    if (window.location.href.includes("panel.sellerflash.com/sellerOrder/")) {
        const observer = new MutationObserver(() => {
            if (document.getElementById('custom-buy-button')) return;
            const card = document.querySelector('.card.p-mb-3');
            if (card) {
                const btn = document.createElement('button');
                btn.id = 'custom-buy-button';
                btn.textContent = "Affiliate Satın Al";
                btn.style = "width: 100%; font-size: 15px; margin-top: 10px; background-color: #ff9900; color: white; border: none; padding: 10px; cursor: pointer;";
                card.parentNode.insertBefore(btn, card.nextSibling);
                btn.addEventListener('click', () => {
                    const asinLink = document.querySelector('a[href*="amazon.com/dp/"]');
                    const asin = asinLink ? asinLink.textContent.trim() : null;
                    const quantityBadge = document.querySelector('span.p-badge-info');
                    const quantity = quantityBadge ? parseInt(quantityBadge.textContent.trim()) : 1;
                    if (!asin) {
                        alert("ASIN bulunamadı.");
                        return;
                    }
                    // Yönlendirme URL'sine sipo=true ve quantity parametreleri ekleniyor.
                    const affiliateURL = `https://www.amazon.com/dp/${asin}?sipo=true&quantity=${quantity}`;
                    window.location.href = affiliateURL;
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
