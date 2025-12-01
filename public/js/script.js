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

//show alert
const showAlert = document.querySelector("[show-alert]")
if(showAlert){
    const time = parseInt(showAlert.getAttribute("data-time"))
    const closeAlert = showAlert.querySelector("[close-alert]")
    setTimeout(()=>{
        showAlert.classList.add("alert-hidden")
    },time)
    closeAlert.addEventListener("click",() => {
        showAlert.classList.add("alert-hidden")
    })
}
//end show alert

buttonGoBack = document.querySelectorAll("[button-go-back]")
if(buttonGoBack.length >0) {
    buttonGoBack.forEach(button => {
        button.addEventListener('click',() => {
            history.back()
        })
    })
}