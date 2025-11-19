const formSearch = document.querySelector("#form-search")
if(formSearch){
    let url = new URL(window.location.href)
    formSearch.addEventListener("submit",(e) => {
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;

        if(keyword){
            url.searchParams.set("keyword",keyword)
        }else{
            url.searchParams.delete("keyword")
        }
        window.location.href = url.href;
    })
}

const buttonsPagination = document.querySelectorAll("[button-pagination]");
if(buttonsPagination){
    let url = new URL(window.location.href)
    buttonsPagination.forEach(button => {
        button.addEventListener("click",() => {
            const page = button.getAttribute("button-pagination")

            url.searchParams.set("page",page);

            window.location.href = url.href;
            
        })
    })
}


const formInput = document.querySelector("[form-quantity]")
const buttonBuyProduct = document.querySelector("[buy-product]")
const buttonAddToCart = document.querySelector("[productAddToCart]")

buttonBuyProduct.addEventListener('click',()=>{
    const path = buttonBuyProduct.getAttribute('path');
    formInput.action = path;
    formInput.submit();
})

buttonAddToCart.addEventListener('click',()=>{
    const path = buttonAddToCart.getAttribute('path');
    formInput.action = path;
    formInput.submit();
})
