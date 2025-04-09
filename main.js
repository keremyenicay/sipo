(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const isSipo = params.get("sipo") === "true";
    const isNewTab = params.get("newTab") === "true"; // Yeni sekme kontrolü
    const url = window.location.href;
    const returnUrl = params.get("returnUrl") || ""; // Geri dönüş URL'si

    // ─────────────────────────────────────────────
    // 0. AMAZON THANK YOU SAYFASI: Otomatik yönlendirme
    // ─────────────────────────────────────────────
    if (url.includes("amazon.com/gp/buy/thankyou/handlers/display.html")) {
        console.log("✅ Amazon thank you sayfası algılandı. Sipariş onaylandı.");
        setTimeout(() => {
            window.location.replace("https://www.amazon.com/gp/css/order-history?ref_=nav_orders_first&sipo=true&newTab=true" + (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : ""));
        }, 500);
        return;
    }

    // ─────────────────────────────────────────────
    // 1. AMAZON ORDER HISTORY SAYFASI: Sipariş Bilgilerinin Alınması ve Saklanması
    // ─────────────────────────────────────────────
    if (url.includes("amazon.com/gp/css/order-history")) {
        console.log("✅ Amazon order history sayfası algılandı. Otomatik mod aktif.");

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

                // Sipariş bilgilerini kaydediyoruz
                GM_setValue("amazon_order_id", orderId);
                GM_setValue("amazon_order_total", total);
                console.log("💾 Sipariş bilgileri kaydedildi.");

                // Bilgi kutusu ekleniyor
                const infoBox = document.createElement('div');
                infoBox.style = "position: fixed; top: 10px; right: 10px; background-color: #f0f8ff; border: 2px solid #ff9900; padding: 15px; border-radius: 5px; z-index: 9999; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); max-width: 350px;";
                infoBox.innerHTML = `
                    <h3 style="margin-top: 0; color: #232f3e;">Sipariş Bilgileri Alındı</h3>
                    <p><strong>Sipariş ID:</strong> <span style="color: #B12704; font-weight: bold;">${orderId}</span></p>
                    <p><strong>Toplam Tutar:</strong> <span style="color: #B12704; font-weight: bold;">$${total}</span></p>
                    <p style="margin-bottom: 0; font-style: italic; font-size: 12px;">Bilgiler alındı, Sellerflash'a otomatik girilecek.</p>
                `;

                // Eğer geri dönüş URLi varsa, buton ekle
                if (returnUrl) {
                    const returnButton = document.createElement("button");
                    returnButton.textContent = "Sellerflash'a Dön";
                    returnButton.style = "margin-top: 10px; background-color: #ff9900; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%;";
                    returnButton.onclick = function() {
                        window.location.href = decodeURIComponent(returnUrl);
                    };
                    infoBox.appendChild(returnButton);
                }

                document.body.appendChild(infoBox);
            }
        }, 500);
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
                        }, 500 + (index * 300)); // Her kupon için biraz bekle
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
                        }, 2000 + (index * 500)); // Kuponlardan sonra çalışacak
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
                    }, 500);
                }
            }, 3000); // Kupon işlemleri için yeterli süre bekle
        }, 1500); // Sayfa yüklenmesi için biraz bekle

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
                    // Orijinal URL'yi geri dönüş URL'si olarak kaydediyoruz (varsa)
                    const currentReturnUrl = params.get("returnUrl") || returnUrl;
                    window.location.href = `https://www.amazon.com/dp/${asin}?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl&sipo=true&newTab=true&quantity=${quantity}${currentReturnUrl ? "&returnUrl=" + encodeURIComponent(currentReturnUrl) : ""}`;
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
            // Orijinal URL'yi geri dönüş URL'si olarak koruyoruz (varsa)
            const currentReturnUrl = params.get("returnUrl") || returnUrl;
            window.location.href = `https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah&sipo=true&newTab=true${currentReturnUrl ? "&returnUrl=" + encodeURIComponent(currentReturnUrl) : ""}`;
        }, 100);
        return;
    }

    // ─────────────────────────────────────────────
    // 3. SELLERFLASH SAYFASI: Affiliate Satın Al Butonu ve Otomatik Veri Girişi
    // ─────────────────────────────────────────────
    if (url.includes("panel.sellerflash.com/sellerOrder/")) {
        console.log("🔹 Sellerflash sipariş sayfası algılandı:", window.location.href);
        const orderUrlParts = url.split('/');
        const sellerflashOrderId = orderUrlParts[orderUrlParts.length - 1];
        console.log("📋 Sellerflash Sipariş ID:", sellerflashOrderId);

        // Kaydedilmiş Amazon sipariş bilgilerini kontrol et
        const savedOrderId = GM_getValue("amazon_order_id", "");
        const savedOrderTotal = GM_getValue("amazon_order_total", "");
        console.log("📤 Kaydedilmiş Amazon Sipariş Bilgileri:", savedOrderId, savedOrderTotal);

        // Affiliate satın al butonu ve otomatik veri girişi işlemleri
        const observer = new MutationObserver(() => {
            // Affiliate satın al butonu ekleme
            if (!document.getElementById('custom-buy-button')) {
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

                        // Yeni: Mevcut URL'yi returnUrl parametresi olarak ekle
                        const currentUrl = window.location.href;
                        const affiliateURL = `https://www.amazon.com/dp/${asin}?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl&sipo=true&newTab=true&quantity=${quantity}&returnUrl=${encodeURIComponent(currentUrl)}`;
                        console.log("🔗 Yeni sekmede açılacak URL:", affiliateURL);
                        window.open(affiliateURL, '_blank');
                    });

                    card.parentNode.insertBefore(btn, card.nextSibling);
                    console.log("✅ Affiliate Satın Al butonu eklendi");
                }
            }

            // Kaydedilmiş veri varsa ve otomatik doldurma butonu yoksa, ekle
            if (savedOrderId && savedOrderTotal && !document.getElementById('auto-fill-button')) {
                const card = document.querySelector('.card.p-mb-3');
                if (card) {
                    const autoFillBtn = document.createElement('button');
                    autoFillBtn.id = 'auto-fill-button';
                    autoFillBtn.textContent = "Sipariş Bilgilerini Otomatik Doldur";
                    autoFillBtn.style = "width: 100%; font-size: 15px; margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 10px; cursor: pointer;";

                    autoFillBtn.addEventListener('click', () => {
                        // Önce düzenleme butonuna tıkla
                        const editBtn = document.querySelector('.p-button-icon.pi.pi-pencil');
                        if (editBtn) {
                            console.log("✏️ Düzenle butonuna tıklanıyor...");
                            editBtn.click();

                            // Dialog açıldığında form alanlarını doldur
                            setTimeout(() => {
                                // Order ID alanını doldur
                                const orderIdField = document.querySelector("body > div.p-dialog-mask.p-component-overlay.p-component-overlay-enter > div > div.p-dialog-content > div.card.p-fluid.p-grid > div:nth-child(1) input");
                                if (orderIdField) {
                                    console.log("📝 Order ID alanı dolduruluyor:", savedOrderId);
                                    orderIdField.value = savedOrderId;
                                    orderIdField.dispatchEvent(new Event('input', { bubbles: true }));
                                }

                                // Email alanını doldur
                                const emailField = document.querySelector("body > div.p-dialog-mask.p-component-overlay.p-component-overlay-enter > div > div.p-dialog-content > div.card.p-fluid.p-grid > div:nth-child(3) input");
                                if (emailField) {
                                    console.log("📝 Email alanı dolduruluyor: keremyenicay0028@gmail.com");
                                    emailField.value = "keremyenicay0028@gmail.com";
                                    emailField.dispatchEvent(new Event('input', { bubbles: true }));
                                }

                                // Fiyat alanını doldur
                                const priceField = document.querySelector("body > div.p-dialog-mask.p-component-overlay.p-component-overlay-enter > div > div.p-dialog-content > div.card.p-fluid.p-grid > div:nth-child(4) input");
                                if (priceField) {
                                    console.log("📝 Fiyat alanı dolduruluyor:", savedOrderTotal);
                                    priceField.value = savedOrderTotal;
                                    priceField.dispatchEvent(new Event('input', { bubbles: true }));
                                }

                                // Kaydet butonunu bul ve tıklamak için beklet
                                setTimeout(() => {
                                    const saveBtn = document.querySelector("body > div.p-dialog-mask.p-component-overlay.p-component-overlay-enter > div > div.p-dialog-footer > button.p-button.p-component.p-button-success");
                                    if (saveBtn) {
                                        console.log("💾 Kaydet butonuna tıklanıyor...");
                                        saveBtn.click();

                                        // Bilgileri girdikten sonra temizle
                                        setTimeout(() => {
                                            GM_deleteValue("amazon_order_id");
                                            GM_deleteValue("amazon_order_total");
                                            console.log("🧹 Kaydedilmiş sipariş bilgileri temizlendi.");

                                            // Otomatik doldurma butonunu güncelle
                                            autoFillBtn.textContent = "✅ Bilgiler Dolduruldu";
                                            autoFillBtn.disabled = true;
                                            autoFillBtn.style.backgroundColor = "#8bc34a";
                                        }, 1000);
                                    }
                                }, 1000);
                            }, 1000);
                        } else {
                            console.error("❌ Düzenleme butonu bulunamadı.");
                        }
                    });

                    // Bilgi gösterge kutusu
                    const infoDiv = document.createElement('div');
                    infoDiv.style = "background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 10px; margin-top: 10px; font-size: 14px;";
                    infoDiv.innerHTML = `
                        <p style="margin: 0;"><strong>Amazon Sipariş Bilgileri Hazır:</strong></p>
                        <p style="margin: 5px 0 0;"><strong>Sipariş ID:</strong> ${savedOrderId}</p>
                        <p style="margin: 5px 0 0;"><strong>Tutar:</strong> $${savedOrderTotal}</p>
                    `;

                    // Önce bilgi kutusunu ekle, sonra butonu
                    card.parentNode.insertBefore(infoDiv, card.nextSibling);
                    card.parentNode.insertBefore(autoFillBtn, infoDiv.nextSibling);
                    console.log("✅ Otomatik doldurma butonu ve bilgi kutusu eklendi");
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
