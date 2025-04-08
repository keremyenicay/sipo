(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const isSipo = params.get("sipo") === "true";
    const currentURL = window.location.href;

    // ✅ ÜRÜN SAYFASI (/dp/)
    if (isSipo && currentURL.includes("/dp/")) {
        console.log("🔹 Ürün sayfası algılandı.");
        const quantity = params.get("quantity") || "1";

        let setQuantity = setInterval(() => {
            const quantitySelect = document.getElementById("quantity");
            if (quantitySelect) {
                if (quantitySelect.querySelector(`option[value="${quantity}"]`)) {
                    quantitySelect.value = quantity;
                    quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log("✅ Adet ayarlandı:", quantity);
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
    }

    // ✅ SMART WAGON SAYFASI (/cart/smart-wagon)
    else if (isSipo && currentURL.includes("/cart/smart-wagon")) {
        console.log("🔹 Smart Wagon sayfası algılandı.");

        // Sayfa zaten yenilenmiş mi diye kontrol için hash kullanıyoruz
        if (!window.location.hash.includes("#refreshed")) {
            console.log("🔁 Sayfa yenileniyor...");
            window.location.hash = "#refreshed";
            window.location.reload();
        } else {
            console.log("🔁 Sayfa zaten yenilenmiş. Go to Cart tıklanacak...");
            let tryGoToCart = setInterval(() => {
                const goToCartLink = document.querySelector("a[href='/cart?ref_=sw_gtc']");
                if (goToCartLink) {
                    clearInterval(tryGoToCart);
                    console.log("➡️ Go to Cart butonuna tıklanıyor.");
                    goToCartLink.click();
                }
            }, 300);
        }
    }

    // ✅ SEPET SAYFASI (/cart)
    else if (isSipo && currentURL.includes("/cart") && !currentURL.includes("smart-wagon")) {
        console.log("🛒 Sepet sayfası algılandı.");
        const quantity = params.get("quantity") || "1";

        let updateCart = setInterval(() => {
            const quantityInput = document.querySelector('input[name="quantityBox"]');
            if (quantityInput) {
                clearInterval(updateCart);
                if (quantityInput.value !== quantity) {
                    quantityInput.value = quantity;
                    quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
                    const updateBtn = document.querySelector('.sc-quantity-update-button a');
                    if (updateBtn) {
                        updateBtn.click();
                        console.log("🔧 Sepet adedi güncellendi.");
                    }
                }

                let tryCheckout = setInterval(() => {
                    const proceedBtn = document.querySelector('input[name="proceedToRetailCheckout"]');
                    if (proceedBtn) {
                        clearInterval(tryCheckout);
                        console.log("➡️ Proceed to Checkout tıklanıyor.");
                        proceedBtn.click();
                    }
                }, 300);
            }
        }, 300);
    }

    // ✅ CHEWBACCA → CHEETAH yönlendirme
    else if (isSipo && currentURL.includes("/checkout/p/") && currentURL.includes("pipelineType=Chewbacca")) {
        console.log("🚚 Chewbacca sayfası → Cheetah yönlendirmesi yapılıyor.");
        setTimeout(() => {
            window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
        }, 100);
    }

    // ✅ SELLERFLASH: Affiliate Satın Al Butonu
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
                    const quantityText = document.querySelector('span.p-badge-info');
                    const quantity = quantityText ? parseInt(quantityText.textContent.trim()) : 1;
                    if (!asin) return alert("ASIN bulunamadı.");
                    const affiliateURL = `https://www.amazon.com/dp/${asin}?sipo=true&quantity=${quantity}`;
                    window.location.href = affiliateURL;
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
