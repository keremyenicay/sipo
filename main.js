(function () {
    'use strict';

    // Affiliate link şablonu (sabit parametreler)
    const affiliateTemplate = "https://www.amazon.com/dp/{asin}?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl";

    const params = new URLSearchParams(window.location.search);
    // Eğer URL’de "asin" parametresi geçiyorsa onu kullan, aksi halde diğer bölümlerde kullanmak üzere boş bırakıyoruz.
    const asinParam = params.get("asin"); 
    const isSipo = params.get("sipo") === "true";
    const url = window.location.href;

    // A. Ürün Sayfası (/dp/)
    if (isSipo && url.includes("/dp/")) {
        console.log("🔹 Ürün sayfası algılandı.");
        const quantity = params.get("quantity") || "1";
        let setQuantityInterval = setInterval(() => {
            const quantitySelect = document.getElementById("quantity");
            if (quantitySelect) {
                if (quantitySelect.querySelector(`option[value="${quantity}"]`)) {
                    quantitySelect.value = quantity;
                    quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log("✅ Ürün adedi ayarlandı:", quantity);
                }
                clearInterval(setQuantityInterval);
                setTimeout(() => {
                    const addToCartBtn = document.getElementById("add-to-cart-button");
                    if (addToCartBtn) {
                        console.log("🛒 Add to Cart tıklanıyor...");
                        addToCartBtn.click();
                    }
                }, 500);
            }
        }, 300);
        return;
    }

    // B. Smart Wagon Sayfası (/cart/smart-wagon/)
    if (url.includes("cart/smart-wagon")) {
        console.log("🔹 Smart-wagon sayfası algılandı.");

        const alreadyReloaded = sessionStorage.getItem("smartWagonReloaded");

        if (!alreadyReloaded) {
            console.log("🔁 İlk kez girildi, sayfa şimdi yenilenecek.");
            sessionStorage.setItem("smartWagonReloaded", "true");
            location.reload();
            return;
        }

        console.log("✅ Yenilenmiş sayfadayız, Go to Cart tıklanacak.");
        sessionStorage.removeItem("smartWagonReloaded");

        let tryGoToCart = setInterval(() => {
            const goToCartLink = document.querySelector("a[href='/cart?ref_=sw_gtc']");
            if (goToCartLink) {
                clearInterval(tryGoToCart);
                console.log("➡️ Go to Cart bulundu, tıklanıyor.");
                goToCartLink.click();
            }
        }, 300);

        return;
    }

    // YENİ EK: Cart sayfası (ref_=sw_gtc) açıldığında Proceed to checkout butonuna tıklama
    if (url.includes("/cart?ref_=sw_gtc")) {
        console.log("🔹 Cart ref sw_gtc sayfası algılandı.");
        let tryProceedSpecific = setInterval(() => {
            const proceedBtn = document.querySelector('input[name="proceedToRetailCheckout"]');
            if (proceedBtn) {
                clearInterval(tryProceedSpecific);
                console.log("➡️ Cart ref sw_gtc Proceed to Checkout butonuna tıklanıyor.");
                proceedBtn.click();
            }
        }, 300);
        return;
    }

    // C. Sepet Sayfası (/cart/) – SEPET KONTROLÜ, TEMİZLEME VE ÜRÜN EKLEME
    if (isSipo && url.includes("/cart") && !url.includes("smart-wagon")) {
        console.log("🔹 Sepet sayfası algılandı.");

        const deleteBtns = document.querySelectorAll('button[data-action="a-stepper-decrement"]');
        if (deleteBtns.length > 0) {
            console.log("🗑 Sepette ürün(ler) bulundu. Temizleniyor...");
            deleteBtns.forEach(btn => {
                const productName = btn.getAttribute('aria-label');
                console.log("Siliniyor:", productName);
                btn.click();
            });
            setTimeout(() => {
                console.log("✅ Sepet temizlendi, ürün ekleniyor...");
                // Eğer URL'de asin parametresi varsa, o değer kullanılacak;
                // yoksa, daha önce çekilmiş olan ya da sellerflash sayfasında dinamik ASIN ile ilerleyebilirsiniz.
                let finalAsin = asinParam;
                if (!finalAsin) {
                    // örneğin, başka bir alandan ASIN çekilebilir ya da uyarı verilebilir.
                    console.log("ASIN parametresi bulunamadı, yönlendirme yapılamıyor.");
                    return;
                }
                const affiliateURL = affiliateTemplate.replace("{asin}", finalAsin) + `&sipo=true&quantity=${params.get("quantity") || "1"}`;
                window.location.href = affiliateURL;
            }, 2000);
            return;
        }

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

    // D. Chewbacca → Cheetah Yönlendirmesi
    if (isSipo && url.includes("/checkout/p/") && url.includes("pipelineType=Cheetah")) {
        console.log("🚚 Chewbacca sayfası algılandı → Cheetah yönlendirmesi yapılıyor...");
        setTimeout(() => {
            window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
        }, 100);
        return;
    }

    // E. SellerFlash: Affiliate Satın Al Butonu
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
                    // SellerFlash sayfasında, ASIN sayfadaki bir linkten çekiliyor
                    const asinLink = document.querySelector('a[href*="/dp/"]');
                    if (!asinLink) {
                        alert("ASIN bulunamadı.");
                        return;
                    }
                    const href = asinLink.getAttribute("href");
                    const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
                    const asin = asinMatch ? asinMatch[1] : null;
                    if (!asin) {
                        alert("ASIN çekilemedi.");
                        return;
                    }
                    // Ayrıca, varsa quantity bilgisini de SellerFlash sayfasındaki ilgili elementten çekelim:
                    const quantityBadge = document.querySelector('span.p-badge-info');
                    const quantity = quantityBadge ? parseInt(quantityBadge.textContent.trim()) : 1;
                    const affiliateURL = affiliateTemplate.replace("{asin}", asin) + `&sipo=true&quantity=${quantity}`;
                    window.location.href = affiliateURL;
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
