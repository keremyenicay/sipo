(function () {
    'use strict';

    // AMAZON SAYFALARI
    if (window.location.host.includes("www.amazon.com")) {
        window.addEventListener('load', function () {
            // Yalnızca URL'de sipo=true varsa otomatik işleme devam etsin.
            const params = new URLSearchParams(window.location.search);
            if (params.get("sipo") !== "true") {
                return;
            }
            
            const url = window.location.href;

            // A. Ürün Detay Sayfası (/dp/): Adet ayarlanıp "Add to Cart" tıklanıyor.
            if (url.includes("/dp/")) {
                console.log("Ürün sayfası algılandı.");
                let quantitySet = false;
                let setQuantityInterval = setInterval(() => {
                    const quantitySelect = document.getElementById("quantity");
                    // Eğer dropdown varsa, URL'deki "quantity" parametresine göre seçimi yapalım.
                    if (quantitySelect) {
                        const quantityParam = params.get("quantity");
                        if (quantityParam && quantitySelect.querySelector(`option[value="${quantityParam}"]`)) {
                            quantitySelect.value = quantityParam;
                            quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                            console.log("Ürün adedi ayarlandı:", quantityParam);
                        }
                        quantitySet = true;
                    }
                    // Eğer adet ayarı yapıldıysa, "Add to Cart" tıklama işlemini başlat.
                    if (quantitySet) {
                        clearInterval(setQuantityInterval);
                        let tryAdd = setInterval(() => {
                            const addToCartBtn = document.getElementById('add-to-cart-button');
                            if (addToCartBtn) {
                                clearInterval(tryAdd);
                                setTimeout(() => {
                                    console.log("Add to Cart butonuna tıklanıyor...");
                                    addToCartBtn.click();
                                }, 500); // Biraz gecikme veriliyor.
                            }
                        }, 300);
                    }
                }, 300);
                return;
            }

            // B. Smart-Wagon Sayfası (/cart/smart-wagon):
            // İlk kez sayfa yüklendiğinde, otomatik yenileme yapıp, ardından "Go to Cart" linkine tıklayalım.
            if (url.includes("cart/smart-wagon")) {
                console.log("Smart-wagon sayfası algılandı.");
                const reloaded = localStorage.getItem("smartWagonReloaded");
                if (!reloaded) {
                    console.log("Smart-wagon sayfası yenileniyor (ilk giriş).");
                    localStorage.setItem("smartWagonReloaded", "true");
                    location.reload();
                    return;
                } else {
                    // Yenileme tamamlandıktan sonra bayrağı temizleyelim.
                    localStorage.removeItem("smartWagonReloaded");
                }
                let tryGoToCart = setInterval(() => {
                    const goToCartLink = document.querySelector("a[href='/cart?ref_=sw_gtc']");
                    if (goToCartLink) {
                        console.log("Go to Cart bulundu → tıklanıyor.");
                        clearInterval(tryGoToCart);
                        goToCartLink.click();
                    }
                }, 300);
                return;
            }

            // C. Cart Sayfası (/cart): Adet güncellemesi yapılarak Proceed to Checkout'a tıklanıyor.
            if (url.includes("/cart") && !url.includes("smart-wagon")) {
                console.log("Cart sayfası algılandı.");
                let tryCartUpdate = setInterval(() => {
                    // Aşağıdaki input, sepet içerisindeki ürün adedini gösteriyor.
                    const quantityInput = document.querySelector('input[name="quantityBox"]');
                    if (quantityInput) {
                        clearInterval(tryCartUpdate);
                        const desiredQuantity = params.get("quantity") || "1";
                        // Mevcut değerle istenen değer uyuşmuyorsa güncelleme yapalım.
                        if (quantityInput.value !== desiredQuantity) {
                            console.log("Cart'taki adet güncelleniyor. Yeni değer:", desiredQuantity);
                            quantityInput.value = desiredQuantity;
                            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
                            // Update butonunu tetikleyelim.
                            const updateButton = document.querySelector('.sc-quantity-update-button a');
                            if (updateButton) {
                                updateButton.click();
                                console.log("Update butonuna tıklandı.");
                            }
                        }
                        // Ürün adedi güncellendikten sonra Proceed to Checkout işlemini yapalım.
                        let tryProceed = setInterval(() => {
                            const proceedBtn = document.querySelector('input[name="proceedToRetailCheckout"]');
                            if (proceedBtn) {
                                clearInterval(tryProceed);
                                console.log("Proceed to Checkout butonuna tıklanıyor.");
                                proceedBtn.click();
                            }
                        }, 300);
                    }
                }, 300);
                return;
            }

            // D. Checkout İşlemleri: Chewbacca yönlendirmesi varsa işlemleri tamamlıyoruz.
            if (url.includes("/checkout/p/") && url.includes("pipelineType=Chewbacca")) {
                console.log("Chewbacca sayfası algılandı → Cheetah yönlendirmesi yapılıyor...");
                setTimeout(() => {
                    window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
                }, 100);
                return;
            }
        });
    }

    // SELLERFLASH SAYFASI: Affiliate Satın Al butonu işlemleri
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
                    if (!asin) {
                        alert("ASIN bulunamadı.");
                        return;
                    }
                    // URL’ye sipo=true ve quantity parametresi ekleniyor.
                    const affiliateURL = `https://www.amazon.com/dp/${asin}?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl&sipo=true&quantity=${quantity}`;
                    // Buton tıklanınca yeni sekmede ürün sayfası açılması sağlanıyor.
                    var a = document.createElement('a');
                    a.href = affiliateURL;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
