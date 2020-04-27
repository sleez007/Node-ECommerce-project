const deleteProduct = (btn ) =>{
    console.log(btn.parentNode.querySelector('[name=productId]').value ) 
   // console.log(btn)
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement =btn.closest('article')

    fetch(`/admin/product/${prodId}`,{
        method : 'DELETE',
        headers : {
            'csrf-token' :csrf
        }
    }).then(result =>result.json())
    .then(data=>{
        console.log(data);
        productElement.parentNode.removeChild(productElement)
    })
    .catch(e=>console.log(e));
} 