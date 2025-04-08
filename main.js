(function () {
    'use strict';

    // AMAZON SAYFALARI
    if (window.location.host.includes("www.amazon.com")) {
        window.addEventListener('load', function () {
            // Kod ancak URL'de sipo=true parametresi varsa çalışır
            const params = new URLSearchParams(window.location.search);
            if (params.get("sipo") !== "true") {
                return;
            }

            // URL’de quantity parametresi varsa, ürün sayfasındaki quantity dropdown’dan seçimi gerçekleştir
            const quantityParam = params.get("quantity");
            if (quantityParam) {
                let tryQuantity = setInterval(() => {
                    const quantitySelect = document.getElementById("quantity");
                    if (quantitySelect) {
                        clearInterval(tryQuantity);
                        if (quantitySelect.querySelector(`option[value="${quantityParam}"]`)) {
                            quantitySelect.value = quantityParam;
                            quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                }, 300);
            }

            const url = window.location.href;

            // 1️⃣ SMART-WAGON sayfası: Önce sayfayı 1 defa yenile
            if (url.includes("cart/smart-wagon")) {
                console.log("Smart-wagon sayfası algılandı.");
                const reloaded = sessionStorage.getItem("smartWagonReloaded");
                if (!reloaded) {
                    console.log("Sayfa yenileniyor (ilk giriş).");
                    sessionStorage.setItem("smartWagonReloaded", "true");
                    location.reload();
                    return;
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

            // 2️⃣ CART sayfası → Proceed to checkout
            if (url.includes("/cart") && !url.includes("smart-wagon")) {
                let tryProceed = setInterval(() => {
                    const proceedBtn = document.querySelector('input[name="proceedToRetailCheckout"]');
                    if (proceedBtn) {
                        console.log("Proceed to checkout bulundu → tıklanıyor.");
                        clearInterval(tryProceed);
                        proceedBtn.click();
                    }
                }, 300);
                return;
            }

            // 3️⃣ Checkout → Chewbacca → Cheetah yönlendirmesi
            if (url.includes("/checkout/p/") && url.includes("pipelineType=Chewbacca")) {
                console.log("Chewbacca sayfası algılandı → Cheetah'a yönlendiriliyor...");
                setTimeout(() => {
                    window.location.href = "https://www.amazon.com/gp/buy/addressselect/handlers/display.html?_from=cheetah";
                }, 100);
                return;
            }

            // 4️⃣ Ürün Detay sayfasında "Add to cart" butonunu tıklama (adet seçimi yapıldıktan sonra)
            const addToCartBtn = document.getElementById('add-to-cart-button');
            if (addToCartBtn) {
                console.log("Add to Cart butonuna tıklanıyor...");
                setTimeout(() => {
                    addToCartBtn.click();
                }, 200);
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

                    // sipo tetikleyici ve quantity parametresi eklenmiş URL
                    const affiliateURL = `https://www.amazon.com/dp/${asin}?th=1&linkCode=sl1&tag=newgrl0b-20&linkId=1f6d87753d9002b73e8d461aa9ffda14&language=en_US&ref_=as_li_ss_tl&sipo=true&quantity=${quantity}`;

                    // Yeni sekmede açmak için anchor elementi oluşturuluyor
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
