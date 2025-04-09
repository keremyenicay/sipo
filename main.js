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
        }, 2000);
        return;
    }

    // ─────────────────────────────────────────────
    // 1. AMAZON ORDER HISTORY SAYFASI: Sipariş Bilgilerinin Çekilmesi
    // ─────────────────────────────────────────────
    if (url.includes("amazon.com/gp/css/order-history")) {
        console.log("✅ Amazon order history sayfası algılandı. Sipariş bilgileri çekiliyor...");

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

                // GM_setValue ile verileri tarayıcı genelinde kaydet
                GM_setValue('amazonOrderId', orderId);
                GM_setValue('amazonOrderTotal', total);
                console.log("✅ Sipariş bilgileri GM_setValue ile kaydedildi");

                // Bilgileri çektikten sonra sekmeyi kapat (yeni sekme modunda ise)
                if (isNewTab) {
                    console.log("✅ İşlem tamamlandı, sekme kapatılıyor...");
                    // Biraz bekleyip sekmeyi kapat
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                }
            }
        }, 500);
        return;
    }

    // ─────────────────────────────────────────────
    // 2. AMAZON ÜRÜN / CART VE DİĞER AMAZON SAYFALARI
    // ─────────────────────────────────────────────

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

    // D. Chewbacca → Cheetah Yönlendirmesi
    if (isSipo && url.includes("/checkout/p/") && url.includes("pipelineType=Chewbacca")) {
        console.log("🚚 Chewbacca sayfası algılandı → Cheetah yönlendirmesi yapılıyor...");
        setTimeout(() => {
            window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah&sipo=true&newTab=true";
        }, 100);
        return;
    }

    // ─────────────────────────────────────────────
    // 3. SELLERFLASH SAYFASI: Affiliate Satın Al Butonu ve Sipariş Bilgilerinin Girilmesi
    // ─────────────────────────────────────────────
    if (url.includes("panel.sellerflash.com/sellerOrder/")) {
        console.log("🔹 Sellerflash sipariş sayfası algılandı:", window.location.href);

        // Amazon sipariş bilgilerini GM_getValue ile çek
        const amazonOrderId = GM_getValue('amazonOrderId', null);
        const amazonOrderTotal = GM_getValue('amazonOrderTotal', null);
        
        // Bilgiler varsa, konsola yazdır
        if (amazonOrderId && amazonOrderTotal) {
            console.log("📋 Amazon sipariş bilgileri bulundu: ", {
                OrderID: amazonOrderId,
                Total: amazonOrderTotal
            });
        }

        // Mevcut affiliate satın al butonu ekleme işlemi
        const observer = new MutationObserver(() => {
            if (document.getElementById('custom-buy-button')) return;
            
            const card = document.querySelector('.card.p-mb-3');
            if (card) {
                const btn = document.createElement('button');
                btn.id = 'custom-buy-button';
                btn.textContent = "Affiliate Satın Al (Yeni Sekme)";
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
                console.log("✅ Affiliate Satın Al (Yeni Sekme) butonu eklendi");
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // ──────────────
        // YENİ EK: Amazon'dan çekilen sipariş bilgileri varsa,
        // düzenleme (kalem) butonuna tıklanınca açılan modaldaki alanları otomatik doldur.
        // ──────────────
        if (amazonOrderId && amazonOrderTotal) {
            console.log("✅ Amazon sipariş bilgileri bulundu. Sellerflash modali için veriler hazırlanıyor.");
            const formattedTotal = amazonOrderTotal.replace('.', ',');
            const attachEditListener = setInterval(() => {
                const editButton = document.querySelector('button.p-button-icon-only.p-button-text');
                if (editButton) {
                    clearInterval(attachEditListener);
                    console.log("✅ Düzenleme (kalem) butonu bulundu, event listener ekleniyor.");
                    editButton.addEventListener('click', () => {
                        setTimeout(() => {
                            const buyerOrderNumberInput = document.getElementById("buyerOrderNumber");
                            const emailInput = document.getElementById("email");
                            const priceInput = document.querySelector('input.p-inputnumber-input');
                            if (buyerOrderNumberInput) {
                                buyerOrderNumberInput.value = amazonOrderId;
                                console.log("Order ID alanına yazıldı:", amazonOrderId);
                            }
                            if (emailInput) {
                                emailInput.value = "keremyenicay0028@gmail.com";
                                console.log("Email alanına yazıldı: keremyenicay0028@gmail.com");
                            }
                            if (priceInput) {
                                priceInput.value = formattedTotal;
                                console.log("Fiyat alanına yazıldı:", formattedTotal);
                            }
                            const saveButton = Array.from(document.querySelectorAll('button'))
                                .find(btn => btn.innerText.trim().includes("Kaydet"));
                            if (saveButton) {
                                saveButton.click();
                                console.log("Kaydet butonuna tıklandı, sipariş bilgileri kaydedildi.");
                                // Verileri temizle (görev tamamlandı)
                                GM_deleteValue('amazonOrderId');
                                GM_deleteValue('amazonOrderTotal');
                                console.log("✅ Sipariş bilgileri temizlendi (görev tamamlandı)");
                            } else {
                                console.error("❌ Kaydet butonu bulunamadı.");
                            }
                        }, 500);
                    });
                    console.log("Düzenleme butonu için listener eklendi.");
                }
            }, 300);
        }
    }
})();
