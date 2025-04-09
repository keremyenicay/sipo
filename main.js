(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const isSipo = params.get("sipo") === "true";
    const isNewTab = params.get("newTab") === "true"; // Yeni sekme kontrolü
    const url = window.location.href;

    // ─────────────────────────────────────────────
    // 0. AMAZON THANK YOU SAYFASI: Otomatik yönlendirme
    // ─────────────────────────────────────────────
    if (url.includes("amazon.com/gp/buy/thankyou/handlers/display.html")) {
        console.log("✅ Amazon thank you sayfası algılandı. Sipariş onaylandı.");
        setTimeout(() => {
            window.location.replace("https://www.amazon.com/gp/css/order-history?ref_=nav_orders_first&sipo=true&newTab=true");
        }, 500);
        return;
    }

    // ─────────────────────────────────────────────
    // 1. AMAZON ORDER HISTORY SAYFASI: Sipariş Bilgilerinin Gösterilmesi (Manuel Mod)
    // ─────────────────────────────────────────────
    if (url.includes("amazon.com/gp/css/order-history")) {
        console.log("✅ Amazon order history sayfası algılandı. Manuel mod aktif.");

        const waitForOrderCard = setInterval(() => {
            // Sipariş kartını içeren uygun bir selector kullanın
            const orderCard = document.querySelector('.order-card');
            if (orderCard) {
                clearInterval(waitForOrderCard);
                const textContent = orderCard.innerText;
                console.log("Sipariş kartı metni:", textContent);

                // RegEx ifadeleriyle sipariş numarası ve toplam fiyat çekiliyor.
                let orderId = "";
                let total = "";
                const orderIdMatch = textContent.match(/ORDER\s*#\s*([\d-]+)/i);
                const totalMatch = textContent.match(/\$(\d+\.\d{2})/);
                if (orderIdMatch) {
                    orderId = orderIdMatch[1];
                }
                if (totalMatch) {
                    total = totalMatch[1];
                }
                if (!orderId || !total) {
                    console.error("❌ Sipariş bilgileri bulunamadı. Lütfen DOM selector'larını kontrol edin.");
                    return;
                }
                console.log("Bulunan Amazon Order ID:", orderId, "Toplam:", total);

                // Manuel mod: Sipariş bilgilerini gösteren bir bilgi kutusu ekle
                const infoBox = document.createElement('div');
                infoBox.style = "position: fixed; top: 10px; right: 10px; background-color: #f0f8ff; border: 2px solid #ff9900; padding: 15px; border-radius: 5px; z-index: 9999; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); max-width: 350px;";
                infoBox.innerHTML = `
                    <h3 style="margin-top: 0; color: #232f3e;">Sipariş Bilgileri (Manuel Mod)</h3>
                    <p><strong>Sipariş ID:</strong> <span style="color: #B12704; font-weight: bold;">${orderId}</span></p>
                    <p><strong>Toplam Tutar:</strong> <span style="color: #B12704; font-weight: bold;">$${total}</span></p>
                    <p style="margin-bottom: 0; font-style: italic; font-size: 12px;">Bu bilgileri Sellerflash'ta manuel olarak girebilirsiniz.</p>
                `;
                document.body.appendChild(infoBox);
                console.log("✅ Bilgi kutusu eklendi. Sayfa otomatik kapanmayacak.");

                // NOT: Artık otomatik kapanma yok, kullanıcı manuel olarak bilgileri kopyalayabilir
            }
        }, 300);
        return;
    }

    // ─────────────────────────────────────────────
    // 2. AMAZON ÜRÜN / CART VE DİĞER AMAZON SAYFALARI
    // ─────────────────────────────────────────────

    // A. Ürün Sayfası (/dp/) - KUPON VE İNDİRİM İŞLEMLERİ EKLENDİ
    if (isSipo && url.includes("/dp/")) {
        console.log("🔹 Ürün sayfası algılandı.");
        const quantity = params.get("quantity") || "1";

        // Önce kupon/indirim kontrolü yapılacak
        setTimeout(() => {
            console.log("🔍 Kupon ve indirim kontrolü yapılıyor...");

            // Kupon ve marka indirimi kontrolü
            const promoBlock = document.querySelector("#promoPriceBlockMessage_feature_div");
            if (promoBlock) {
                console.log("✅ Kupon/indirim alanı bulundu.");

                // Kupon checkbox kontrolü
                const couponCheckboxes = promoBlock.querySelectorAll(".a-icon-checkbox");
                if (couponCheckboxes.length > 0) {
                    console.log(`🎫 ${couponCheckboxes.length} adet kupon checkbox'ı bulundu.`);
                    couponCheckboxes.forEach((checkbox, index) => {
                        setTimeout(() => {
                            console.log(`Kupon #${index+1} seçiliyor...`);
                            checkbox.click();
                        }, 300 + (index * 100)); // Her kupon için biraz bekle
                    });
                }

                // Redeem butonları kontrolü
                const redeemButtons = promoBlock.querySelectorAll("input.a-button-input[type='submit']");
                if (redeemButtons.length > 0) {
                    console.log(`💰 ${redeemButtons.length} adet redeem butonu bulundu.`);
                    redeemButtons.forEach((button, index) => {
                        setTimeout(() => {
                            console.log(`Redeem butonu #${index+1} tıklanıyor...`);
                            button.click();
                        }, 300 + (index * 100)); // Kuponlardan sonra çalışacak
                    });
                }

                if (couponCheckboxes.length === 0 && redeemButtons.length === 0) {
                    console.log("ℹ️ Tıklanabilir kupon veya indirim bulunamadı.");
                }
            } else {
                console.log("ℹ️ Bu üründe kupon/indirim alanı bulunmuyor.");
            }

            // Miktar ayarlama ve sepete ekleme
            setTimeout(() => {
                let quantitySelect = document.getElementById("quantity");
                if (quantitySelect) {
                    if (quantitySelect.querySelector(`option[value="${quantity}"]`)) {
                        quantitySelect.value = quantity;
                        quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log("✅ Ürün adedi ayarlandı:", quantity);
                    }

                    setTimeout(() => {
                        const addToCartBtn = document.getElementById("add-to-cart-button");
                        if (addToCartBtn) {
                            console.log("🛒 Add to Cart tıklanıyor...");
                            addToCartBtn.click();
                        }
                    }, 300);
                }
            }, 300); // Kupon işlemleri için yeterli süre bekle
        }, 300); // Sayfa yüklenmesi için biraz bekle

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
                const asin = params.get("asin");
                const quantity = params.get("quantity") || "1";
                if (asin) {
                    window.location.href = `https://www.amazon.com/dp/${asin}?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl&sipo=true&newTab=true&quantity=${quantity}`;
                } else {
                    console.log("ASIN parametresi bulunamadı, ürün eklenemiyor.");
                }
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

    // D. Chewbacca → Cheetah Yönlendirmesi
    if (isSipo && url.includes("/checkout/p/") && url.includes("pipelineType=Chewbacca")) {
        console.log("🚚 Chewbacca sayfası algılandı → Cheetah yönlendirmesi yapılıyor...");
        setTimeout(() => {
            window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah&sipo=true&newTab=true";
        }, 100);
        return;
    }

    // ─────────────────────────────────────────────
    // 3. SELLERFLASH SAYFASI: Affiliate Satın Al Butonu
    // ─────────────────────────────────────────────
    if (url.includes("panel.sellerflash.com/sellerOrder/")) {
        console.log("🔹 Sellerflash sipariş sayfası algılandı:", window.location.href);

        // Mevcut affiliate satın al butonu ekleme işlemi
        const observer = new MutationObserver(() => {
            if (document.getElementById('custom-buy-button')) return;

            const card = document.querySelector('.card.p-mb-3');
            if (card) {
                const btn = document.createElement('button');
                btn.id = 'custom-buy-button';
                btn.textContent = "Affiliate Satın Al";
                btn.style = "width: 100%; font-size: 15px; margin-top: 10px; background-color: #ff9900; color: white; border: none; padding: 10px; cursor: pointer;";

                // Buton element fonksiyonu
                btn.addEventListener('click', () => {
                    const asinLink = document.querySelector('a[href*="amazon.com/dp/"]');
                    const asin = asinLink ? asinLink.textContent.trim() : null;
                    const quantityBadge = document.querySelector('span.p-badge-info');
                    const quantity = quantityBadge ? parseInt(quantityBadge.textContent.trim()) : 1;

                    if (!asin) {
                        alert("ASIN bulunamadı.");
                        return;
                    }

                    // YENİ: Yeni sekmede affiliate linki aç
                    const affiliateURL = `https://www.amazon.com/dp/${asin}?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl&sipo=true&newTab=true&quantity=${quantity}`;
                    console.log("🔗 Yeni sekmede açılacak URL:", affiliateURL);
                    window.open(affiliateURL, '_blank');
                });

                card.parentNode.insertBefore(btn, card.nextSibling);
                console.log("✅ Affiliate Satın Al butonu eklendi");
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
